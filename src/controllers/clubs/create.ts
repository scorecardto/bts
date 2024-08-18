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
  const pattern = /^[A-Z0-9]{2,10}$/;

  if (!pattern.test(ticker)) {
    res.status(400).send("Inproper ticker format");
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
    res.status(400).send("Club with this ticker at this school already exists");
    return;
  } else {
    const club = await Club.create({
      name: `${name || ""}`,
      ticker: `${ticker || ""}`,
      owner: uid,
      school: schoolName,
      metadata: "{}",
    });

    res.send({
      result: "success",
      club: club,
    });
  }
}
