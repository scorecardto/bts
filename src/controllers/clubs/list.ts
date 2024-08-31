import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club } from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";
export default async function listClubs(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const clubs: Club[] = [];

  (
    await ClubModel.findAll({
      where: [
        {
          school: schoolName,
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
            AND ClubMembership.phone_number = '${user.phone_number}'
          )
        `),
            "isMember",
          ],
          [
            Sequelize.literal(`
              (
                SELECT COUNT(*)
                FROM club_memberships AS ClubMembership
                WHERE ClubMembership.club = Club.id
              )
            `),
            "memberCount",
          ],
        ],
      },
    })
  ).forEach((cm) => {
    clubs.push({
      name: cm.name,
      clubCode: cm.club_code,
      internalCode: cm.internal_code,
      // @ts-ignore
      isMember: cm.dataValues.isMember,
      isOwner: cm.owner === uid,
      // @ts-ignore
      memberCount: cm.dataValues.memberCount,
      picture: JSON.parse(cm.metadata).picture,
      posts: [],
    });
  });

  res.send({
    result: "success",
    clubs,
  });
}
