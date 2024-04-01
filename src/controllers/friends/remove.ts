import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Friendship } from "../../models/Friendship";
import { FriendRequest } from "../../models/FriendRequest";
import checkUserExists from "../../auth/checkUserExists";
import getUserFromPhoneNumber from "../../auth/getUserFromPhoneNumber";
import phoneStd from "phone";

export default async function removeFriend(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { shouldBlock } = req.fields ?? {};

  let person = `${req.fields?.person || ""}` || null;
  const rawPhoneNumber = req.fields?.phoneNumber;

  const formattedPhoneNumber = phoneStd(`${rawPhoneNumber}`);

  const phoneNumber = formattedPhoneNumber.isValid
    ? formattedPhoneNumber.phoneNumber
    : null;

  if (person == null && phoneNumber == null) {
    res.status(400).send("No user provided");
    return;
  }

  if (person == null && phoneNumber != null) {
    const personRecord = await getUserFromPhoneNumber(phoneNumber);

    if (personRecord != null) {
      person = `${personRecord.uid}`;
    }
  }

  if (person != null) {
    const personExists = await checkUserExists(`${person}`);

    if (!personExists) {
      res.status(404).send("User not found");
      return;
    }

    // check if this person is already a friend
    // if so, make the friendship inactive OR block the user
    // otherwise, create a block-relationship friendship
    // also, check if this person has a friend request (if so, delete it)
    // also, check if this person has already sent a friend request (if so, delete it)

    const friendship = await Friendship.findOne({
      where: [
        {
          to_uid: person,
          from_uid: user.uid,
          active: true,
        },
      ],
    });

    const reverseFriendship = await Friendship.findOne({
      where: [
        {
          to_uid: user.uid,
          from_uid: person,
          active: true,
        },
      ],
    });

    if (friendship) {
      if (shouldBlock) {
        await friendship.update({ blocked: true });
      } else {
        await friendship.update({ active: false });
      }
    } else {
      await Friendship.create({
        to_uid: `${person}`,
        from_uid: user.uid,
        active: false,
        blocked: `${shouldBlock}` === "true",
      });
    }

    if (reverseFriendship) {
      await reverseFriendship.update({ active: false });
    }

    const friendRequest = await FriendRequest.findOne({
      where: [
        {
          from_uid: user.uid,
          to_uid: person,
          active: true,
        },
      ],
    });

    if (friendRequest) {
      await friendRequest.update({ active: false });
    }

    const reverseRequest = await FriendRequest.findOne({
      where: [
        {
          from_uid: person,
          to_uid: user.uid,
          active: true,
        },
      ],
    });

    if (reverseRequest) {
      await reverseRequest.update({ active: false });
    }

    res.send({
      result: "success",
    });
  } else if (phoneNumber) {
    const existingRequest = await FriendRequest.findOne({
      where: [
        {
          from_uid: user.uid,
          to_phone_number: phoneNumber,
          active: true,
        },
      ],
    });

    if (existingRequest) {
      await existingRequest.update({ active: false });
    }

    res.send({
      result: "success",
    });
  }
}
