const React = require("react");

require("@testing-library/jest-dom/extend-expect");

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => React.createElement("img", props),
}));

jest.mock(
  "next/link",
  () =>
    ({ children, href, ...rest }) =>
      React.createElement("a", { href, ...rest }, children)
);