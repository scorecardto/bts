import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";
import { randomUUID } from "node:crypto";
import mime from "mime";
import { File } from "formidable";
import fs from "fs";

const magicBytes: { [type: string]: number[] } = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
  // gif: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  // bmp: [0x42, 0x4D],
  // webp: [0x57, 0x45, 0x42, 0x50],
  // tiff: [0x49, 0x49, 0x2A, 0x00],
  heic: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
};

export default async function uploadImage(req: Request, res: Response) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const id = randomUUID();
    const file = getFirebase().storage().bucket().file(`images/${id}`);

    const image = req.files?.image as unknown as File;
    if (image == undefined) {
      res.status(400).send("No file upload found");
      return;
    }

    // @ts-ignore
    const data = fs.readFileSync(image.path); // claims it's `.filepath`, but it's actually `.path`

    console.log(data.byteLength);

    if (data.byteLength > 5 * 1024 * 1024) {
      // 5 MB
      res.status(400).send("Image too large");
      return;
    }

    const type = Object.keys(magicBytes).find(
      (type) => data.indexOf(Uint8Array.from(magicBytes[type])) == 0
    );
    if (!type) {
      res.status(400).send("Invalid image format");
      return;
    }

    await file.save(data);
    // @ts-ignore
    await file.setMetadata({ contentType: mime.getType(type) });

    res.send({
      result: "success",
      id: id,
    });
  } catch (e) {
    res.status(500).send("Error uploading image");
    return;
  }
}
