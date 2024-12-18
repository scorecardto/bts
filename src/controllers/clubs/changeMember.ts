import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import { ClubMembership } from "../../models/ClubMembership";
import {Sequelize} from "sequelize";
import {ClubEmailEnrollment} from "../../models/ClubEmailEnrollment";

export default async function changeMember(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = `${req.fields?.internalCode}`;
  const action = `${req.fields?.action}`;
  const membershipId = `${req.fields?.membershipId || ''}`;
  const enrollmentEmail = `${req.fields?.enrollmentEmail || ''}`;

  if (membershipId && enrollmentEmail) {
    res.status(400).send("Cannot provide both membership and email enrollment");
    return;
  }
  if (!membershipId && !enrollmentEmail) {
    res.status(400).send("Must provide membership or email enrollment");
    return;
  }

  const uid = user.uid;

  const club = await ClubModel.findOne({
    where: [
      {
        internal_code: internal_code,
      },
    ],
    include: [
      {
        model: ClubMembership,
        required: false,
        where: {
          phone_number: user.phone_number,
        },
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [
          Sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM club_memberships AS ClubMembership
            WHERE ClubMembership.club = Club.id
            AND ClubMembership.manager = TRUE
            AND ClubMembership.phone_number = '${user.phone_number}'
          )
        `),
          "isManager",
        ],
      ],
    }
  });

  if (!club) {
    res.status(400).send("Club not found");
    return;
  }

  const isOwner = club.owner === uid;
  // @ts-ignore
  const isManager = club.dataValues.isManager;


  if (action === "PROMOTE") {
    if (!isOwner) {
      res.status(401).send("Cannot manage members in this club");
      return;
    }
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
    if (!isOwner) {
      res.status(401).send("Cannot manage members in this club");
      return;
    }
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
  } else if (action === "REMOVE") {
    if (!isOwner && !isManager) {
      res.status(401).send("Cannot manage members in this club");
      return;
    }
    const membership = await ClubMembership.findOne({
      where: {
        id: membershipId,
        club: club.id,
      },
    });
    const enrollment = await ClubEmailEnrollment.findOne({
      where: {
        email: enrollmentEmail,
        club: club.id,
      }
    })
    if (!membership && !enrollment) {
      res.status(400).send("Membership not found");
      return;
    }

    if (membership) await membership.destroy();
    if (enrollment) await enrollment.destroy();

    res.send({
      result: "success",
    });
    return;
  } else {
    res.status(400).send("Action does not exist");
    return;
  }
}
