import { StyleSheet, View, Dimensions, Image, Animated } from "react-native";

import CustomStatusBar from "./CustomStatusBar";
import bgTheme from "../utilities/BgTheme";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function HomeLayout({ children, scrollY, theme, disableTheme }) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgTheme.naturesCanvas[theme].colour,
        },
      ]}
    >
      <Image
        source={
          disableTheme == true ? null : bgTheme.naturesCanvas[theme].image
        }
        style={styles.bgImage}
      />
      <Animated.View
        style={[
          styles.contentContainer,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, 300],
              outputRange: ["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <CustomStatusBar />
        {children}
      </Animated.View>
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
    position: "absolute",
  },
});
