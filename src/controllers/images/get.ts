import {Request, Response} from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";
import {magicBytes} from "./upload";

export default async function getImage(req: Request, res: Response) {
    const user = await requireAuth(req, res);
    if (!user) return;

    const id = req.params.id;
    const file = getFirebase().storage().bucket().file(id);

    if (!(await file.exists())) {
        res.status(404).send("Image not found");
        return;
    } else{
        const image = (await file.download())[0];

        const type = Object.keys(magicBytes).find(type => image.indexOf(Uint8Array.from(magicBytes[type])) == 0);
        if (!type) {
            res.status(500).send("Invalid image format");
            return;
        }

        res.contentType(type).send(image);
    }
}
