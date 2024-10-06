import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import { ClubPost } from "../../models/ClubPost";
import { ClubPostInternal } from "scorecard-types";
import createClubMassText from "../../private/sms/createClubMassText";
import sendMailMessage from "../../private/mail/sendMailMessage";
import createClubMassMail from "../../private/mail/createClubMassMail";
import { Sequelize } from "sequelize";
import { ClubMembership } from "../../models/ClubMembership";
import createClubMassPush from "../../private/push/createClubMassPush";
import smartTruncate from "smart-truncate";

export default async function createClubPost(req: Request, res: Response) {
  const VALID_OPTIONS = ["BASIC", "PROMOTE"];

  const user = await requireAuth(req, res);
  if (!user) return;

  // @ts-ignore
  const customSubject: string = req.fields?.subject;

  // @ts-ignore
  const post: ClubPostInternal | null = req.fields?.post;

  if (!post) {
    res.status(500).send("Post is corrupted");
    return;
  }

  const promotionOptionRaw = post.promotionOption;

  const promotionOption = VALID_OPTIONS.includes(promotionOptionRaw)
    ? promotionOptionRaw
    : VALID_OPTIONS[0];

  const { club, content, link, picture } = post;

  console.log(post);

  const eventDateRaw = post.eventDate;
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : undefined;

  const existing = await Club.findOne({
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
  if (existing.owner !== user.uid && !existing.dataValues.isManager) {
    res.status(401).send("User cannot modify this club");
    return;
  }

  const postInDb = await ClubPost.create({
    club: existing.id,
    content: `${content}` || " ",
    event_date: eventDate,
    promotion_option: promotionOption,
    link: link ? `${link}` : undefined,
    picture: picture ? `${picture}` : undefined,
  });

  if (promotionOption === "PROMOTE") {
    createClubMassMail(
      post,
      existing.id,
      postInDb.id,
      customSubject
        ? smartTruncate(customSubject, 64)
        : `New Announcement in #${existing.club_code}`
    ).catch(() => {
      console.log("mass mail failed");
    });
    createClubMassText(post, existing.id).catch(() => {
      console.log("mass text failed");
    });
    createClubMassPush(post, existing.id).catch(() => {
      console.log("mass push failed");
    });
  }

  res.send({
    result: "success",
  });
}
