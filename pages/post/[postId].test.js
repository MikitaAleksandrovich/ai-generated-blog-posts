const mockUsersCollection = {
  findOne: jest.fn(),
};

const mockPostsCollection = {
  findOne: jest.fn(),
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
  withPageAuthRequired: jest.fn((options) => options.getServerSideProps),
}));

jest.mock("../../utils/getAppProps", () => ({
  getAppProps: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Post, { getServerSideProps } from "./[postId]";
import PostsContext from "../../context/postContext";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";
import { getSession } from "@auth0/nextjs-auth0";

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  delete global.fetch;
});

test("renders post details and deletes post on confirmation", async () => {
  const replace = jest.fn();
  useRouter.mockReturnValue({ replace });

  const deletePost = jest.fn();
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  });

  const props = {
    title: "Sample Title",
    metaDescription: "Meta description",
    keywords: "alpha,beta",
    postContent: "<p>Post body</p>",
    id: "post-id",
  };

  render(
    <PostsContext.Provider value={{ deletePost }}>
      <Post {...props} />
    </PostsContext.Provider>
  );

  expect(screen.getByText("Sample Title")).toBeInTheDocument();
  expect(screen.getByText("Meta description")).toBeInTheDocument();
  expect(screen.getByText("Post body")).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Delete post/i));
  fireEvent.click(screen.getByText(/confirm delete/i));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(deletePost).toHaveBeenCalledWith("post-id");
  expect(replace).toHaveBeenCalledWith("/post/new");
});

test("getServerSideProps returns post data when found", async () => {
  getAppProps.mockResolvedValue({ shared: true });
  getSession.mockResolvedValue({ user: { sub: "auth0|123" } });
  mockUsersCollection.findOne.mockResolvedValue({ _id: "user-db" });
  const post = {
    _id: "post-db",
    postContent: "<p>Body</p>",
    title: "Post title",
    metaDescription: "Meta",
    keywords: "alpha,beta",
    created: new Date("2023-01-01"),
  };
  mockPostsCollection.findOne.mockResolvedValue(post);

  const result = await getServerSideProps({
    req: {},
    res: {},
    params: { postId: "post-db" },
  });

  expect(result.props).toMatchObject({
    postContent: "<p>Body</p>",
    title: "Post title",
    id: "post-db",
    metaDescription: "Meta",
    keywords: "alpha,beta",
    postCreated: post.created.toString(),
    shared: true,
  });
});

test("getServerSideProps redirects when post is missing", async () => {
  getAppProps.mockResolvedValue({ shared: true });
  getSession.mockResolvedValue({ user: { sub: "auth0|123" } });
  mockUsersCollection.findOne.mockResolvedValue({ _id: "user-db" });
  mockPostsCollection.findOne.mockResolvedValue(null);

  const result = await getServerSideProps({
    req: {},
    res: {},
    params: { postId: "missing" },
  });

  expect(result).toEqual({
    redirect: { destination: "/post/new", permanent: false },
  });
});