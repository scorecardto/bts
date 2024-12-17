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
import { ClubUnsubscribeLink } from "../../models/ClubUnsubscribeLink";

function generateShortCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortCode = "";
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortCode += characters[randomIndex];
  }
  return shortCode;
}

export default async function createClubMassMail(
  post: ClubPostInternal,
  clubId: number,
  postId: number,
  subject: string
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

    const results = await ClubUnsubscribeLink.bulkCreate(
      email_array.map((a) => {
        return {
          email: a,
          code: generateShortCode(),
          post: postId,
        };
      })
    );

    sendMailMessage(results, post, subject);
  }
}
