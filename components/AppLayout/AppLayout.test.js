import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppLayout } from "./AppLayout";
import PostsContext from "../../context/postContext";
import { useUser } from "@auth0/nextjs-auth0/client";

jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src = "", alt = "", ...props }) => (
    <img src={typeof src === "string" ? src : ""} alt={alt} {...props} />
  ),
}));

describe("AppLayout", () => {
  const defaultPosts = [
    {
      _id: "1",
      id: "1",
      topic: "First Post",
      created: "2023-01-01T00:00:00Z",
    },
    {
      _id: "2",
      id: "2",
      topic: "Second Post",
      created: "2023-01-02T00:00:00Z",
    },
  ];

  const defaultProps = {
    availableTokens: 5,
    posts: defaultPosts,
    postId: "2",
    postCreated: "2023-01-02T00:00:00Z",
  };

  beforeEach(() => {
    useUser.mockReturnValue({ user: null });
  });

  const renderLayout = (contextOverrides = {}, propsOverrides = {}) => {
    const contextValue = {
      posts: defaultPosts,
      setPostsFromSSR: jest.fn(),
      getPosts: jest.fn(),
      noMorePosts: false,
      ...contextOverrides,
    };

    const props = {
      ...defaultProps,
      ...propsOverrides,
    };

    render(
      <PostsContext.Provider value={contextValue}>
        <AppLayout {...props}>
          <div>Child content</div>
        </AppLayout>
      </PostsContext.Provider>
    );

    return contextValue;
  };

  it("renders tokens and authenticated user information", async () => {
    const mockUser = {
      email: "user@example.com",
      name: "User Example",
      picture: "/avatar.png",
    };
    useUser.mockReturnValue({ user: mockUser });

    const context = renderLayout();

    await waitFor(() =>
      expect(context.setPostsFromSSR).toHaveBeenCalledWith(defaultPosts)
    );

    screen.getByText("5 tokens available");
    screen.getByText(mockUser.email);
  });

  it("requests more posts when load more is clicked", () => {
    const getPosts = jest.fn();
    renderLayout({ getPosts, noMorePosts: false });

    fireEvent.click(screen.getByText("Load more posts"));

    expect(getPosts).toHaveBeenCalledWith({
      lastPostDate: "2023-01-02T00:00:00Z",
    });
  });

  it("shows login link when unauthenticated and highlights the active post", () => {
    const contextPosts = [
      {
        _id: "active",
        id: "active",
        topic: "Active Post",
        created: "2023-03-01T00:00:00Z",
      },
    ];

    renderLayout({ posts: contextPosts }, { postId: "active" });

    const loginLink = screen.getByText("Login");
    expect(loginLink.getAttribute("href")).toBe("/api/auth/login");

    const activeLink = screen.getByText("Active Post");
    expect(activeLink.className).toContain("bg-white/20");
  });
});