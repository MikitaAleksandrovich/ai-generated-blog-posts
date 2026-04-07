jest.mock("@auth0/nextjs-auth0", () => ({
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
import NewPost, { getServerSideProps } from "./new";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";

afterEach(() => {
  delete global.fetch;
});

test("submits form and navigates to new post", async () => {
  const push = jest.fn();
  useRouter.mockReturnValue({ push });

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ postId: "new-id" }),
  });

  render(<NewPost />);

  const textareas = screen.getAllByRole("textbox");
  fireEvent.change(textareas[0], { target: { value: "Blog topic" } });
  fireEvent.change(textareas[1], { target: { value: "keyword1, keyword2" } });

  fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

  await waitFor(() => expect(push).toHaveBeenCalledWith("/post/new-id"));
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/generatePost",
    expect.objectContaining({
      method: "POST",
      headers: { "content-type": "application/json" },
    })
  );
});

test("getServerSideProps redirects when no tokens are available", async () => {
  getAppProps.mockResolvedValue({ availableTokens: 0 });

  const result = await getServerSideProps({ req: {}, res: {} });

  expect(result).toEqual({
    redirect: { destination: "/token-topup", permanent: false },
  });
});

test("getServerSideProps returns props when tokens exist", async () => {
  const props = { availableTokens: 5, posts: [] };
  getAppProps.mockResolvedValue(props);

  const result = await getServerSideProps({ req: {}, res: {} });

  expect(result).toEqual({ props });
});