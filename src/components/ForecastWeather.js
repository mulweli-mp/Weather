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
  dew_point: 12,
  dt: 1716282000,
  feels_like: { day: 23.67, eve: 21.8, morn: 13.97, night: 15.21 },
  humidity: 47,
  moon_phase: 0.43,
  moonrise: 1716299460,
  moonset: 1716258000,
  pop: 0,
  pressure: 1025,
  summary: "There will be clear sky today",
  sunrise: 1716265583,
  sunset: 1716304961,
  temp: {
    day: 23.99,
    eve: 22.34,
    max: 24.89,
    min: 13.91,
    morn: 14.24,
    night: 15.82,
  },
  uvi: 6.93,
  weather: [{ description: "clear sky", icon: "01d", id: 800, main: "Clear" }],
  wind_deg: 122,
  wind_gust: 5.52,
  wind_speed: 3.76,
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const monthsOfYear = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ForecastWeather({ dailyForecast }) {
  const Item = ({ data, index }) => {
    const date = new Date(data.dt * 1000);

    const dayIndex = date.getDay();
    const dayName =
      index == 0 ? "Today" : index == 1 ? "Tomorrow" : daysOfWeek[dayIndex];

    // Get the date components
    let month = date.getMonth();
    month = monthsOfYear[month];
    const day = date.getDate(); // Day of the month

    return (
      <View style={styles.itemContainer}>
        <View style={styles.dayContainer}>
          <Text style={styles.generalText}>{dayName}</Text>
          <Text style={styles.dateText}>
            {day} {month}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Image
            style={styles.iconStyle}
            source={{
              uri: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            }}
          />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.generalText}>{data.weather[0].description}</Text>
        </View>
        <View style={styles.tempContainer}>
          <Text style={styles.generalText}>
            {parseInt(data.temp.min)}°/{parseInt(data.temp.max)}°
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {dailyForecast.map((data, index) => (
        <Item key={index + ""} data={data} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "pink",
    minHeight: DEVICE_HEIGHT * 0.17,
    width: "100%",
    paddingRight: 5,
    // justifyContent: "center",
    // alignItems: "center",
  },

  itemContainer: {
    // backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    height: "95%",
    height: DEVICE_HEIGHT * 0.08,
    marginTop: 5,
    flexDirection: "row",
  },
  subTempText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  generalText: {
    color: "white",
  },
  iconStyle: {
    // backgroundColor: "red",
    width: DEVICE_HEIGHT * 0.09,
    height: DEVICE_HEIGHT * 0.09,
  },

  dayContainer: {
    // backgroundColor: "yellow",
    width: "25%",
    height: "100%",
    // alignItems: "center",
    justifyContent: "center",
    paddingLeft: 15,
  },
  iconContainer: {
    // backgroundColor: "cyan",
    width: "20%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionContainer: {
    // backgroundColor: "pink",
    // width: 25,
    height: "100%",
    // alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tempContainer: {
    // backgroundColor: "blue",
    width: "20%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    color: "grey",
    fontSize: 12,
  },
});
