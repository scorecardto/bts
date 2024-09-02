import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import getFirebase from "../../firebase/getFirebase";
const Jimp = require("jimp");
import path from "path";
import { Club } from "../../models/Club";
const node_modules = require("node_modules-path");

export default async function getClubImage(req: Request, res: Response) {
  const internalCode = req.params.internalCode;

  const club = await Club.findOne({ where: { internal_code: internalCode } });

  if (!club) {
    return res.status(404).send({
      result: "NOT_FOUND",
      emoji: "⚠️",
      backgroundColor: "#888888",
    });
  }

  const metadata = JSON.parse(club.metadata);

  if (metadata.picture) {
    return res.status(200).send({
      result: "success",
      picture: metadata.picture,
    });
  } else {
    return res.status(200).send({
      result: "success",
      emoji: metadata.emoji || "🙂",
      backgroundColor: metadata.heroColor || "#888888",
    });
  }
}
