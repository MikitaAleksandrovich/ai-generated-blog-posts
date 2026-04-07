jest.mock("../components/AppLayout", () => ({
  AppLayout: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("../utils/getAppProps", () => ({
  getAppProps: jest.fn(),
}));

jest.mock("@auth0/nextjs-auth0", () => ({
  withPageAuthRequired: jest.fn((options) => options.getServerSideProps),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TokenTopup, { getServerSideProps } from "./token-topup";
import { getAppProps } from "../utils/getAppProps";

const originalLocation = window.location;

beforeAll(() => {
  delete window.location;
  window.location = { href: "" };
});

afterAll(() => {
  window.location = originalLocation;
});

afterEach(() => {
  delete global.fetch;
});

test("initiates checkout session on button click", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        session: { url: "https://stripe-session" },
      }),
  });

  render(<TokenTopup />);

  fireEvent.click(screen.getByRole("button", { name: /Add Tokens/i }));

  await waitFor(() =>
    expect(window.location.href).toBe("https://stripe-session")
  );
  expect(global.fetch).toHaveBeenCalledWith("/api/addTokens", {
    method: "POST",
  });
});

test("getServerSideProps returns helper props", async () => {
  getAppProps.mockResolvedValue({ availableTokens: 4 });

  const result = await getServerSideProps({ req: {}, res: {} });

  expect(result).toEqual({ props: { availableTokens: 4 } });
});