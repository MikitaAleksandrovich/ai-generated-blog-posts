const STORAGE_KEY = "mock-x-sign-ups";

export type SignUpPayload = {
  username: string;
  password: string;
};

export type SignUpResult = {
  username: string;
  handle: string;
};

type StoredUser = {
  id: string;
  username: string;
  usernameNormalized: string;
  password: string;
};

let memoryStore: StoredUser[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUsername = (username: string) =>
  username.trim().replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();

const readUsers = (): StoredUser[] => {
  if (typeof window === "undefined") {
    return memoryStore;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (typeof window === "undefined") {
    memoryStore = users;
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const signUp = async ({
  username,
  password,
}: SignUpPayload): Promise<SignUpResult> => {
  const usernameNormalized = sanitizeUsername(username);

  if (!usernameNormalized) {
    throw new Error("Usernames can include letters, numbers, or underscores.");
  }

  if (usernameNormalized.length < 3) {
    throw new Error("Usernames must be at least 3 characters long.");
  }

  if (password.trim().length < 6) {
    throw new Error("Passwords must contain at least 6 characters.");
  }

  await delay(800);

  const users = readUsers();

  if (users.some((user) => user.usernameNormalized === usernameNormalized)) {
    throw new Error("That handle is already taken. Try something new.");
  }

  const nextUser: StoredUser = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: username.trim(),
    usernameNormalized,
    password: password.trim(),
  };

  writeUsers([...users, nextUser]);

  return {
    username: nextUser.username,
    handle: `@${nextUser.usernameNormalized}`,
  };
};

const mockAuthService = {
  signUp,
};

export default mockAuthService;