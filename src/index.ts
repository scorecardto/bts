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
import checkTicker from "./controllers/clubs/checkTicker";
import createClub from "./controllers/clubs/create";
import registerToken from "./controllers/register_token";
import listClubs from "./controllers/clubs/list";
import joinClub from "./controllers/clubs/join";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
  formidableMiddleware({
    maxFileSize: 5 * 1024 * 1024,
  })
);

app.post("/v1/school/status", updateSchoolStatus);
app.post("/v1/clubs/checkTicker", checkTicker);
app.post("/v1/clubs/create", createClub);
app.post("/v1/clubs/join", joinClub);
app.get("/v1/clubs/list", listClubs);

app.post("/v1/friends/add", addFriend);
app.post("/v1/friends/list", listFriends);
app.post("/v1/friends/suggestions", suggestFriends);
app.post("/v1/friends/unblock", unblockFriend);
app.post("/v1/friends/block", removeFriend);

app.post("/v1/images/upload", uploadImage);
app.get("/v1/images/get/:id", getImage);

app.post("/v1/register_token", registerToken);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server (4)");
});

const db = initializeModel().sync();

db.then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});
