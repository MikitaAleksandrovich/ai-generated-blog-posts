import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  async login(req, res) {
    if (req.query.mockProvider === "apple") {
      res.redirect("/api/auth/appleMock");
      return;
    }

    return handleLogin(req, res);
  },
});