import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
const DEVICE_HEIGHT = Dimensions.get("window").height;
const DEVICE_WIDTH = Dimensions.get("window").width;

const itemDataStructure = {
  clouds: 2,
  dew_point: 11.89,
  dt: 1716285600,
  feels_like: 23.91,
  humidity: 46,
  pop: 0,
  pressure: 1025,
  temp: 24.23,
  uvi: 6.93,
  visibility: 10000,
  weather: [{ description: "clear sky", icon: "01d", id: 800, main: "Clear" }],
  wind_deg: 135,
  wind_gust: 4.13,
  wind_speed: 3.27,
};

export default function TodaysWather({ hourlyForecast }) {
  const Item = ({ data }) => {
    const date = new Date(data.dt * 1000);
    let hour = date.getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    hour = `${hour}:00`;
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.temperatureText}>{hour}</Text>
        <Image
          style={styles.iconStyle}
          source={{
            uri: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          }}
        />
        <Text style={styles.temperatureText}>{Math.round(data.temp)}°C</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {hourlyForecast.map((data, index) => (
          <Item key={index + ""} data={data} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "pink",
    height: DEVICE_HEIGHT * 0.17,
    width: "100%",
    paddingRight: 5,
    // justifyContent: "center",
    // alignItems: "center",
  },
  scrollViewContainer: {
    // justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    // backgroundColor: "red",
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "95%",
    width: DEVICE_WIDTH * 0.175,
    marginLeft: 5,
  },
  subTempText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  temperatureText: {
    color: "white",
  },
  iconStyle: {
    // backgroundColor: "red",

    width: DEVICE_HEIGHT * 0.09,
    height: DEVICE_HEIGHT * 0.09,
  },
});
