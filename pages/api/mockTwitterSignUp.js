export const mockTwitterSignUpPayload = {
  provider: "twitter",
  user: {
    id: "mock-twitter-user-001",
    name: "Ava Mercer",
    username: "ava_mercer",
    email: "ava.mercer@example.com",
    location: "Austin, TX",
    bio: "Product storyteller crafting thoughtful threads about SaaS growth and AI.",
    profileImage:
      "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
    verified: true,
    stats: {
      followers: 12450,
      following: 532,
      tweets: 9864,
    },
    createdAt: "2020-05-18T15:45:00.000Z",
  },
};

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json(mockTwitterSignUpPayload);
}