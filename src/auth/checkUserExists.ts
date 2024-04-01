import admin from "firebase-admin";
import getFirebase from "../firebase/getFirebase";

const checkUserExists = async (uid: string): Promise<boolean> => {
  const app = getFirebase();

  const user = await app.auth().getUser(uid);

  return !!user;
};

export default checkUserExists;
