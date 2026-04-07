const mockUsersCollection = {
  findOne: jest.fn(),
};

const mockCursor = {
  limit: jest.fn(),
  sort: jest.fn(),
  toArray: jest.fn(),
};

mockCursor.limit.mockReturnValue(mockCursor);
mockCursor.sort.mockReturnValue(mockCursor);

const mockPostsCollection = {
  find: jest.fn(() => mockCursor),
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

jest.mock("@auth0/nextjs-auth0", () => ({
  getSession: jest.fn(),
  withApiAuthRequired: jest.fn((handler) => handler),
}));

import handler from "./getPosts";
import { getSession } from "@auth0/nextjs-auth0";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue({ user: { sub: "auth0|user" } });
  mockUsersCollection.findOne.mockResolvedValue({ _id: "user-id" });
  mockCursor.toArray.mockResolvedValue([{ topic: "Post title" }]);
});

test("returns posts for authenticated user", async () => {
  const req = { body: { lastPostDate: "2023-01-01", getNewerPosts: false } };
  const res = createMockRes();

  await handler(req, res);

  expect(mockPostsCollection.find).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-id",
    })
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ posts: [{ topic: "Post title" }] });
});