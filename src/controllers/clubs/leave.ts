import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { ClubMembership } from "../../models/ClubMembership";
import { Op } from "sequelize";
import { UserSchool } from "../../models/UserSchool";

export default async function leaveClub(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = req.fields?.internal_code;

  const existing = await Club.findOne({
    where: [
      {
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
      phone_number: user.phone_number!,
    },
  });

  if (!existingMembership) {
    res.status(500).send("User is not a member of this club");
    return;
  }

  existingMembership.destroy();

  res.send({
    result: "success",
  });
}
