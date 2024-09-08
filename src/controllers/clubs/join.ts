import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { ClubMembership } from "../../models/ClubMembership";
import { Op } from "sequelize";
import { UserSchool } from "../../models/UserSchool";

export default async function joinClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = req.fields?.internalCode;
  const email = req.fields?.email;

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
        internal_code: internal_code,
      },
    ],
  });

  if (!existing) {
    res.status(400).send("Club with this identifier does not exist");
    return;
  }

  const existingMembership = await ClubMembership.findOne({
    where: {
      club: existing.id,
      [Op.or]: email
        ? [{ email }, { phone_number: user.phone_number! }]
        : [{ phone_number: user.phone_number! }],
    },
  });

  if (existingMembership) {
    res.status(500).send("User is already member of this club");
    return;
  }

  const membership = await ClubMembership.create({
    email: email ? `${email}` : undefined,
    phone_number: user.phone_number!,
    club: existing.id,
    first_name: userSchool?.first_name || undefined,
    last_name: userSchool?.last_name || undefined,
  });
  res.send({
    result: "success",
  });
}
