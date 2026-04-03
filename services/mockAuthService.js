export const mockTwitterSignIn = async () => {
  const response = await fetch("/api/mockTwitterSignIn", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Mock Twitter sign-in failed");
  }

  return response.json();
};