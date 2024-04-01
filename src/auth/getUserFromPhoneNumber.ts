import admin from "firebase-admin";
import getFirebase from "../firebase/getFirebase";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

const getUserFromPhoneNumber = async (
  number: string
): Promise<UserRecord | null> => {
  const app = getFirebase();

  const user = await app.auth().getUserByPhoneNumber(number);

  return user;
};

export default getUserFromPhoneNumber;
