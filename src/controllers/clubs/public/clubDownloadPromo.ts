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

  try {
    picture = JSON.parse(club.metadata).clubPicture;
  } catch (e) {}

  return res.send({
    result: "success",
    clubPicture: picture,
  });
}
