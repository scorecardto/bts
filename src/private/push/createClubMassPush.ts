import { ClubPostInternal } from "scorecard-types";
import sendPushNotifications from "./sendPushNotifications";
import GraphemeSplitter from "grapheme-splitter";
import smartTruncate from "smart-truncate";
import getUsers from "../auth/getUsers";
import { ClubMembership } from "../../models/ClubMembership";
import { TextTransaction } from "../../models/TextTransaction";
import { Op, Sequelize } from "sequelize";
import phone from "phone";
import axios from "axios";

type Contact = {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  numberTextsSent: number;
  fbToken?: string;
};

async function getContacts(clubId: number): Promise<Contact[]> {
  const users = await getUsers();

  const memberships = await ClubMembership.findAll({
    where: { club: clubId },
  });

  return memberships.map((member) => {
    return {
      phoneNumber: member.phone_number,
      firstName: member.first_name,
      lastName: member.last_name,
      numberTextsSent: -1,
      fbToken: users.find((u) => u.phoneNumber === member.phone_number)?.uid,
    };
  });
}

function validateEmoji(emoji: string): boolean {
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]$/u;
  if (!emojiRegex.test(emoji)) return false;
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(emoji).length === 1;
}

export default async function createClubMassPush(
  post: ClubPostInternal,
  clubId: number
) {
  console.log(
    "creating a mass push notification for " + post.club.name + "..."
  );

  const emoji_raw = post.club.emoji || "🙂";
  const emoji = validateEmoji(emoji_raw) ? emoji_raw : "🙂";
  const hashtag = `#${post.club.clubCode.substring(0, 10).toLowerCase()}`;

  const contacts = await getContacts(clubId);

  await sendPushNotifications(
    post.club.internalCode,
    `[${emoji}] New in #${post.club.clubCode}`,
    smartTruncate(post.content, 144),
    contacts.map((c) => c.fbToken)
  );
}
