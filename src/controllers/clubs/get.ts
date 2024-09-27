import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club, ClubBase, ClubPost } from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";
import { ClubPost as ClubPostModel } from "../../models/ClubPost";

export default async function getClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = `${req.query.internalCode}`;

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
              + (
                SELECT COUNT(*)
                FROM club_email_enrollments AS ClubEmailEnrollment
                WHERE ClubEmailEnrollment.club = Club.id
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

  const posts = await ClubPostModel.findAll({
    where: {
      club: club.id,
    },
    order: [["createdAt", "DESC"]],
  });

  // @ts-ignores
  console.log(club.dataValues.posts);

  const clubMetadata = JSON.parse(club.metadata);

  const base: ClubBase = {
    clubCode: club.club_code,
    name: club.name,
    picture: clubMetadata?.picture || "",
    emoji: clubMetadata?.emoji || "",
    heroColor: clubMetadata?.heroColor || "",
    internalCode: club.internal_code,
    verified: club.verified ?? false,
    official: club.official ?? false,
  };

  const returnItem: Club = {
    ...base,
    // @ts-ignore
    isMember: club.dataValues.isMember,
    isOwner: club.owner === uid,
    // @ts-ignore
    memberCount: club.dataValues.memberCount,
    posts: posts.map((p): ClubPost => {
      return {
        club: base,
        content: p.content,
        // @ts-ignore
        postDate: p.dataValues.createdAt.getTime(),
        link: p.link,
        picture: p.picture,
        eventDate: p.event_date?.getTime() ?? undefined,
      };
    }),
    bio: clubMetadata?.bio || "",
    link: clubMetadata?.link || "",
  };

  res.send({
    result: "success",
    club: returnItem,
  });
}
