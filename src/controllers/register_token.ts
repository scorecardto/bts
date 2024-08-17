import { Request, Response } from "express";
import requireAuth from "../auth/requireAuth";
import getFirebase from "../firebase/getFirebase";

export default async function registerToken(req: Request, res: Response) {
    const user = await requireAuth(req, res);
    if (!user) return;

    const token = (req.fields?.pushToken ?? "") as string;
    if (!token || !/ExponentPushToken[a-zA-Z]/.test(token)) {
        res.status(400).send("Invalid push token");
        return;
    }

    getFirebase().firestore().collection("pushTokens").doc(user.uid).set({ token });
    res.send({ result: "success" });
}
