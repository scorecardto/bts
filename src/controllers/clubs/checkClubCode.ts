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

export default async function checkClubCode(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const code = `${req.fields?.clubCode}`;

  if (code.length > 10) {
    res.send({
      result: "TOO LONG",
    });
    return;
  }

  if (code.length < 2) {
    res.send({
      result: "TOO SHORT",
    });
    return;
  }

  const pattern = /^[A-Z0-9]{2,10}$/;

  if (!pattern.test(code)) {
    res.send({
      result: "INCORRECT FORMAT",
    });
    return;
  }

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
        club_code: code,
      },
    ],
  });

  if (existing || matcher.hasMatch(code)) {
    res.send({
      result: "TAKEN",
    });
    return;
  } else {
    res.send({
      result: "success",
    });
  }
}
