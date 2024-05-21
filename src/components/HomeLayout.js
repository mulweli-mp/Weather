import { StyleSheet, View, Dimensions, Image } from "react-native";

import CustomStatusBar from "./CustomStatusBar";
import bgTheme from "../utilities/BgTheme";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function HomeLayout({ children }) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgTheme.day.clear.colour,
        },
      ]}
    >
      <Image source={bgTheme.day.clear.image} style={styles.bgImage} />
      <View style={styles.contentContainer}>
        <CustomStatusBar />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    height: DEVICE_HEIGHT * 0.5,
    width: "100%",
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0, 0.7)",
    position: "absolute",
  },
});
