import { setLoginSession } from "@auth0/nextjs-auth0/dist/auth0-session";

const MOCK_APPLE_ACCOUNTS = [
  {
    id: "creator",
    sub: "apple|mock-creator",
    email: "creator@applemock.com",
    name: "Avery Apple",
    nickname: "avery.apple",
    picture: "/hero.webp",
    email_verified: true,
  },
  {
    id: "marketer",
    sub: "apple|mock-marketer",
    email: "marketer@applemock.com",
    name: "Milo Marketer",
    nickname: "milo.marketer",
    picture: "/hero.webp",
    email_verified: true,
  },
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { account } = req.query;
    const mockUser =
      MOCK_APPLE_ACCOUNTS.find((item) => item.id === account) ||
      MOCK_APPLE_ACCOUNTS[0];

    const session = {
      user: mockUser,
      idToken: `mock-id-token-${mockUser.sub}`,
      accessToken: `mock-access-token-${mockUser.sub}`,
      accessTokenScope: "openid profile email",
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
      refreshToken: null,
      token_type: "Bearer",
    };

    await setLoginSession(req, res, session);
    res.redirect("/");
  } catch (error) {
    console.error("APPLE MOCK LOGIN ERROR", error);
    res.status(500).json({ error: "Unable to complete mock Apple login." });
  }
}