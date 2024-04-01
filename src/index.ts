// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import joinSchool from "./controllers/school/joinSchool";
import suggestFriends from "./controllers/friends/suggestions";
import formidableMiddleware from "express-formidable";
import initializeModel from "./models";
import addFriend from "./controllers/friends/add";
import listFriends from "./controllers/friends/list";
import unblockFriend from "./controllers/friends/unblock";
import removeFriend from "./controllers/friends/remove";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(formidableMiddleware());

app.post("/v1/school/join", joinSchool);

app.post("/v1/friends/add", addFriend);
app.post("/v1/friends/list", listFriends);
app.post("/v1/friends/suggestions", suggestFriends);
app.post("/v1/friends/unblock", unblockFriend);
app.post("/v1/friends/block", removeFriend);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const db = initializeModel().sync();

db.then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});
