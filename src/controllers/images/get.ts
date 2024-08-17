import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";

export default async function getImage(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = req.params.id;
  const file = getFirebase().storage().bucket().file(id);

  if (!(await file.exists())) {
    res.status(404).send("Image not found");
    return;
  } else {
    res
      .contentType((await file.getMetadata())[0].contentType ?? "")
      .send((await file.download())[0]);
  }
}
