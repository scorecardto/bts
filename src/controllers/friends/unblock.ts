import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Friendship } from "../../models/Friendship";
import checkUserExists from "../../auth/checkUserExists";
import { FriendRequest } from "../../models/FriendRequest";

export default async function unblockFriend(req: Request, res: Response) {
  const { person } = req.fields ?? {};

  if (person == null) {
    res.status(400).send("No user provided");
    return;
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const friendship = await Friendship.findOne({
    where: [
      {
        to_uid: person,
        from_uid: user.uid,
        active: true,
      },
    ],
  });

  if (!friendship) {
    res.status(404).send("User not found");
    return;
  }

  if (!friendship.blocked) {
    res.status(400).send("User not blocked");
    return;
  }

  await friendship.update({ blocked: false });

  res.send({
    result: "success",
  });
}
