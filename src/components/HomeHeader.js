import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function HomeHeader({
  openDrawer,
  placeName,
  setLocationModalVisible,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContextContainer}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLocationModalVisible(true)}
          style={styles.locationButton}
        >
          <Text numberOfLines={2} style={styles.locationText}>
            {placeName}
          </Text>
          <MaterialIcons name="expand-more" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "green",
    minHeight: DEVICE_HEIGHT * 0.08,
    width: "100%",
    // position: "absolute",
    // top: 0,
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
