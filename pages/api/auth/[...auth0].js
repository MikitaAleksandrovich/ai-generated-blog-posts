import { handleAuth } from "@auth0/nextjs-auth0";
import { mockTwitterSignUpPayload } from "../mockTwitterSignUp";

const authHandler = handleAuth();

export default function handler(req, res) {
  const [action = ""] = req.query.auth0 || [];

  if (action === "mockTwitterSignUp") {
    res.status(200).json(mockTwitterSignUpPayload);
    return;
  }

  return authHandler(req, res);
}