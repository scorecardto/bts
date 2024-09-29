import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import { ClubMembership } from "../../models/ClubMembership";

export default async function changeMember(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = `${req.fields?.internalCode}`;
  const action = `${req.fields?.action}`;
  const membershipId = `${req.fields?.membershipId}`;

  const uid = user.uid;

  const club = await ClubModel.findOne({
    where: [
      {
        internal_code: internal_code,
      },
    ],
  });

  if (!club) {
    res.status(400).send("Club not found");
    return;
  }

  if (club.owner !== uid) {
    res.status(401).send("Cannot manage members in this club");
    return;
  }

  if (action === "PROMOTE") {
    const membership = await ClubMembership.findOne({
      where: {
        id: membershipId,
        club: club.id,
      },
    });

    if (!membership) {
      res.status(400).send("Membership not found");
      return;
    }

    membership.manager = true;
    await membership.save();

    res.send({
      result: "success",
    });
    return;
  } else if (action === "DEMOTE") {
    const membership = await ClubMembership.findOne({
      where: {
        id: membershipId,
        club: club.id,
      },
    });

    if (!membership) {
      res.status(400).send("Membership not found");
      return;
    }

    membership.manager = false;
    await membership.save();

    res.send({
      result: "success",
    });
    return;
  } else {
    res.status(400).send("Action does not exist");
    return;
  }
}
