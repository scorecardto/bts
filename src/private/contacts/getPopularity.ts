import fs from "fs";
import getFirebase from "../../firebase/getFirebase";
import { getFirestore } from "firebase-admin/firestore";
import getContacts from "./getContacts";
import phone from "phone";

export default async function getPopularity() {
  const CACHE_FILE = "cache/popularity.json";

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const contents = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));

      if (contents.expires > Date.now()) {
        return contents.data;
      }
    }
  } catch (e) {}

  const contacts = await getContacts();

  const occurences: { [key: string]: number } = {};

  for (const contactsEntry of Object.values(contacts) as any) {
    contactsEntry.contacts?.forEach?.((contact: any) => {
      contact?.phoneNumbers?.forEach?.((phoneNumber: any) => {
        const standardPhoneNumber = phone(phoneNumber.number);

        if (
          standardPhoneNumber.phoneNumber == null ||
          !standardPhoneNumber.isValid
        )
          return;

        if (occurences[standardPhoneNumber.phoneNumber] == null) {
          occurences[standardPhoneNumber.phoneNumber] = 0;
        }

        occurences[standardPhoneNumber.phoneNumber]++;
      });
    });
  }

  const data = {
    expires: Date.now() + 1000 * 60 * 60,
    data: occurences,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));

  return occurences;
}
