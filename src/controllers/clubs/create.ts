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
import { ClubMembership } from "../../models/ClubMembership";
import { UserSchool } from "../../models/UserSchool";

export default async function createClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const email = req.fields?.email;
  const name = req.fields?.name;

  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const club_code = `${req.fields?.clubCode}`;
  const pattern = /^[A-Z0-9]{2,10}$/;

  if (!pattern.test(club_code)) {
    res.status(400).send("Inproper club code format");
    return;
  }

  const uid = user.uid;

  const userSchool = await UserSchool.findOne({
    where: {
      uid: uid,
    },
  });

  const schoolName = userSchool?.school || null;

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const existing = await Club.findOne({
    where: [
      {
        school: schoolName,
        club_code,
      },
    ],
  });

  if (existing || matcher.hasMatch(club_code)) {
    res.status(400).send("Club with this ticker at this school already exists");
    return;
  } else {
    const club = await Club.create({
      name: `${name || ""}`,
      club_code: `${club_code || ""}`,
      owner: uid,
      school: schoolName,
      metadata: "{}",
    });

    const clubMembership = await ClubMembership.create({
      club: club.id,
      phone_number: user.phone_number!,
      first_name: userSchool?.first_name || undefined,
      last_name: userSchool?.last_name || undefined,
      email: email ? `${email}` : undefined,
    });

    res.send({
      result: "success",
      club: club,
    });
  }
}
