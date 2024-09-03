import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club, ClubPost } from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Op, Sequelize } from "sequelize";
import { ClubPost as ClubPostModel } from "../../models/ClubPost";
export default async function listClubs(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const clubs: { [x: string]: Club } = {};

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
    clubs[cm.id] = {
      name: cm.name,
      clubCode: cm.club_code,
      internalCode: cm.internal_code,
      // @ts-ignore
      isMember: cm.dataValues.isMember,
      isOwner: cm.owner === uid,
      // @ts-ignore
      memberCount: cm.dataValues.memberCount,
      picture: JSON.parse(cm.metadata).picture,
      bio: JSON.parse(cm.metadata).bio,
      heroColor: JSON.parse(cm.metadata).heroColor,
      link: JSON.parse(cm.metadata).link,
      emoji: JSON.parse(cm.metadata).emoji,
      posts: [],
    };
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const recentPostsSubquery = await ClubPostModel.findAll({
    attributes: [
      "club",
      [Sequelize.fn("MAX", Sequelize.col("createdAt")), "recentPostDate"],
    ],
    where: {
      club: {
        [Op.in]: Object.keys(clubs),
      },
      [Op.or]: [
        {
          // @ts-ignore
          createdAt: { [Op.gte]: oneDayAgo },
        },
        {
          [Op.and]: [
            {
              event_date: { [Op.lte]: inThreeDays },
            },
          ],
        },
      ],
    },
    group: ["club"],
  });

  const recentPosts = await ClubPostModel.findAll({
    where: {
      [Op.or]: recentPostsSubquery.map((item) => {
        return {
          club: item.club,
          // @ts-ignore
          createdAt: item.dataValues.recentPostDate,
        };
      }),
    },
  });

  const recentPostsFormatted: ClubPost[] = recentPosts.map((p) => {
    return {
      content: p.content,
      // @ts-ignore
      postDate: p.dataValues.createdAt?.getTime(),
      eventDate: p.event_date?.getTime(),
      link: p.link,
      picture: p.picture,
      club: clubs[p.club],
    };
  });

  res.send({
    result: "success",
    clubs: Object.values(clubs),
    recentPosts: recentPostsFormatted,
  });
}
