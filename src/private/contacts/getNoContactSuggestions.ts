import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import phone from "phone";
import getFriendScore from "./getFriendScore";
import ContactNode from "../../types/ContactNode";
import getPopularity from "./getPopularity";

export default async function getNoContactSuggestions(
  user: DecodedIdToken,
  allContacts: Record<string, any>,
  uidDirectory: string[]
) {
  const MINIMUM_POPULARITY = 6;

  const popularity = await getPopularity();

  const friends: {
    uid: string;
    contactLink: any;
  }[] = Object.keys(allContacts)
    .map((uid) => {
      const contacts = allContacts[uid].contacts;

      if (contacts == null || !uidDirectory.includes(uid)) {
        return {
          uid,
          contactLink: null,
        };
      }

      const contactLink = contacts.find((contact: any) => {
        return (
          contact.phoneNumbers != null &&
          contact.phoneNumbers.find((u: any) => {
            return user.phone_number === phone(u.number).phoneNumber;
          })
        );
      });

      return {
        uid,
        contactLink,
      };
    })
    .filter((x) => x.contactLink);

  // key 🔑 = phone number ☎️
  const related: Map<string, ContactNode> = new Map();

  friends.forEach(({ uid, contactLink }) => {
    const friendContacts = allContacts[uid].contacts;
    const friendScore = getFriendScore(contactLink);

    friendContacts.forEach((contact: any) => {
      const fofScore = getFriendScore(contact);

      if (contact.phoneNumbers) {
        contact.phoneNumbers.forEach((phoneNumber: any) => {
          const standardPhoneNumber = phone(phoneNumber.number).phoneNumber;
          if (standardPhoneNumber === null) return;

          if (related.has(standardPhoneNumber)) {
            const obj = related.get(standardPhoneNumber);
            const step = friendScore;

            if (obj?.score) {
              obj.score += step;
              return;
            }
          }

          related.set(standardPhoneNumber, {
            phoneNumber: standardPhoneNumber,
            score: friendScore,
          });
        });
      }
    });
  });

  const sorted = Array.from(related.values())
    .filter((r) => {
      return popularity[r.phoneNumber] > MINIMUM_POPULARITY;
    })
    .sort((a, b) => b.score! - a.score!);

  return sorted.splice(0, 25);
}
