import { Request, Response } from "express";
import requireAuth from "../../../auth/requireAuth";
import { Club } from "../../../models/Club";
import getUserSchool from "../../../private/school/getUserSchool";
import { ClubMembership } from "../../../models/ClubMembership";
import { Op } from "sequelize";
import phone from "phone";
import { validate } from "email-validator";

export default async function joinClubPublic(req: Request, res: Response) {
  const internalCodeRaw = req.fields?.internal_code;

  if (!internalCodeRaw) {
    return res.status(400).send("NO_INTERNAL_CODE");
  }

  const internalCode = `${internalCodeRaw}`;
  const phone_number_raw = req.fields?.phone_number;
  const email_raw = `${req.fields?.email}`;
  const first_name = req.fields?.first_name
    ? `${req.fields?.first_name}`
    : undefined;
  const last_name = req.fields?.last_name
    ? `${req.fields?.last_name}`
    : undefined;

  if (!phone_number_raw) {
    return res.status(400).send("NO_PHONE_NUMBER");
  }

  // @ts-ignore
  const phone_number_parsed = phone(phone_number_raw);

  if (!phone_number_parsed.isValid) {
    return res.status(400).send("INVALID_PHONE_NUMBER");
  }

  const phone_number = phone_number_parsed.phoneNumber;

  if (!email_raw) {
    return res.status(400).send("NO_EMAIL");
  }

  if (!validate(email_raw)) {
    return res.status(400).send("INVALID_EMAIL");
  }

  const email = email_raw.toLowerCase();

  const club = await Club.findOne({ where: { internal_code: internalCode } });

  if (!club) {
    return res.status(404).send("CLUB_NOT_FOUND");
  }

  const membership = await ClubMembership.findOne({
    where: {
      club: club.id,
      [Op.or]: [{ phone_number: phone_number }, { email: email }],
    },
  });

  if (membership) {
    return res.status(401).send("ALREADY_MEMBER");
  }

  await ClubMembership.create({
    club: club.id,
    phone_number,
    email,
    first_name,
    last_name,
  });

  return res.status(200).send({
    result: "success",
  });
}
