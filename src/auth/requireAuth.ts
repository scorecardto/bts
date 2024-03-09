import { Request, Response } from "express";
import checkAuth from "./checkAuth";

const requireAuth = async (
  request: Request,
  response: Response
): Promise<boolean> => {
  const decodedToken = await checkAuth(request?.body?.token);

  if (!decodedToken) {
    response.status(401).send("Unauthorized");
    return false;
  }

  return true;
};

export default requireAuth;
