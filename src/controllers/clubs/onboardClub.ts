import { Request, Response } from "express";
import phone from "phone";
import getFirebase from "../../firebase/getFirebase";
import { Club } from "../../models/Club";

import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const DEFAULT_SCHOOL_NAME =
  "austin.erp.frontlineeducation.com-Liberal Arts and Science Academy";

export default async function onboardClub(req: Request, res: Response) {
  const phone_number_raw = req.fields?.phone_number;
  const { club_name } = req.fields ?? {};
  const club_code = `${req.fields?.club_code}`;

  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const pattern = /^[A-Z0-9]{2,10}$/;

  if (!pattern.test(club_code)) {
    res.status(400).send("Inproper club code format");
    return;
  }

  const phone_number_check = phone(`${phone_number_raw}`);
  if (!phone_number_check.isValid) {
    res.status(400).send("Phone number is not valid");
    return;
  }
  const phone_number = phone_number_check.phoneNumber!;

  const f = getFirebase();

  let uid = "";
  try {
    const user = await f.auth().getUserByPhoneNumber(phone_number);
    uid = user.uid;
  } catch (e) {
    const user = await f.auth().createUser({
      phoneNumber: phone_number,
    });

    uid = user.uid;
  }

  const existing = await Club.findOne({
    where: [
      {
        school: DEFAULT_SCHOOL_NAME,
        club_code,
      },
    ],
  });

  if (existing || matcher.hasMatch(club_code)) {
    res.status(400).send("Club with this ticker at this school already exists");
    return;
  } else {
    const club = await Club.create({
      name: `${club_name || ""}`,
      club_code: `${club_code || ""}`,
      owner: uid,
      school: DEFAULT_SCHOOL_NAME,
      metadata: `{"bio":"Created automatically during club fair.","emoji":"🌱"}`,
    });
    res.send({
      result: "success",
      club: club,
    });
    return;
  }
}
