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

jest.mock("@auth0/nextjs-auth0", () => ({
  getSession: jest.fn(),
}));

jest.mock("../lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve(mockClient),
}));

import { getAppProps } from "./getAppProps";
import { getSession } from "@auth0/nextjs-auth0";

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue({ user: { sub: "auth0|user" } });
});

test("returns defaults when user document is missing", async () => {
  mockUsersCollection.findOne.mockResolvedValue(null);

  const result = await getAppProps({ req: {}, res: {}, params: {} });

  expect(result).toEqual({
    availableTokens: 0,
    posts: [],
    postId: null,
  });
});

test("returns user tokens and transformed posts", async () => {
  mockUsersCollection.findOne.mockResolvedValue({
    _id: "user-id",
    availableTokens: 7,
  });

  mockCursor.toArray.mockResolvedValue([
    {
      _id: { toString: () => "post-id" },
      created: new Date("2023-01-01"),
      topic: "Topic",
    },
  ]);

  const result = await getAppProps({
    req: {},
    res: {},
    params: { postId: "route-post-id" },
  });

  expect(result.availableTokens).toBe(7);
  expect(result.postId).toBe("route-post-id");
  expect(result.posts[0]).toMatchObject({
    _id: "post-id",
    topic: "Topic",
  });
  expect(typeof result.posts[0].created).toBe("string");
  expect(mockPostsCollection.find).toHaveBeenCalledWith({
    userId: "user-id",
  });
});