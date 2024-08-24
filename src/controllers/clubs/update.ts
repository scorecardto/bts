import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import { Club } from "scorecard-types";
import getUserSchool from "../../private/school/getUserSchool";
import { ClubMembership } from "../../models/ClubMembership";

export default async function updateClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  // @ts-ignore
  const club: Club = req.fields?.club;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const existing = await ClubModel.findOne({
    where: [
      {
        school: schoolName,
        ticker: club.code,
      },
    ],
  });

  if (!existing) {
    res.status(400).send("Club with this ticker does not exist at user school");
    return;
  }

  if (existing.owner !== uid) {
    res.status(400).send("User does not have permission to edit club");
    return;
  }

  existing.metadata = JSON.stringify({
    heroColor: club.heroColor,
    link: club.link,
    picture: club.picture,
    bio: club.bio,
    emoji: club.emoji,
  });

  existing.name = club.name;

  existing.save();

  res.send({
    result: "success",
  });
}
