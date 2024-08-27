import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { School } from "../../models/School";

import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { ClubPost } from "../../models/ClubPost";

export default async function createClubPost(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const clubId = req.fields?.clubId;
  const content = req.fields?.content;
  const link = req.fields?.link;
  const picture = req.fields?.picture;
  const eventDate = new Date(`${req.fields?.picture}`);

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const existing = await Club.findOne({
    where: [
      {
        school: schoolName,
        ticker: clubId,
      },
    ],
  });

  if (!existing) {
    res.status(400).send("Club with this ticker does not exist at user school");
    return;
  }

  if (clubId) {
    await ClubPost.create({
      club: existing.id,
      content: `${content}`,
      eventDate,
      link: link ? `${link}` : undefined,
      picture: picture ? `${picture}` : undefined,
    });
  }

  res.send({
    result: "success",
  });
}
