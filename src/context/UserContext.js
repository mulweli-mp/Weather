import { useState, createContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userWeatherData, setUserWeatherData] = useState({
    currentLocationWeather: {
      today: {},
      forecast5Days: [],
    },
    savedLocationsWeather: [],
  });

  useEffect(() => {
    getOfflineWeatherData();
  }, []);

  const getOfflineWeatherData = async () => {
    console.log(`Running getOfflineWeatherData`);
    try {
      const jsonValue = await AsyncStorage.getItem("weather-data");
      const savedData = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (savedData) {
        setUserWeatherData(savedData);
      }
    } catch (e) {
      // error reading value
      alert(e);
    }
  };

  const placeAlreadySaved = (savedLocations, valueToCheck) => {
    return savedLocations.some(
      (object) => object["placeName"] === valueToCheck
    );
  };

  const updateUserWeatherData = (newData) => {
    const { today, forecast5Days } = newData;
    const { placeName, latitude, longitude } = today;

    let savedLocations = userWeatherData.savedLocationsWeather;
    if (!placeAlreadySaved(savedLocations, placeName)) {
      let savedLocations = userWeatherData.savedLocationsWeather;
      savedLocations.push({
        placeName,
        latitude,
        longitude,
      });
    }

    let newWeatherData = {
      currentLocationWeather: {
        today,
        forecast5Days,
      },
      savedLocationsWeather: savedLocations,
    };

    setUserWeatherData(newWeatherData);
    storeOfflineWeatherData(newWeatherData);
  };

  const storeOfflineWeatherData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("weather-data", jsonValue);
    } catch (e) {
      // saving error
    }
  };

  return (
    <UserContext.Provider value={[userWeatherData, updateUserWeatherData]}>
      {props.children}
    </UserContext.Provider>
  );
};
