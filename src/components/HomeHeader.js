import { useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomStatusBar from "./CustomStatusBar";

import { ThemeContext } from "../context/ThemeContext";

export default function HomeHeader({
  openDrawer,
  locationName,
  setLocationModalVisible,
}) {
  const [themeColors] = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.headerContextContainer}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLocationModalVisible(true)}
          style={styles.locationButton}
        >
          <Text numberOfLines={2} style={styles.locationText}>
            {locationName}
          </Text>
          <Ionicons name="ios-chevron-down" size={20} color="white" />
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

  headerContextContainer: {
    // backgroundColor: "pink",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    // backgroundColor: "red",
    height: "80%",
    minWidth: "30%",
    maxWidth: "60%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  locationText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
