import getFirebase from "../../firebase/getFirebase";
import { getFirestore } from "firebase-admin/firestore";

export default async function getUIDDirectory(
  schoolName: string
): Promise<string[]> {
  const app = getFirebase();
  const db = getFirestore(app);

  const userSchoolInfo = db.collection("userSchoolInfo");
  const snapshot = await userSchoolInfo.get();

  const uids: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.schoolName === schoolName) {
      uids.push(doc.id);
    }
  });

  return uids;
}
