import { useState, createContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getSavedWeatherData from "../utilities/GetSavedWeatherData";

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
    try {
      const savedData = await getSavedWeatherData();
      if (savedData) {
        setUserWeatherData(savedData);
      }
    } catch (error) {
      alert(error.message);
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

  const deleteSavedLocation = (newPlaces) => {
    let currentData = userWeatherData;
    let newWeatherData = {
      currentLocationWeather: currentData.currentLocationWeather,
      savedLocationsWeather: newPlaces,
    };
    setUserWeatherData(newWeatherData);
    storeOfflineWeatherData(newWeatherData);
  };

  return (
    <UserContext.Provider
      value={[userWeatherData, updateUserWeatherData, deleteSavedLocation]}
    >
      {props.children}
    </UserContext.Provider>
  );
};
