import { Request, Response } from "express";
import checkAuth from "./checkAuth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

const requireAuth = async (
  request: Request,
  response: Response
): Promise<DecodedIdToken | null> => {
  const token = (request.fields?.token ?? "") as string;

  const decodedToken = await checkAuth(token);

  if (!decodedToken) {
    response.status(401).send("Unauthorized");
    return null;
  }

  return decodedToken;
};

export default requireAuth;
