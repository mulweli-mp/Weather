import { View, Platform, StatusBar } from "react-native";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

export default function CustomStatusBar() {
  return (
    <View
      style={{
        height: STATUSBAR_HEIGHT,
        width: "100%",
        // backgroundColor: "red",
      }}
    />
  );
}
