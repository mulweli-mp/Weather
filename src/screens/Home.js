import { useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { OPEN_WEATHER_API_KEY } from "@env";

import { ThemeContext } from "../context/ThemeContext";
import {
  HomeHeader,
  TodaysWather,
  ForecastWeather,
  LoadingAnimation,
  LocationPermision,
} from "../components";

export default function Home({ navigation }) {
  const [themeColors] = useContext(ThemeContext);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [currentWeather, setCurrentWeather] = useState("sunny");
  const [currentTemperature, setCurrentTemperature] = useState(15);
  const [minTemperature, setMinTemperature] = useState(10);
  const [maxTemperature, setMaxTemperature] = useState(17);
  const [forecastArray, setForecastArray] = useState([]);

  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

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

  // useEffect(() => {
  //  }, []);

  const weatherCategories = {
    Clear: "sunny",
    Rain: "rainy",
    Drizzle: "rainy",
    Thunderstorm: "rainy",
    Clouds: "cloudy",
    Snow: "cloudy",
    Mist: "cloudy",
    Fog: "cloudy",
  };

  const fetchWeatherData = async (latitude, longitude) => {
    const apiUrl = "http://api.openweathermap.org/data/2.5/weather";
    try {
      setIsLoadingCurrent(true);

      const response = await fetch(
        `${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        console.warn("Network response was not ok");
      }

      const data = await response.json();

      const { main, weather } = data;
      const { temp, temp_min, temp_max } = main;
      const { main: weatherMain, description } = weather[0];

      const general = weatherCategories[weatherMain] || "unknown";

      setCurrentTemperature(Math.round(temp));
      setMaxTemperature(Math.round(temp_max));
      setMinTemperature(Math.round(temp_min));

      setCurrentWeather({ general, main: weatherMain, description });
      setIsLoadingCurrent(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setIsLoadingCurrent(false);
    }
  };

  const fetchFiveDayWeatherForecast = async (latitude, longitude) => {
    const apiUrl = "http://api.openweathermap.org/data/2.5/forecast";
    try {
      setIsLoadingCurrent(true);
      const response = await fetch(
        `${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        console.warn("Network response was not ok");
      }

      const data = await response.json();

      // Extract relevant data for the next 5 days
      const forecastList = data.list;
      const fiveDayForecast = [];

      // Get today's date and initialize a variable for the day of the week
      let currentDate = new Date();
      let currentDay = currentDate.getDay();
      const today = currentDay;

      // Define an array of day names for formatting
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let minTemp;
      let maxTemp;
      for (const forecast of forecastList) {
        const date = new Date(forecast.dt * 1000); // Convert timestamp to date
        const dayOfWeek = dayNames[date.getDay()];

        if (date.getDay() === today) {
          //Do nothing and move to the next day
        } else if (date.getDay() !== currentDay) {
          // It's a new day, add the forecast to the result
          const dayForecast = forecast.weather[0].main;
          const weather = weatherCategories[dayForecast] || "unknown";

          const { temp } = forecast.main;
          minTemp = temp;
          maxTemp = temp;

          fiveDayForecast.push({
            day: dayOfWeek,
            weather,
            temperature: {
              temp_min: Math.round(minTemp),
              temp_max: Math.round(maxTemp),
            },
          });

          // Move to the next day
          currentDay = date.getDay();
        } else {
          //Basically, we loop through all the results of the same day
          //get the lowest and highest temperatures at different times of the day
          //and use the lowest as temp_min and the highest as temp_max

          const { temp } = forecast.main;
          minTemp = temp < minTemp ? temp : minTemp;
          maxTemp = temp > maxTemp ? temp : maxTemp;

          const lastPushedObjIndex = fiveDayForecast.length - 1;

          fiveDayForecast[lastPushedObjIndex].temperature = {
            temp_min: Math.round(minTemp),
            temp_max: Math.round(maxTemp),
          };
        }
      }
      // console.log(`fiveDayForecast:`, fiveDayForecast);

      setForecastArray(fiveDayForecast);
      setIsLoadingForecast(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setIsLoadingForecast(false);
    }
  };

  const fetchWeatherForecast = (latitude, longitude) => {
    setIsFetchingLocation(false);
    fetchWeatherData(latitude, longitude);
    fetchFiveDayWeatherForecast(latitude, longitude);
  };

  if (isFetchingLocation) {
    return <LocationPermision fetchWeatherForecast={fetchWeatherForecast} />;
  }

  if (isLoadingCurrent || isLoadingForecast) {
    return <LoadingAnimation />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors[currentWeather.general],
        },
      ]}
    >
      <ImageBackground
        style={styles.currentWeatherContainer}
        source={weatherImages[themeColors.theme][currentWeather.general]}
        resizeMode="cover"
      >
        <HomeHeader openDrawer={() => navigation.openDrawer()} />
        <Text style={styles.temperatureText}>{currentTemperature}°C</Text>
        <Text style={styles.weatherDescriptionText}>
          {currentWeather.description.toUpperCase()}
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
