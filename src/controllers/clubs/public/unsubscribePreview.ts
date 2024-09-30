import { Request, Response } from "express";
import { Club } from "../../../models/Club";
import { ClubUnsubscribeLink } from "../../../models/ClubUnsubscribeLink";
import { ClubPost } from "../../../models/ClubPost";

export default async function getUnsubscribePreview(
  req: Request,
  res: Response
) {
  const unsubscribeCode = `${req.query.unsubscribeCode}`;

  const link = await ClubUnsubscribeLink.findOne({
    where: { code: unsubscribeCode },
  });

  if (!link) {
    res.status(404).send("Unsubscribe link not found");
    return;
  }

  const post = await ClubPost.findOne({ where: { id: link.post } });

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  const club = await Club.findOne({ where: { id: post.club } });

  if (!club) {
    res.status(404).send("Club not found");
    return;
  }

  let picture = undefined;
  let emoji = undefined;
  let heroColor = undefined;

  try {
    picture = JSON.parse(club.metadata).picture;
    emoji = JSON.parse(club.metadata).emoji;
    heroColor = JSON.parse(club.metadata).heroColor;
  } catch (e) {}

  return res.send({
    result: "success",
    internalCode: club.internal_code,
    clubPicture: picture,
    emoji,
    heroColor,
  });
}
