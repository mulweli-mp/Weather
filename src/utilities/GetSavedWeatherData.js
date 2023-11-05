import AsyncStorage from "@react-native-async-storage/async-storage";

const getSavedWeatherData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("weather-data");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    alert(e);
  }
};

export default getSavedWeatherData;
