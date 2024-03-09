import getFirebaseConfig from "./getFirebaseConfig";
import admin from "firebase-admin";

export default function getFirebase() {
  const firebaseConfig = getFirebaseConfig();
  const app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        // @ts-ignore
        credential: admin.credential.cert(firebaseConfig),
      });

  return app;
}
