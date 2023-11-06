import { useContext } from "react";

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context";

import { CustomStatusBar } from "../components";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function Settings({ navigation }) {
  const [themeColors, changeTheme] = useContext(ThemeContext);

  const RadioButton = ({ isSelected }) => (
    <View
      style={[
        styles.radioContainer,
        {
          borderColor: isSelected ? "white" : "grey",
        },
      ]}
    >
      {isSelected && <View style={styles.radioFill} />}
    </View>
  );
  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Choose Theme</Text>
      </View>

      <View style={styles.themeContainer}>
        <TouchableOpacity
          onPress={() => changeTheme("forest")}
          style={[
            styles.themePicker,
            { borderColor: themeColors.theme == "forest" ? "white" : "grey" },
          ]}
        >
          <Image
            source={require("../../assets/Images/theme-forest.jpg")}
            style={styles.indicatorImage}
            resizeMode={"contain"}
          />
          <View style={styles.selectedIndicator}>
            <RadioButton isSelected={themeColors.theme === "forest"} />
          </View>
          <Text style={{ color: "grey" }}>Forest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeTheme("sea")}
          style={[
            styles.themePicker,
            { borderColor: themeColors.theme == "sea" ? "white" : "grey" },
          ]}
        >
          <Image
            source={require("../../assets/Images/theme-sea.jpg")}
            style={styles.indicatorImage}
            resizeMode={"contain"}
          />
          <View style={styles.selectedIndicator}>
            <RadioButton isSelected={themeColors.theme === "sea"} />
          </View>
          <Text style={{ color: "grey" }}>Sea</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    // justifyContent: "center",
  },

  headerContainer: {
    backgroundColor: "#303030",
    height: DEVICE_HEIGHT * 0.07,
    width: "100%",
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
    // elevation: 2,
  },
  backButton: {
    // backgroundColor: "white",
    height: DEVICE_HEIGHT * 0.06,
    width: DEVICE_HEIGHT * 0.06,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    color: "white",
    fontSize: 17,
    marginLeft: 7,
    fontWeight: "bold",
  },

  themeContainer: {
    height: DEVICE_HEIGHT * 0.4,
    width: "95%",
    marginTop: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // backgroundColor: "green",
  },
  themePicker: {
    // backgroundColor: "red",
    height: "85%",
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "grey",
    padding: 15,
  },
  indicatorImage: {
    height: "80%",
    width: "90%",
  },
  selectedIndicator: {
    marginTop: 10,
  },
  radioContainer: {
    // backgroundColor: "orange",
    height: DEVICE_HEIGHT * 0.025,
    width: DEVICE_HEIGHT * 0.025,
    borderRadius: (DEVICE_HEIGHT * 0.025) / 2,
    borderColor: "grey",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioFill: {
    backgroundColor: "white",
    height: DEVICE_HEIGHT * 0.015,
    width: DEVICE_HEIGHT * 0.015,
    borderRadius: (DEVICE_HEIGHT * 0.015) / 2,
  },
});
