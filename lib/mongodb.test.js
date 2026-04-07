describe("mongodb client", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete global._mongoClientPromise;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("creates a MongoClient when URI is defined", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/test";
    process.env.NODE_ENV = "test";
    const connectMock = jest.fn().mockResolvedValue("connected");

    jest.doMock("mongodb", () => ({
      MongoClient: jest.fn().mockImplementation(() => ({
        connect: connectMock,
      })),
    }));

    const module = await import("./mongodb");
    await expect(module.default).resolves.toBe("connected");
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it("throws when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI;
    jest.doMock("mongodb", () => ({
      MongoClient: jest.fn(),
    }));

    await expect(import("./mongodb")).rejects.toThrow(
      'Invalid/Missing environment variable: "MONGODB_URI"'
    );
  });
});