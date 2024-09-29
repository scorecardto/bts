import admin from "firebase-admin";
import getFirebase from "../firebase/getFirebase";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

const getUserPhoneNumber = async (uid: string): Promise<string | undefined> => {
  const app = getFirebase();

  const user = await app.auth().getUser(uid);

  return user.phoneNumber;
};

export default getUserPhoneNumber;
