/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    primary: "#512DA8",
    secondary: "#7C4DFF",
    background: "#FFFFFF",
    card: "#F5F5F5",
    text: "#000000",
    border: "#E0E0E0",
    notification: "#FF4081",
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FFC107",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary: "#7C4DFF",
    secondary: "#512DA8",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#2C2C2C",
    notification: "#FF4081",
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FFC107",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
} as const;
