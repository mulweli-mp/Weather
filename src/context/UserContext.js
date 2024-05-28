import { useState, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getSavedWeatherData from "../utilities/GetSavedWeatherData";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userWeatherData, setUserWeatherData] = useState({
    currentLocationWeather: {},
    savedLocationsWeather: [],
  });

  const placeAlreadySaved = (savedLocations, valueToCheck) => {
    return savedLocations.some(
      (object) => object["placeName"] === valueToCheck
    );
  };

  const updateUserWeatherData = async (weatherForecast) => {
    const { placeName, latitude, longitude } = weatherForecast;

    try {
      const savedData = await getSavedWeatherData();
      let savedLocations = [];
      if (savedData) {
        setUserWeatherData(savedData);
        savedLocations = savedData.savedLocationsWeather;
      }

      if (!placeAlreadySaved(savedLocations, placeName)) {
        let savedLocations = savedData.savedLocationsWeather;
        savedLocations.push({
          placeName,
          latitude,
          longitude,
        });
      }

      let newWeatherData = {
        currentLocationWeather: weatherForecast,
        savedLocationsWeather: savedLocations,
      };

      setUserWeatherData(newWeatherData);
      storeOfflineWeatherData(newWeatherData);
    } catch (error) {
      alert(error.message);
    }
  };

  const storeOfflineWeatherData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("weather-data", jsonValue);
    } catch (e) {
      // saving error
      alert(e);
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
