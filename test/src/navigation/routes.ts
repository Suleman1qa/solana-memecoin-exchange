export const routes = {
  send: "/(tabs)/send",
  receive: "/(tabs)/receive",
  token: (id: string) => `/(tabs)/token/${id}`,
} as const;
