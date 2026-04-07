import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./index";

test("renders hero content and begin link", () => {
  render(<Home />);
  expect(
    screen.getByText(/The AI-powered SAAS solution/i)
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Begin/i })).toHaveAttribute(
    "href",
    "/post/new"
  );
});