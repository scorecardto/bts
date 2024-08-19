import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club } from "scorecard-types";
export default async function listClubs(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const clubs: Club[] = [];

  (
    await ClubModel.findAll({
      where: [
        {
          school: schoolName,
        },
      ],
    })
  ).forEach((cm) => {
    clubs.push({
      name: cm.name,
      code: cm.ticker,
      isMember: false,
      isOwner: false,
      memberCount: 0,
      posts: [],
    });
  });

  res.send({
    result: "success",
    clubs,
  });
}
