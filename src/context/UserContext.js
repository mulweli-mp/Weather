import { useState, createContext } from "react";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userWeatherData, setUserWeatherData] = useState({
    currentLocationWeather: {},
    savedLocationsWeather: [],
  });

  const updateUserWeatherData = (fetchOrigion, newData) => {
    let newWeatherData;
    if (fetchOrigion === "currentLocation") {
      newWeatherData = {
        ...userWeatherData,
        ...{
          currentLocationWeather: newData,
        },
      };
    } else {
      let savedLocations = userWeatherData.savedLocationsWeather;
      savedLocations.push(newData);

      newWeatherData = {
        ...userWeatherData,
        ...{
          savedLocationsWeather: savedLocations,
        },
      };
    }
    setUserWeatherData(newWeatherData);
  };

  return (
    <UserContext.Provider value={[userWeatherData, updateUserWeatherData]}>
      {props.children}
    </UserContext.Provider>
  );
};
