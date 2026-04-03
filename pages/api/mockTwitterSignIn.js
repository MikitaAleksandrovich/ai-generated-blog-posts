export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const mockUser = {
    id: "mock-twitter-user",
    name: "Mock Twitter User",
    username: "mock_writer",
    avatar:
      "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
  };

  return res.status(200).json({
    success: true,
    user: mockUser,
    message:
      "This is a mock Twitter sign-in. No real authentication was performed.",
  });
}