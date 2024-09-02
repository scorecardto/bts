import { Request, Response } from "express";
import { Club } from "../../../models/Club";

export default async function getClubDownloadPromo(
  req: Request,
  res: Response
) {
  const internalCode = `${req.query.internalCode}`;

  const club = await Club.findOne({ where: { internal_code: internalCode } });

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
    clubPicture: picture,
    emoji,
    heroColor,
  });
}
