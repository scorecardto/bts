import { Request, Response } from "express";
import checkAuth from "./checkAuth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

const requireAuth = async (
  request: Request,
  response: Response
): Promise<DecodedIdToken | null> => {
  const decodedToken = await checkAuth(request.headers.authorization ?? "");

  if (!decodedToken) {
    response.status(401).send("Unauthorized");
    return null;
  }

  return decodedToken;
};

export default requireAuth;
