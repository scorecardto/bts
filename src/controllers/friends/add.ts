import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Friendship } from "../../models/Friendship";
import checkUserExists from "../../auth/checkUserExists";
import { FriendRequest } from "../../models/FriendRequest";
import phoneStd from "phone";
import getUserFromPhoneNumber from "../../auth/getUserFromPhoneNumber";
export default async function addFriend(req: Request, res: Response) {
  const rawPhoneNumber = req.fields?.phoneNumber;

  const formattedPhoneNumber = phoneStd(`${rawPhoneNumber}`);

  const phoneNumber = formattedPhoneNumber.isValid
    ? formattedPhoneNumber.phoneNumber
    : null;

  let person = `${req.fields?.person || ""}` || null;

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

  const user = await requireAuth(req, res);
  if (!user) return;

  // check if this person is already a friend
  // check if this person has a friend request (if so, add them as a friend)
  // check if this person has already sent a friend request (if so, send an error)
  // if none of the above, send a friend request
  // as long as the person exists

  if (person) {
    const friendship = await Friendship.findOne({
      where: [
        {
          to_uid: user.uid,
          from_uid: person,
          active: true,
        },
      ],
    });

    if (friendship?.blocked) {
      res.status(404).send("User not found");
      return;
    } else if (friendship) {
      res.status(400).send("Already friends");
      return;
    }

    const reverseFriendship = await Friendship.findOne({
      where: [
        {
          to_uid: person,
          from_uid: user.uid,
          active: true,
        },
      ],
    });

    if (reverseFriendship?.blocked) {
      res.status(404).send("User not found");
      return;
    } else if (reverseFriendship) {
      res.status(400).send("Already friends");
      return;
    }

    const existingRequest = await FriendRequest.findOne({
      where: [
        {
          from_uid: user.uid,
          to_uid: person,
          active: true,
        },
        ...(phoneNumber
          ? [
              {
                from_uid: user.uid,
                to_phone_number: phoneNumber,
                active: true,
              },
            ]
          : []),
      ],
    });

    if (existingRequest) {
      res.status(400).send("Friend request already sent");
      return;
    }

    const reverseRequest = await FriendRequest.findOne({
      where: [
        {
          from_uid: person,
          to_uid: user.uid,
          active: true,
        },
        {
          from_uid: person,
          to_phone_number: user.phoneNumber,
          active: true,
        },
      ],
    });

    if (reverseRequest) {
      reverseRequest.update({
        active: false,
      });

      await Friendship.bulkCreate([
        {
          from_uid: user.uid,
          to_uid: `${person}`,
          active: true,
          blocked: false,
        },
        {
          from_uid: `${person}`,
          to_uid: user.uid,
          active: true,
          blocked: false,
        },
      ]);

      res.send({
        result: "success",
        status: "friends",
      });
    }

    const userExists = await checkUserExists(`${person}`);

    if (userExists == false) {
      res.status(404).send("User not found");
      return;
    }

    await FriendRequest.create({
      from_uid: user.uid,
      to_uid: `${person}`,
      active: true,
    });

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
      res.status(400).send("Friend request already sent");
      return;
    } else {
      await FriendRequest.create({
        from_uid: user.uid,
        to_phone_number: phoneNumber,
        active: true,
      });

      res.send({
        result: "success",
      });
    }
  }
}
