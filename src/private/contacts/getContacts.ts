import fs from "fs";
import getFirebase from "../../firebase/getFirebase";
import { getFirestore } from "firebase-admin/firestore";

export default async function getContacts() {
  const CACHE_FILE = "cache/contacts.json";

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const contents = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));

      if (contents.expires > Date.now()) {
        return contents.data;
      }
    }
  } catch (e) {}

  const app = getFirebase();
  const db = getFirestore(app);

  const contacts = db.collection("contacts");

  const snapshot = await contacts.get();

  const contactsData: { [key: string]: any } = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    contactsData[doc.id] = data;
  });

  const data = {
    expires: Date.now() + 1000 * 60 * 60,
    data: contactsData,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));

  return contactsData;
}
