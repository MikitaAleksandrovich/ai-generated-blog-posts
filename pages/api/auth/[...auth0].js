import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  async login(req, res) {
    return handleLogin(req, res);
  },
  async signup(req, res) {
    return handleLogin(req, res, {
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  },
});