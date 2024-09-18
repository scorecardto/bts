// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import suggestFriends from "./controllers/friends/suggestions";
import formidableMiddleware from "express-formidable";
import initializeModel from "./models";
import addFriend from "./controllers/friends/add";
import listFriends from "./controllers/friends/list";
import unblockFriend from "./controllers/friends/unblock";
import removeFriend from "./controllers/friends/remove";
import updateSchoolStatus from "./controllers/school/status";
import uploadImage from "./controllers/images/upload";
import getImage from "./controllers/images/get";
import checkTicker from "./controllers/clubs/checkClubCode";
import createClub from "./controllers/clubs/create";
import registerToken from "./controllers/register_token";
import listClubs from "./controllers/clubs/list";
import joinClub from "./controllers/clubs/join";
import getClub from "./controllers/clubs/get";
import updateClub from "./controllers/clubs/update";
import imageExists from "./controllers/images/exists";
import searchClubs from "./controllers/clubs/search";
import getClubDownloadPromo from "./controllers/clubs/public/clubDownloadPromo";
import joinClubPublic from "./controllers/clubs/public/join";
import getClubImage from "./controllers/images/club";
import createClubPost from "./controllers/clubs/post";
import leaveClub from "./controllers/clubs/leave";
import courseGlyphs from "./controllers/static/courseGlyphs";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
  formidableMiddleware({
    maxFileSize: 5 * 1024 * 1024,
  })
);

// @ts-ignore
app.use((err, req, res, next) => {
  if (err && err.message.includes("maxFileSize exceeded")) {
    return res
      .status(413)
      .json({ error: "File size too large. Max size is 5MB." });
  }

  return res.status(500).json({ error: "Something went wrong!" });
});

app.post("/v1/school/status", updateSchoolStatus);
app.post("/v1/clubs/checkClubCode", checkTicker);
app.post("/v1/clubs/create", createClub);
app.post("/v1/clubs/join", joinClub);
app.get("/v1/clubs/list", listClubs);
app.get("/v1/clubs/get", getClub);
app.get("/v1/clubs/search", searchClubs);
app.post("/v1/clubs/update", updateClub);
app.post("/v1/clubs/post", createClubPost);
app.get("/v1/clubs/public/clubDownloadPromo", getClubDownloadPromo);
app.post("/v1/clubs/public/join", joinClubPublic);
app.post("/v1/clubs/leave", leaveClub);

app.post("/v1/friends/add", addFriend);
app.post("/v1/friends/list", listFriends);
app.post("/v1/friends/suggestions", suggestFriends);
app.post("/v1/friends/unblock", unblockFriend);
app.post("/v1/friends/block", removeFriend);

app.post("/v1/images/upload", uploadImage);
app.get("/v1/images/get/:id", getImage);
app.get("/v1/images/exists/:id", imageExists);
app.get("/v1/images/club/:internalCode", getClubImage);

app.post("/v1/register_token", registerToken);

app.get("/v1/static/courseGlyphs", courseGlyphs);

app.get("/", (req: Request, res: Response) => {
  res.send("Server build: (5)");
});

const db = initializeModel().sync();

db.then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});
