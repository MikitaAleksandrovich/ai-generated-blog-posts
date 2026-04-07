import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { AppLayout } from "./AppLayout";
import PostsContext from "../../context/postContext";
import { useUser } from "@auth0/nextjs-auth0/client";

jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: jest.fn(),
}));

const defaultPosts = [
  {
    _id: "1",
    id: "1",
    topic: "First topic",
    created: "2023-01-01T00:00:00.000Z",
  },
];

const renderComponent = (
  contextOverrides = {},
  propsOverrides = {},
  child = <div>Child content</div>
) => {
  const contextValue = {
    posts: defaultPosts,
    setPostsFromSSR: jest.fn(),
    getPosts: jest.fn(),
    noMorePosts: true,
    ...contextOverrides,
  };

  const props = {
    availableTokens: 5,
    posts: defaultPosts,
    postId: null,
    postCreated: null,
    ...propsOverrides,
  };

  return {
    ...render(
      <PostsContext.Provider value={contextValue}>
        <AppLayout {...props}>{child}</AppLayout>
      </PostsContext.Provider>
    ),
    contextValue,
  };
};

beforeEach(() => {
  useUser.mockReset();
});

test("displays user data and posts list", async () => {
  useUser.mockReturnValue({
    user: { email: "user@example.com", name: "User", picture: "/avatar.png" },
  });

  const { contextValue } = renderComponent();

  await waitFor(() =>
    expect(contextValue.setPostsFromSSR).toHaveBeenCalledWith(defaultPosts)
  );

  expect(screen.getByText("user@example.com")).toBeInTheDocument();
  expect(screen.getByText(/5 tokens available/i)).toBeInTheDocument();
  expect(screen.getByText("First topic")).toBeInTheDocument();
  expect(screen.getByText("Child content")).toBeInTheDocument();
});

test("shows login link and triggers load more", () => {
  useUser.mockReturnValue({ user: null });

  const posts = [
    { _id: "1", id: "1", topic: "Topic 1", created: "2023-01-01T00:00:00Z" },
    { _id: "2", id: "2", topic: "Topic 2", created: "2023-02-01T00:00:00Z" },
  ];

  const { contextValue } = renderComponent(
    {
      posts,
      noMorePosts: false,
    },
    {
      posts,
    }
  );

  expect(screen.getByText("Login")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Load more posts"));

  expect(contextValue.getPosts).toHaveBeenCalledWith({
    lastPostDate: posts[posts.length - 1].created,
  });
});