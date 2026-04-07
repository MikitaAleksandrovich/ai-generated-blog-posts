const mockUsersCollection = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

const mockPostsCollection = {
  insertOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn((name) => {
    if (name === "users") return mockUsersCollection;
    if (name === "posts") return mockPostsCollection;
    return {};
  }),
};

const mockClient = {
  db: jest.fn(() => mockDb),
};

jest.mock("../../lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve(mockClient),
}));

const mockCreateChatCompletion = jest.fn();

jest.mock("openai", () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: mockCreateChatCompletion,
  })),
}));

jest.mock("@auth0/nextjs-auth0", () => ({
  getSession: jest.fn(),
  withApiAuthRequired: jest.fn((handler) => handler),
}));

import handler from "./generatePost";
import { getSession } from "@auth0/nextjs-auth0";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-key";
  getSession.mockResolvedValue({ user: { sub: "auth0|user" } });
});

test("returns 403 when user lacks tokens", async () => {
  mockUsersCollection.findOne.mockResolvedValue({ availableTokens: 0 });
  const req = { body: { topic: "Topic", keywords: "keywords" } };
  const res = createMockRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
});

test("generates post, decrements tokens, and stores post", async () => {
  const postContent = "<p>Content</p>";
  const title = "Title";
  const description = "Description";

  mockUsersCollection.findOne.mockResolvedValue({
    _id: "user-id",
    availableTokens: 5,
  });

  mockCreateChatCompletion
    .mockResolvedValueOnce({
      data: { choices: [{ message: { content: postContent } }] },
    })
    .mockResolvedValueOnce({
      data: { choices: [{ message: { content: title } }] },
    })
    .mockResolvedValueOnce({
      data: { choices: [{ message: { content: description } }] },
    });

  mockPostsCollection.insertOne.mockResolvedValue({ insertedId: "new-post" });

  const req = { body: { topic: "Topic", keywords: "key" } };
  const res = createMockRes();

  await handler(req, res);

  expect(mockCreateChatCompletion).toHaveBeenCalledTimes(3);
  expect(mockUsersCollection.updateOne).toHaveBeenCalledWith(
    { auth0Id: "auth0|user" },
    { $inc: { availableTokens: -1 } }
  );
  expect(mockPostsCollection.insertOne).toHaveBeenCalledWith(
    expect.objectContaining({
      postContent,
      title,
      metaDescription: description,
      topic: "Topic",
      keywords: "key",
      userId: "user-id",
    })
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ postId: "new-post" });
});