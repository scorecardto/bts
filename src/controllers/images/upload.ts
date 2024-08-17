import {Request, Response} from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";

export const magicBytes: { [type: string]: number[]} = {
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    jpeg: [0xFF, 0xD8, 0xFF],
    // gif: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    // bmp: [0x42, 0x4D],
    // webp: [0x57, 0x45, 0x42, 0x50],
    // tiff: [0x49, 0x49, 0x2A, 0x00],
    heic: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
}

export default async function uploadImage(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = (req.fields?.id ?? "") as string;
  const file = getFirebase().storage().bucket().file(id);

  if (await file.exists()) {
    res.status(400).send("Image already exists");
    return;
  } else{
    const image = req.files?.image as unknown as File;
    if (image == undefined) {
      res.status(400).send("No file upload found");
      return;
    }

    const data = Buffer.from(await image.arrayBuffer());
    if (!Object.values(magicBytes).find(d => data.indexOf(Uint8Array.from(d)) == 0)) {
      res.status(400).send("Invalid image format");
      return;
    }

    await file.save(data)

    res.send({
      result: "success"
    });
  }
}
