import { useContext, useState } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { HomeHeader, TodaysWather, ForecastWeather } from "../components";

export default function Home({ navigation }) {
  const [themeColors] = useContext(ThemeContext);
  const [currentWeather, setCurrentWeather] = useState("sunny");
  const [currentTemperature, setCurrentTemperature] = useState(15);
  const [minTemperature, setMinTemperature] = useState(10);
  const [maxTemperature, setMaxTemperature] = useState(17);
  const [forecastArray, setForecastArray] = useState([
    {
      day: "Tuesday",
      temperature: 20,
      weather: "rainy",
    },
    {
      day: "Wednesday",
      temperature: 18,
      weather: "cloudy",
    },
    {
      day: "Thursday",
      temperature: 17,
      weather: "rainy",
    },
    {
      day: "Friday",
      temperature: 13,
      weather: "sunny",
    },
    {
      day: "Saturday",
      temperature: 11,
      weather: "rainy",
    },
  ]);

  const weatherImages = {
    sea: {
      rainy: require("../../assets/Images/sea/rainy.png"),
      sunny: require("../../assets/Images/sea/sunny.png"),
      cloudy: require("../../assets/Images/sea/cloudy.png"),
    },
    forest: {
      rainy: require("../../assets/Images/forest/rainy.png"),
      sunny: require("../../assets/Images/forest/sunny.png"),
      cloudy: require("../../assets/Images/forest/cloudy.png"),
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors[currentWeather],
        },
      ]}
    >
      <ImageBackground
        style={styles.currentWeatherContainer}
        source={weatherImages[themeColors.theme][currentWeather]}
        resizeMode="cover"
      >
        <HomeHeader openDrawer={() => navigation.openDrawer()} />
        <Text style={styles.temperatureText}>{currentTemperature}°C</Text>
        <Text style={styles.weatherDescriptionText}>
          {currentWeather.toUpperCase()}
        </Text>
      </ImageBackground>
      <View style={styles.forecastContainer}>
        <TodaysWather
          minTemperature={minTemperature}
          currentTemperature={currentTemperature}
          maxTemperature={maxTemperature}
        />
        <ForecastWeather forecastArray={forecastArray} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currentWeatherContainer: {
    // backgroundColor: "red",
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  forecastContainer: {
    // backgroundColor: "green",
    flex: 1,
    width: "100%",
  },
  temperatureText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 55,
  },
  weatherDescriptionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
  },
});
