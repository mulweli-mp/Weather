import { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ThemeContext } from "../context/ThemeContext";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

export default function HomeHeader({ openDrawer }) {
  const [themeColors] = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpace} />
      <View style={styles.headerContextContainer}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "brown",
    height: "23%",
    width: "100%",
    position: "absolute",
    top: 0,
  },

  menuButton: {
    // backgroundColor: "red",
    height: 40,
    width: 40,
    position: "absolute",
    // top: 30,
    left: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBarSpace: {
    // backgroundColor: "green",
    height: STATUSBAR_HEIGHT,
    width: "100%",
  },
  headerContextContainer: {
    // backgroundColor: "pink",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
