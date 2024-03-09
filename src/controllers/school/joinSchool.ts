import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
export default async function joinSchool(req: Request, res: Response) {
  const { schoolName, gradeLevel, studentFirstName, studentLastName } =
    req.body ?? {};

  if (!(await requireAuth(req, res))) return;

  res.send("Join school");
}
