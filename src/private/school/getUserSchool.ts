import { getFirestore } from "firebase-admin/firestore";
import getFirebase from "../../firebase/getFirebase";

export default async function getUserSchool(uid: string): Promise<string> {
  const app = getFirebase();
  const db = getFirestore(app);

  const userSchoolInfo = db.collection("userSchoolInfo");
  const snapshot = await userSchoolInfo.doc(uid).get();
  const data = snapshot.data();

  if (!data || !data.schoolName) {
    throw new Error("User not found");
  }

  return data.schoolName;
}
