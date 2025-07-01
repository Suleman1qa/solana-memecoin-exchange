export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "/send": undefined;
      "/receive": undefined;
      "/token/[id]": { id: string };
    }
  }
}
