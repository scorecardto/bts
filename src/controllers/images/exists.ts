import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";

export default async function imageExists(req: Request, res: Response) {
  const id = req.params.id;
  const file = getFirebase().storage().bucket().file(`images/${id}`);

  res.send(JSON.stringify({"result": "success", "exists": (await file.exists())[0]}));
}
