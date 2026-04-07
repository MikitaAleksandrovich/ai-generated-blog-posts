const mockUsersCollection = {
  findOne: jest.fn(),
};

const mockPostsCollection = {
  deleteOne: jest.fn(),
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

import handler from "./deletePost";
import { getSession } from "@auth0/nextjs-auth0";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue({ user: { sub: "auth0|abc" } });
  mockUsersCollection.findOne.mockResolvedValue({ _id: "user-id" });
  mockPostsCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
});

test("deletes post for authenticated user", async () => {
  const req = { body: { postId: "post123" } };
  const res = createMockRes();

  await handler(req, res);

  expect(mockPostsCollection.deleteOne).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-id",
    })
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: true });
});