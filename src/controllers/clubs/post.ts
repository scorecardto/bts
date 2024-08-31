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

  const internal_code = req.fields?.internalCode;
  const content = req.fields?.content;
  const link = req.fields?.link;
  const picture = req.fields?.picture;
  const eventDate = new Date(`${req.fields?.picture}`);

  const existing = await Club.findOne({
    where: [
      {
        internal_code,
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

  if (internal_code) {
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
