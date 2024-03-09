import admin from "firebase-admin";
import getFirebase from "../firebase/getFirebase";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

const checkAuth = async (token: string): Promise<DecodedIdToken | null> => {
  const app = getFirebase();

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
};

export default checkAuth;
