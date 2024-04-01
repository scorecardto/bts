import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Friendship } from "../../models/Friendship";
import checkUserExists from "../../auth/checkUserExists";
import { FriendRequest } from "../../models/FriendRequest";

export default async function listFriends(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const friendships = await Friendship.findAll({
    where: [
      {
        from_uid: user.uid,
        active: true,
        blocked: false,
      },
    ],
  });

  res.send({
    result: "success",
    friends: friendships.map((friendship) => ({
      uid: friendship.to_uid,
    })),
  });
}
