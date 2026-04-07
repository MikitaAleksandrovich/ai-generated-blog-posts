import React, { useContext } from "react";
import { render, act, waitFor } from "@testing-library/react";
import PostsContext, { PostsProvider } from "./postContext";

let contextValue;

const Consumer = () => {
  contextValue = useContext(PostsContext);
  return null;
};

beforeEach(() => {
  contextValue = null;
});

test("setPostsFromSSR stores unique posts", async () => {
  render(
    <PostsProvider>
      <Consumer />
    </PostsProvider>
  );

  await act(async () => {
    contextValue.setPostsFromSSR([{ _id: "1", topic: "First" }]);
  });

  await waitFor(() => expect(contextValue.posts).toHaveLength(1));

  await act(async () => {
    contextValue.setPostsFromSSR([
      { _id: "1", topic: "First" },
      { _id: "2", topic: "Second" },
    ]);
  });

  await waitFor(() => expect(contextValue.posts).toHaveLength(2));
});

test("deletePost removes the targeted post", async () => {
  render(
    <PostsProvider>
      <Consumer />
    </PostsProvider>
  );

  await act(async () => {
    contextValue.setPostsFromSSR([
      { _id: "1", topic: "First" },
      { _id: "2", topic: "Second" },
    ]);
  });

  await act(async () => {
    contextValue.deletePost("1");
  });

  await waitFor(() =>
    expect(contextValue.posts).toEqual([{ _id: "2", topic: "Second" }])
  );
});

test("getPosts fetches data and updates state", async () => {
  render(
    <PostsProvider>
      <Consumer />
    </PostsProvider>
  );

  global.fetch = jest.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        posts: [
          { _id: "3", topic: "Third" },
          { _id: "4", topic: "Fourth" },
        ],
      }),
  });

  await act(async () => {
    await contextValue.getPosts({ lastPostDate: "2023-01-01" });
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/getPosts",
    expect.objectContaining({
      method: "POST",
    })
  );

  await waitFor(() => expect(contextValue.posts).toHaveLength(2));
  expect(contextValue.noMorePosts).toBe(true);

  delete global.fetch;
});