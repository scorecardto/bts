import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { School } from "../../models/School";

export default async function createClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const name = req.fields?.name;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  const existing = await Club.findOne({
    where: [
      {
        owner: uid,
      },
    ],
  });

  if (existing) {
    res.status(400).send("User already owns a club");
    return;
  } else {
    const club = await Club.create({
      name: `${name || ""}`,
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
