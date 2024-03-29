import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import getUsers from "../auth/getUsers";
import ContactNode from "../../types/ContactNode";
import getFriendScore from "./getFriendScore";
import phone from "phone";
import getPopularity from "./getPopularity";

export default async function getYesContactSuggestions(
  user: DecodedIdToken,
  personalContacts: any,
  allContacts: Record<string, any>,
  uidDirectory: string[]
) {
  const MINIMUM_POPULARITY = 6;
  const users = await getUsers();

  const phoneNumbers = new Set<string>();
  const friendNodes: ContactNode[] = [];

  const popularity = await getPopularity();

  personalContacts.forEach((contact: any) => {
    contact.phoneNumbers?.forEach?.((phoneNumber: any) => {
      const standardPhoneNumber = phone(phoneNumber.number).phoneNumber;

      if (standardPhoneNumber == null) return;

      phoneNumbers.add(standardPhoneNumber);

      const account = users.find(
        (user) => user.phoneNumber === standardPhoneNumber
      );

      const hasContacts =
        account?.uid &&
        uidDirectory.includes(account?.uid) &&
        allContacts[account?.uid];

      if (hasContacts) {
        const contactNode: ContactNode = {
          name: contact.name,
          phoneNumber: standardPhoneNumber,
          hasAccount: account !== undefined,
          uid: account?.uid,
          score: 0,
          contactLink: contact,
        };

        friendNodes.push(contactNode);
      }
    });
  });

  const relatedNodes: Map<string, ContactNode> = new Map();

  friendNodes.forEach((node) => {
    const friendScore = getFriendScore(node.contactLink);

    const friendContacts = allContacts[node.uid!]?.contacts;

    friendContacts.forEach?.((contact: any) => {
      contact?.phoneNumbers?.forEach?.((phoneNumber: any) => {
        const standardPhoneNumber = phone(phoneNumber.number).phoneNumber;
        if (standardPhoneNumber == null) return;

        if (relatedNodes.has(standardPhoneNumber)) {
          const relatedNode = relatedNodes.get(standardPhoneNumber);

          if (relatedNode?.score) {
            relatedNode.score += friendScore ** 2;
            return;
          }
        }

        relatedNodes.set(standardPhoneNumber, {
          phoneNumber: standardPhoneNumber,
          score: friendScore,
        });
      });
    });
  });

  const relatedArray = Array.from(relatedNodes.values())
    .map((node) => {
      const userKnows = phoneNumbers.has(node.phoneNumber);

      if (!userKnows) {
        node.score = 0;
        // can also square root the score
      } else {
        const contactLink = personalContacts.find((contact: any) =>
          contact.phoneNumbers?.find?.(
            (phoneNumber: any) =>
              phone(phoneNumber.number).phoneNumber === node.phoneNumber
          )
        );

        if (contactLink) {
          // node.contactLink = contactLink;

          node.name = contactLink.name;
          node.score = getFriendScore(contactLink) * node.score!;
        }
      }

      return node;
    })
    .filter((node) => {
      return popularity[node.phoneNumber] >= MINIMUM_POPULARITY;
    });

  relatedArray.sort((a, b) => b.score! - a.score!);

  return relatedArray;
}
