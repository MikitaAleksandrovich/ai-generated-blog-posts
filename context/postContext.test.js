import React, { useContext } from "react";
import { render, act, waitFor } from "@testing-library/react";
import PostsContext, { PostsProvider } from "./postContext";

const setup = () => {
  const result = {};
  const Consumer = () => {
    result.context = useContext(PostsContext);
    return null;
  };

  render(
    <PostsProvider>
      <Consumer />
    </PostsProvider>
  );

  return {
    getContext: () => result.context,
  };
};

afterEach(() => {
  if (global.fetch) {
    delete global.fetch;
  }
});

describe("PostsProvider", () => {
  it("stores unique posts when setPostsFromSSR is called repeatedly", async () => {
    const { getContext } = setup();

    await waitFor(() => expect(getContext()).toBeDefined());

    act(() => {
      getContext().setPostsFromSSR([{ _id: "1", topic: "First" }]);
    });

    act(() => {
      getContext().setPostsFromSSR([
        { _id: "1", topic: "First" },
        { _id: "2", topic: "Second" },
      ]);
    });

    await waitFor(() => {
      expect(getContext().posts.length).toBe(2);
      expect(getContext().posts[1]._id).toBe("2");
    });
  });

  it("removes posts via deletePost", async () => {
    const { getContext } = setup();

    await waitFor(() => expect(getContext()).toBeDefined());

    act(() => {
      getContext().setPostsFromSSR([
        { _id: "1", topic: "First" },
        { _id: "2", topic: "Second" },
      ]);
    });

    act(() => {
      getContext().deletePost("1");
    });

    await waitFor(() => {
      expect(getContext().posts).toEqual([{ _id: "2", topic: "Second" }]);
    });
  });

  it("fetches posts and flags noMorePosts when fewer than five results are returned", async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            posts: [
              {
                _id: "3",
                topic: "Fetched",
                created: "2023-03-01T00:00:00Z",
              },
            ],
          }),
      })
    );
    global.fetch = mockFetch;

    const { getContext } = setup();

    await waitFor(() => expect(getContext()).toBeDefined());

    await act(async () => {
      await getContext().getPosts({ lastPostDate: "2023-02-01T00:00:00Z" });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/getPosts",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lastPostDate: "2023-02-01T00:00:00Z",
          getNewerPosts: false,
        }),
      })
    );

    await waitFor(() => {
      expect(getContext().posts.length).toBe(1);
      expect(getContext().noMorePosts).toBe(true);
    });
  });
})