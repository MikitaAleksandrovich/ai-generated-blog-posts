import React from "react";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

test("renders logo text", () => {
  render(<Logo />);
  expect(screen.getByText("BlogStandard")).toBeInTheDocument();
});