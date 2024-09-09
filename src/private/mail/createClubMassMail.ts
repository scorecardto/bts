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

  const email_list = memberships
    .filter((m) => {
      if (m.email) {
        return validate(m.email);
      }
      return false;
    })
    .map((m) => m.email);

  sendMailMessage(email_list, post);
}
