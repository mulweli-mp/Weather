import { useContext } from "react";

import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";

import { UserContext, ThemeContext } from "../context";

import bgTheme from "../utilities/BgTheme";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function CustomDrawer({ navigation }) {
  const [userWeatherData] = useContext(UserContext);
  // const [themeColors] = useContext(ThemeContext); Will be used in future to handle theme selection e.g naturesCanvas

  const weatherForecast = userWeatherData.currentLocationWeather;
  const theme = weatherForecast.current?.weather[0].icon;

  const menuOptions = [
    {
      optionName: "Theme",
      key: "theme",
      navigationScreen: "Settings",
      iconName: "settings-outline",
    },

    {
      optionName: "Saved Locations",
      key: "saved-locations",
      navigationScreen: "SavedLocations",
      iconName: "location-outline",
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgTheme.naturesCanvas[theme]?.colour,
        },
      ]}
    >
      {weatherForecast.current && (
        <ImageBackground
          style={styles.currentWeatherContainer}
          source={bgTheme.naturesCanvas[theme].image}
          resizeMode="cover"
        >
          <Text style={styles.placetext}>{weatherForecast.placeName}</Text>
          <Text style={styles.temperatureText}>
            {Math.round(weatherForecast.current.temp)}°C
          </Text>
          <Text style={styles.weatherDescriptionText}>
            {weatherForecast.current.weather[0].description}
          </Text>
        </ImageBackground>
      )}
      {menuOptions.map(({ optionName, key, iconName, navigationScreen }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate(navigationScreen)}
          key={key}
          style={styles.menuButton}
        >
          <Ionicons name={iconName} size={24} color="white" />
          <Text style={styles.menuTitleText}>{optionName}</Text>
          <Entypo name="chevron-small-right" size={24} color="white" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    // alignItems: "center",
    // justifyContent: "center",
  },
  currentWeatherContainer: {
    // backgroundColor: "red",
    // flex: 1
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: DEVICE_HEIGHT * 0.3,
    overflow: "hidden",
    borderBottomRightRadius: 10,
  },
  temperatureText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 40,
  },
  weatherDescriptionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
  },
  placetext: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  menuButton: {
    backgroundColor: "#404040",

    height: DEVICE_HEIGHT * 0.06,
    width: "98%",
    marginTop: 7,
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  menuTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 10,
    flex: 1,
  },
});
