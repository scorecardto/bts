import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { School } from "../../models/School";

export default async function createClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const name = req.fields?.name;
  const ticker = `${req.fields?.ticker}`;

  if (ticker.length > 10) {
    res.send({
      result: "TOO LONG",
    });
    return;
  }

  if (ticker.length < 2) {
    res.send({
      result: "TOO SHORT",
    });
    return;
  }

  const pattern = /^[A-Z0-9]{2,10}$/;

  if (!pattern.test(ticker)) {
    res.send({
      result: "INCORRECT FORMAT",
    });
    return;
  }

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  const existing = await Club.findOne({
    where: [
      {
        school: schoolName,
        ticker: ticker,
      },
    ],
  });

  if (existing) {
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
