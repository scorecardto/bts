import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import { ClubPost } from "../../models/ClubPost";
import { ClubPostInternal } from "scorecard-types";
import createClubMassText from "../../private/sms/createClubMassText";
import sendMailMessage from "../../private/mail/sendMailMessage";
import createClubMassMail from "../../private/mail/createClubMassMail";

export default async function createClubPost(req: Request, res: Response) {
  const VALID_OPTIONS = ["BASIC", "PROMOTE"];

  const user = await requireAuth(req, res);
  if (!user) return;

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
  });

  if (!existing) {
    res.status(400).send("Club with this identifier does not exist");
    return;
  }

  if (existing.owner !== user.uid) {
    res.status(401).send("User cannot modify this club");
    return;
  }

  if (club.internalCode) {
    await ClubPost.create({
      club: existing.id,
      content: `${content}`,
      event_date: eventDate,
      promotion_option: promotionOption,
      link: link ? `${link}` : undefined,
      picture: picture ? `${picture}` : undefined,
    });
  }

  if (promotionOption === "PROMOTE") {
    createClubMassMail(post, existing.id);
    createClubMassText(post, existing.id);
  }

  res.send({
    result: "success",
  });
}
