import { StyleSheet, Text, View } from "react-native";

export default function TodaysWather({ currentWeather }) {
  return (
    <View style={styles.container}>
      <View style={styles.reportBox}>
        <Text style={styles.subTempText}>
          {currentWeather.minTemperature}°C
        </Text>
        <Text style={styles.labelText}>min</Text>
      </View>
      <View
        style={[
          styles.reportBox,
          {
            alignItems: "center",
          },
        ]}
      >
        <Text style={styles.subTempText}>
          {currentWeather.currentTemperature}°C
        </Text>
        <Text style={styles.labelText}>Current</Text>
      </View>
      <View
        style={[
          styles.reportBox,
          {
            alignItems: "flex-end",
          },
        ]}
      >
        <Text style={styles.subTempText}>
          {currentWeather.maxTemperature}°C
        </Text>
        <Text style={styles.labelText}>max</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "pink",
    height: "18%",
    width: "100%",
    borderBlockColor: "white",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  reportBox: {
    // backgroundColor: "red",
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
  },
  subTempText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  labelText: {
    color: "white",
  },
});
