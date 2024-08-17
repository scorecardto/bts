import { Request, Response } from "express";
import requireAuth from "../auth/requireAuth";
import getFirebase from "../firebase/getFirebase";

export default async function registerToken(req: Request, res: Response) {
    const user = await requireAuth(req, res);
    if (!user) return;

    getFirebase().firestore().collection("pushTokens").doc(user.uid).set({ token: req.body.pushToken });
    res.send({ result: "success" });
}
