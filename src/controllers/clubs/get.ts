import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club } from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";

export default async function getClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const clubCode = `${req.query.clubCode}`;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (schoolName == null) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const club = await ClubModel.findOne({
    where: [
      {
        school: schoolName,
        ticker: clubCode,
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
  });

  if (!club) {
    res.status(400).send("Club not found");
    return;
  }

  const clubMetadata = JSON.parse(club.metadata);

  const returnItem: Club = {
    code: clubCode,
    // @ts-ignore
    isMember: club.dataValues.isMember,
    isOwner: club.owner === uid,
    // @ts-ignore
    memberCount: club.dataValues.memberCount,
    posts: [],
    name: club.name,
    bio: clubMetadata?.bio || "",
    heroColor: clubMetadata?.heroColor || "",
    link: clubMetadata?.link || "",
    picture: clubMetadata?.picture || "",
    emoji: clubMetadata?.emoji || "",
  };

  res.send({
    result: "success",
    club: returnItem,
  });
}
