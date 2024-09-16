import { ClubPostInternal } from "scorecard-types";
import GraphemeSplitter from "grapheme-splitter";
import smartTruncate from "smart-truncate";
import getUsers from "../auth/getUsers";
import { ClubMembership } from "../../models/ClubMembership";
import sendMessage from "./sendTextMessage";
import { TextTransaction } from "../../models/TextTransaction";
import { Op, Sequelize } from "sequelize";
import sendPushNotifications from "../push/sendPushNotifications";

const IGNORE_IS_USER = true;
const MAX_FREE_TEXTS = 3;

function validateEmoji(emoji: string): boolean {
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]$/u;
  if (!emojiRegex.test(emoji)) return false;
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(emoji).length === 1;
}

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

  return memberships.map(member => {return {
    phoneNumber: member.phone_number,
    firstName: member.first_name,
    lastName: member.last_name,
    numberTextsSent: -1,
    fbToken: users.find((u) => u.phoneNumber === member.phone_number)?.uid,
  }});
}

async function aggregateTextCount(contacts: Contact[]): Promise<Contact[]> {
  const textTransactions = await TextTransaction.findAll({
    where: [
      {
        phone_number: {
          [Op.in]: contacts.map((p) => p.phoneNumber),
        },
      },
    ],

    attributes: [
      "phone_number",
      [Sequelize.fn("COUNT", Sequelize.col("phone_number")), "text_count"],
    ],
    group: ["phone_number"],
  });

  return contacts.map((contact, index): Contact => {
    const transactionRecord = textTransactions.find(
      (t) => t.dataValues.phone_number === contact.phoneNumber
    );

    return {
      ...contact,
      // @ts-ignore
      numberTextsSent: transactionRecord?.dataValues?.text_count ?? 0,
    };
  });
}

export default async function createClubMassText(
  post: ClubPostInternal,
  clubId: number
) {
  console.log("creating a mass text for " + post.club.name + "...");

  const emoji_raw = post.club.emoji || "🙂";
  const emoji = validateEmoji(emoji_raw) ? emoji_raw : "🙂";
  const hashtag = `#${post.club.clubCode.substring(0, 10).toLowerCase()}`;

  const truncatedMessage = smartTruncate(post.content, 150);

  // ROUGH EST. you get at least 167 characters
  const leadMessage = `${emoji} From ${hashtag}: ${post.content}`;

  const contacts = await getContacts(clubId);

  const toText = await sendPushNotifications(post.club.internalCode,
      `${emoji} Post in ${post.club.name}`,
      smartTruncate(post.content, 144)+"...", contacts.map(c => c.fbToken));

  // TODO: send text messages to everyone else (API currently not verified, so this is disabled)
  return

  const finalContacts = await aggregateTextCount(contacts.filter((_, i) => toText.includes(i)));

  const transactionReceipts: any[] = [];

  for (let c of finalContacts) {
    let message = "";

    if (c.numberTextsSent === MAX_FREE_TEXTS) {
      const nameUsed = c.firstName
        ? `${c.firstName?.substring(0, 12)},` // 13
        : "Heads up:";
      const footer = `\n--\nTo join more clubs and manage classes, use the Scorecard app at https://scorecardgrades.com/`; // 98
      const quote = `${"“"}${smartTruncate(leadMessage, 200)}${"”"}`; // 2 + 200
      // 13 + 98 + 2 + 200 = 313
      message = `${nameUsed} this is the last message we're sending you by text: ${quote}${footer}`;
    } else {
      message = `${smartTruncate(
        leadMessage,
        190
      )}\n--\nTo see this post in full, download Scorecard at https://scorecardgrades.com/ . You can also manage classes and create clubs!`;
      // 320 - 130 = 190
    }
    const t = await sendMessage(message, c.phoneNumber);
    transactionReceipts.push(t);
  }
  TextTransaction.bulkCreate(transactionReceipts);
}
