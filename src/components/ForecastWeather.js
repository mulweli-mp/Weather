import { StyleSheet, Text, View, Image } from "react-native";
import weatherIcons from "../utilities/WeatherIcons";

export default function ForecastWeather({ forecastArray }) {
  return (
    <View style={styles.container}>
      {forecastArray.map((item) => (
        <View key={item.day} style={styles.dayWeatherContainer}>
          <View style={styles.decriptionContainer}>
            <Text style={styles.weatherText}>{item.day}</Text>
          </View>
          <View
            style={[
              styles.decriptionContainer,
              {
                alignItems: "center",
              },
            ]}
          >
            <Image
              style={styles.weatherImage}
              source={weatherIcons[item.weather]}
            />
          </View>
          <View
            style={[
              styles.decriptionContainer,
              {
                alignItems: "flex-end",
              },
            ]}
          >
            <Text style={styles.weatherText}>
              {item.temperature.temp_min}° - {item.temperature.temp_max}°
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "pink",
    flex: 1,
    paddingVertical: 7,
  },
  dayWeatherContainer: {
    // backgroundColor: "green",
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  weatherText: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  decriptionContainer: {
    // backgroundColor: "red",
    justifyContent: "center",
    flex: 1,
  },
  weatherImage: {
    height: 25,
    width: 25,
  },
});
