import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import {
  Club,
  ClubBase,
  ClubEnrollmentBase,
  ClubMembershipBase,
  ClubPost,
} from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";
import { ClubPost as ClubPostModel } from "../../models/ClubPost";
import { ClubEmailEnrollment } from "../../models/ClubEmailEnrollment";
import getUserPhoneNumber from "../../auth/getUserPhoneNumber";

export default async function getMembers(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const internal_code = `${req.query.internalCode}`;

  const uid = user.uid;

  const club = await ClubModel.findOne({
    where: [
      {
        internal_code: internal_code,
      },
    ],
    include: [
      {
        model: ClubMembership,
        required: false,
        where: {
          phone_number: user.phone_number,
        },
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [
          Sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM club_memberships AS ClubMembership
            WHERE ClubMembership.club = Club.id
            AND ClubMembership.phone_number = '${user.phone_number}'
          )
        `),
          "isMember",
        ],
        [
          Sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM club_memberships AS ClubMembership
            WHERE ClubMembership.club = Club.id
            AND ClubMembership.manager = TRUE
            AND ClubMembership.phone_number = '${user.phone_number}'
          )
        `),
          "isManager",
        ],
        [
          Sequelize.literal(`
              (
                SELECT COUNT(*)
                FROM club_memberships AS ClubMembership
                WHERE ClubMembership.club = Club.id
              )
              + (
                SELECT COUNT(*)
                FROM club_email_enrollments AS ClubEmailEnrollment
                WHERE ClubEmailEnrollment.club = Club.id
              )
            `),
          "memberCount",
        ],
      ],
    },
  });

  if (!club) {
    res.status(400).send("Club not found");
    return;
  }

  // @ts-ignore
  if (club.owner !== user.uid && !club.dataValues.isManager) {
    res.status(401).send("User cannot access this");
    return;
  }

  const ownerPhoneNumber = await getUserPhoneNumber(club.owner);

  const members = ClubMembership.findAll({
    where: {
      club: club.id,
    },
  });

  const enrollments = ClubEmailEnrollment.findAll({
    where: {
      club: club.id,
    },
  });

  const returnMembers: ClubMembershipBase[] = (await members).map((c) => {
    return {
      id: c.id,
      manager: c.manager,
      owner: c.phone_number === ownerPhoneNumber,
      email: c.email,
      firstName: c.first_name,
      lastName: c.last_name,
      // phone: c.phone_number,
    };
  });

  const returnEnrollments: ClubEnrollmentBase[] = (await enrollments).map(
    (c) => {
      return {
        email: c.email,
        firstName: c.first_name,
        lastName: c.last_name,
      };
    }
  );

  res.send({
    result: "success",
    club: club,
    members: returnMembers,
    enrollments: returnEnrollments,
  });
}
