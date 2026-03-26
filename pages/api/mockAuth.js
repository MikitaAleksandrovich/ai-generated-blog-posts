let mockSession = {
  isAuthenticated: false,
  user: null,
  lastLogin: null,
};

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(mockSession);
  }

  if (req.method === "POST") {
    const { action } = req.body || {};

    if (action === "login") {
      mockSession = {
        isAuthenticated: true,
        user: {
          id: "mock-twitter-user-123",
          username: "mock_twitter_user",
          name: "Mock Twitter User",
        },
        lastLogin: new Date().toISOString(),
      };

      return res
        .status(200)
        .json({ message: "Mock Twitter login successful", ...mockSession });
    }

    if (action === "logout") {
      mockSession = {
        isAuthenticated: false,
        user: null,
        lastLogin: null,
      };

      return res
        .status(200)
        .json({ message: "Mock Twitter logout successful", ...mockSession });
    }

    return res
      .status(400)
      .json({ error: "Invalid action. Use 'login' or 'logout'." });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}