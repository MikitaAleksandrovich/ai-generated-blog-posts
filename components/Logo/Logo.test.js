import React from "react";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";
import { faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: jest.fn(() => <svg data-testid="fontawesome-icon" />),
}));

describe("Logo", () => {
  beforeEach(() => {
    FontAwesomeIcon.mockClear();
  });

  it("renders brand text and applies the brain icon", () => {
    render(<Logo />);

    screen.getByText("BlogStandard");
    screen.getByTestId("fontawesome-icon");

    expect(FontAwesomeIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: faBrain,
        className: "text-2xl text-slate-400 font-heading",
      })
    );
  });
});