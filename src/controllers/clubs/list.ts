import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";

export default async function listClubs(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  const clubs = await Club.findAll({
    where: [
      {
        school: schoolName,
      },
    ],
  });

  res.send({
    result: "success",
    clubs,
  });
}
