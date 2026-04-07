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
import { render, screen } from "@testing-library/react";
import Success, { getServerSideProps } from "./success";
import { getAppProps } from "../utils/getAppProps";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

test("renders thank you message", () => {
  render(<Success />);
  expect(
    screen.getByText(/Thank you for your purchase/i)
  ).toBeInTheDocument();
});

test("getLayout wraps content with AppLayout", () => {
  const layout = Success.getLayout(<div>Page Content</div>, {
    availableTokens: 5,
  });
  const { getByTestId } = render(layout);
  expect(getByTestId("layout")).toHaveTextContent("Page Content");
});

test("getServerSideProps returns helper props", async () => {
  getAppProps.mockResolvedValue({ availableTokens: 10 });

  const result = await getServerSideProps({ req: {}, res: {} });

  expect(result).toEqual({ props: { availableTokens: 10 } });
  expect(withPageAuthRequired).toHaveBeenCalled();
});