import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import { Club } from "scorecard-types";
import getUserSchool from "../../private/school/getUserSchool";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";
import {ClubEmailEnrollment} from "../../models/ClubEmailEnrollment";
import {ClubPost} from "../../models/ClubPost";
import {ClubUnsubscribeLink} from "../../models/ClubUnsubscribeLink";

export default async function deleteClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  // @ts-ignore
  const club: Club = req.fields?.club;

  const uid = user.uid;

  const existing = await ClubModel.findOne({
    where: [
      {
        internal_code: club.internalCode,
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
    },
  });

  if (!existing) {
    res.status(400).send("Club with this identifier does not exist");
    return;
  }

  // @ts-ignore
  if (existing.owner !== uid && !existing.dataValues.isManager) {
    res.status(401).send("User does not have permission to edit club");
    return;
  }

  (await ClubMembership.findAll({where: {
      club: existing.id,
  }})).forEach(m => m.destroy());
  (await ClubEmailEnrollment.findAll({where: {
      club: existing.id,
  }})).forEach(m => m.destroy());

  const totalIds: number[] = [];
  (await ClubPost.findAll({where: {
      club: existing.id,
  }})).forEach(m => {
    totalIds.push(m.id);
    m.destroy()
  });
  for (const id of totalIds) {
    (await ClubUnsubscribeLink.findAll({where: {
        id: id,
      }})).forEach(m => m.destroy());
  }
  await existing.destroy();

  res.send({
    result: "success",
  });
}
