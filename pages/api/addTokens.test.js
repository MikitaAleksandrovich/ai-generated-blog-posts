const mockStripeSessionCreate = jest
  .fn()
  .mockResolvedValue({ id: "session-id", url: "https://checkout" });

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeSessionCreate,
      },
    },
  }))
);

const mockUsersCollection = {
  updateOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn((name) => {
    if (name === "users") {
      return mockUsersCollection;
    }
    return {};
  }),
};

const mockClient = {
  db: jest.fn(() => mockDb),
};

jest.mock("../../lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve(mockClient),
}));

jest.mock("@auth0/nextjs-auth0", () => ({
  getSession: jest.fn(),
}));

import handler from "./addTokens";
import { getSession } from "@auth0/nextjs-auth0";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test";
  process.env.STRIPE_PRODUCT_PRICE_ID = "price_123";
  getSession.mockResolvedValue({ user: { sub: "auth0|123" } });
  mockUsersCollection.updateOne.mockResolvedValue({});
});

test("creates stripe session and updates user tokens", async () => {
  const req = { headers: { host: "localhost:3000" } };
  const res = createMockRes();

  await handler(req, res);

  expect(mockStripeSessionCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      success_url: expect.stringContaining("localhost:3000/success"),
    })
  );
  expect(mockUsersCollection.updateOne).toHaveBeenCalledWith(
    { auth0Id: "auth0|123" },
    expect.objectContaining({
      $inc: { availableTokens: 10 },
    }),
    { upsert: true }
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    session: { id: "session-id", url: "https://checkout" },
  });
});