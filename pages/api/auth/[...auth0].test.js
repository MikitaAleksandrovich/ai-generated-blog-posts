jest.mock("@auth0/nextjs-auth0", () => ({
  handleAuth: jest.fn(() => "auth-handler"),
}));

import handler from "./[...auth0]";
import { handleAuth } from "@auth0/nextjs-auth0";

test("exports Auth0 handler", () => {
  expect(handler).toBe("auth-handler");
  expect(handleAuth).toHaveBeenCalled();
});