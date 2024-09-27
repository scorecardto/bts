import { ClubPostInternal } from "scorecard-types";
import GraphemeSplitter from "grapheme-splitter";
import smartTruncate from "smart-truncate";
import getUsers from "../auth/getUsers";
import { ClubMembership } from "../../models/ClubMembership";
import { TextTransaction } from "../../models/TextTransaction";
import { Op, Sequelize } from "sequelize";
import { Club } from "../../models/Club";
import { validate } from "email-validator";
import sendMailMessage from "./sendMailMessage";
import { ClubEmailEnrollment } from "../../models/ClubEmailEnrollment";

export default async function createClubMassMail(
  post: ClubPostInternal,
  clubId: number
) {
  console.log("creating a mass mail for " + post.club.name + "...");

  const memberships = await ClubMembership.findAll({
    where: {
      club: clubId,
    },
  });

  const enrollments = await ClubEmailEnrollment.findAll({
    where: {
      club: clubId,
    },
  });

  const email_list = new Set<string>(
    memberships
      .filter((m) => {
        if (m.email) {
          return validate(m.email);
        }
        return false;
      })
      .map((m) => m.email)
  );

  enrollments
    .filter((m) => {
      if (m.email) {
        return validate(m.email);
      }
      return false;
    })
    .forEach((m) => email_list.add(m.email));

  if (email_list.size >= 1) {
    const email_array = [...email_list];

    console.log(email_array);

    sendMailMessage(email_array, post);
  }
}
