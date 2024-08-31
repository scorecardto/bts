import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { ClubMembership } from "../../models/ClubMembership";

export default async function joinClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = req.fields?.internalCode;

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
        internal_code: internal_code,
      },
    ],
  });

  if (!existing) {
    res.status(400).send("Club with this identifier does not exist");
    return;
  }

  const membership = await ClubMembership.create({
    phone_number: user.phone_number!,
    club: existing.id,
  });
  res.send({
    result: "success",
  });
}
