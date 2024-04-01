import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Friendship } from "../../models/Friendship";
import checkUserExists from "../../auth/checkUserExists";
import { FriendRequest } from "../../models/FriendRequest";

export default async function getRequests(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const inbound = await FriendRequest.findAll({
    where: [
      {
        to_uid: user.uid,
        active: true,
      },
      {
        to_phone_number: user.phone_number,
        active: true,
      },
    ],
  });

  const outbound = await FriendRequest.findAll({
    where: [
      {
        from_uid: user.uid,
        active: true,
      },
    ],
  });

  res.send({
    result: "success",
    inbound: inbound.map((request) => ({
      uid: request.from_uid,
    })),
    outbound: outbound.map((request) => ({
      uid: request.to_uid,
      phone_number: request.to_phone_number,
    })),
  });
}
