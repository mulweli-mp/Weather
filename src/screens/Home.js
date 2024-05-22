import { useContext, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Vibration,
  AppState,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import { OPEN_WEATHER_API_KEY } from "@env";

import { ThemeContext, UserContext } from "../context";
import {
  HomeHeader,
  TodaysWather,
  ForecastWeather,
  LoadingAnimation,
  LocationPermision,
  EditLocation,
  DisplayError,
  AudioPlayer,
} from "../components";
import { temperatureReadOutSounds, weatherAudioData } from "../utilities";
import getSavedWeatherData from "../utilities/GetSavedWeatherData";
import weatherCategories from "../utilities/WeatherCategories";
import weatherImages from "../utilities/WeatherImages";
import HomeLayout from "../components/HomeLayout";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

export default function Home({ navigation }) {
  const [themeColors] = useContext(ThemeContext);
  const [userWeatherData, updateUserWeatherData] = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastArray, setForecastArray] = useState([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [lastUpdatedTime, setlastUpdatedTime] = useState("Just Now");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSearchingManually, setIsSearchingManually] = useState(false);
  const [audioControls, setAudioControls] = useState({
    isPlaying: false,
    isSilent: false,
  });
  const [readWeatherAudioData, setReadWeatherAudioData] = useState(null);
  const sounds = useRef([]);

  // useEffect(() => {
  //   const subscription = AppState.addEventListener(
  //     "change",
  //     _handleAppStateChange
  //   );

  //   syncUpdateTime();
  //   const intervalId = setInterval(() => {
  //     syncUpdateTime();
  //   }, 30000);

  //   // Clear subscription and interval
  //   return () => {
  //     clearInterval(intervalId);
  //     subscription.remove();
  //   };
  // }, [weatherForecast]);

  const _handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      //App came to the foreground
      if (weatherForecast) {
        const minutesDifference = calculateMinutesDifference(
          currentWeather?.timeUpdated,
          new Date()
        );

        if (minutesDifference > 60) {
          //Reason for this refresh is:
          //A user may keep the app in the background for hours
          //After which if they foreground the app, it will still display outdated weather information
          //And it will be a bad user experience to let the user figure it out on their own that they have to...
          //Press REFRESH or Reload the app to get the latest weather information
          fetchWeatherForecastII({
            latitude: weatherForecast.latitude,
            longitude: weatherForecast.longitude,
            placeName: weatherForecast.placeName,
            silentRefresh: true,
          });
        }
      }
    }
  };

  const syncUpdateTime = () => {
    if (currentWeather) {
      const minutesDifference = calculateMinutesDifference(
        currentWeather?.timeUpdated,
        new Date()
      );

      let lastUpdateString = "";

      if (minutesDifference < 2) {
        lastUpdateString = "Just Now";
      } else if (minutesDifference > 2 && minutesDifference < 60) {
        lastUpdateString = `${parseInt(minutesDifference)} mins ago`;
      } else {
        const hoursDifference = minutesDifference / 60;
        if (hoursDifference < 24) {
          lastUpdateString =
            parseInt(hoursDifference) == 1
              ? "an hour ago"
              : `${parseInt(hoursDifference)} hours ago`;
        } else {
          const dateUpdated = new Date(currentWeather?.timeUpdated);
          lastUpdateString = `${dateUpdated}`.substring(0, 21);
        }
      }

      setlastUpdatedTime(lastUpdateString);
    }
  };

  const calculateMinutesDifference = (timestamp1, timestamp2) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    // Calculate the time difference in milliseconds
    const timeDifference = date2 - date1;

    // Convert milliseconds to minutes (1 minute = 60,000 milliseconds)
    const minutesDifference = timeDifference / 60000;

    return minutesDifference;
  };

  const processCurrentWeatherData = (data) => {
    const { main, weather, name, latitude, longitude, searchQueryPlaceName } =
      data;
    const { temp, temp_min, temp_max } = main;
    const { main: weatherMain, description } = weather[0];

    const general = weatherCategories[weatherMain] || "unknown";
    const placeName = searchQueryPlaceName ? searchQueryPlaceName : name;

    const currentTemperature = Math.round(temp);
    const minTemperature = Math.round(temp_min);
    const maxTemperature = Math.round(temp_max);

    const timeUpdated = new Date();

    const weatherData = {
      general,
      main: weatherMain,
      description,
      placeName,
      currentTemperature,
      latitude,
      longitude,
      timeUpdated,
      minTemperature,
      maxTemperature,
    };

    setCurrentWeather(weatherData);
    setIsLoadingCurrent(false);
  };

  const processFiveDayWeatherForecast = (data) => {
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

    setForecastArray(fiveDayForecast);
    setIsLoadingForecast(false);
  };

  const fetchWeatherForecast = async (data) => {
    console.log(`OPEN_WEATHER_API_KEY:`, OPEN_WEATHER_API_KEY);
    const currentWeatherApiUrl =
      "https://api.openweathermap.org/data/2.5/weather";

    const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";

    const { latitude, longitude, placeName, silentRefresh } = data;

    try {
      if (!silentRefresh) {
        //silentRefresh is important to keep the offline mode persistent
        //If the weather information is outdated, we need to have the ability to refresh it without clearing data on screen
        setIsLoadingCurrent(true);
        setIsLoadingForecast(true);
      }

      setIsFetchingLocation(false);
      setIsSearchingManually(false);

      //Fetch data for current weather
      const currentWeatherResponse = await fetch(
        `${currentWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!currentWeatherResponse.ok) {
        setErrorMessage(
          "Something went wrong fetching current weather data. Please try again later"
        );
      }

      const currentWeatherData = await currentWeatherResponse.json();
      // console.log(`currentWeatherData:`, currentWeatherData);
      processCurrentWeatherData({
        ...currentWeatherData,
        latitude,
        longitude,
        searchQueryPlaceName: placeName,
      });

      //Fetch data for future weather forecast

      const forecastWeatherResponse = await fetch(
        `${forecastApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!forecastWeatherResponse.ok) {
        setErrorMessage(
          "Something went wrong fetching future forecast weather data. Please try again later"
        );
      }

      const forecastWeatherData = await forecastWeatherResponse.json();
      processFiveDayWeatherForecast(forecastWeatherData);
      // console.log(`forecastWeatherData:`, forecastWeatherData);
    } catch (error) {
      getOfflineWeatherData(error.message);
    }
  };

  const getOfflineWeatherData = async (errorText) => {
    try {
      const savedData = await getSavedWeatherData();
      if (savedData) {
        //Previously saved data is available
        const { today, forecast5Days } = savedData.currentLocationWeather;
        setForecastArray(forecast5Days);
        setCurrentWeather(today);
        setIsLoadingCurrent(false);
        setIsLoadingForecast(false);

        const errorTitle =
          errorText == "Network request failed"
            ? "No internet connection!"
            : "Something went wrong!";

        const errorBody =
          errorText == "Network request failed"
            ? "Please note that the displayed weather information may be outdated"
            : errorText;

        Alert.alert(errorTitle, errorBody, [
          {
            text: "Noted",
            style: "cancel",
          },
        ]);
        Vibration.vibrate();
      } else {
        setErrorMessage(errorText);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const searchManually = () => {
    setIsFetchingLocation(false);
    setIsSearchingManually(true);
    setLocationModalVisible(true);
  };
  const cancelManualSearch = () => {
    setIsFetchingLocation(true);
    setIsSearchingManually(false);
  };

  const fetchWeatherForecastII = async (data) => {
    setIsLoading(true);
    const currentWeatherApiUrl =
      "https://api.openweathermap.org/data/3.0/onecall";

    const { latitude, longitude } = data;

    try {
      // if (!silentRefresh) {
      //   //silentRefresh is important to keep the offline mode persistent
      //   //If the weather information is outdated, we need to have the ability to refresh it without clearing data on screen
      //   setIsLoadingCurrent(true);
      //   setIsLoadingForecast(true);
      // }

      setIsFetchingLocation(false);
      setIsSearchingManually(false);

      const currentWeatherResponse = await fetch(
        `${currentWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric&exclude=minutely,alerts`
      );

      if (!currentWeatherResponse.ok) {
        alert(
          "Something went wrong fetching weather data. Please try again later"
        );
        setIsLoading(false);
      }

      const currentWeatherData = await currentWeatherResponse.json();
      setWeatherForecast({
        ...currentWeatherData,
        ...data,
        placeName: "Makonde",
      });

      const audioInput = weatherAudioData(currentWeatherData);
      console.log(`audioInput:`, audioInput);
      playWeatherAudio(audioInput);
      setReadWeatherAudioData(audioInput);

      setIsLoading(false);
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  const playWeatherAudio = async (audioInput) => {
    const data = audioInput ? audioInput : readWeatherAudioData;
    if (!data) {
      alert("Audio could not play");
      return;
    }
    const fileUri = FileSystem.documentDirectory;

    let currentTempResolve = temperatureReadOutSounds(data.currentTemp);
    currentTempResolve = currentTempResolve.map(
      (number) => `${fileUri}${number}.mp3`
    );

    const audioFiles = [
      `${fileUri}${data.timeOfDayDescription}${data.timeOfDayNumber}.mp3`,
      `${fileUri}${data.timeOfDayDescription}-pre_temp${data.pre_temp}.mp3`,
      `${fileUri}${data.currentTempDecription}.mp3`,
      ...currentTempResolve,
      `${fileUri}${data.unit}.mp3`,
    ];

    console.log("loading sounds");
    try {
      const loadedSounds = await Promise.all(
        audioFiles.map(async (localAudioUri) => {
          console.log("localAudioUri", localAudioUri);
          const { sound } = await Audio.Sound.createAsync({
            uri: localAudioUri,
          });
          return sound;
        })
      );

      // setSounds(loadedSounds);
      sounds.current = loadedSounds;
      // setIsLoading(false);
      console.log("sounds loaded");
      playSoundAtIndex(0);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  const playSoundAtIndex = async (index) => {
    if (index < sounds.current?.length) {
      const sound = sounds.current[index];

      // Set listener for playback status updates
      const statusListener = sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          // Play the next sound when the current sound finishes
          playSoundAtIndex(index + 1);
          //Unload the sound once it is done playing
          sound.unloadAsync();
        }
      });

      // Play the current sound
      await sound.replayAsync();
      const controlsState = audioControls;
      setAudioControls({
        ...controlsState,
        isPlaying: true,
      });
    } else {
      // alert("done playing");
      const controlsState = audioControls;
      setAudioControls({
        ...controlsState,
        isPlaying: false,
      });
    }
  };

  const data = {
    current: {
      clouds: 2,
      dew_point: 11.89,
      dt: 1716286051,
      feels_like: 23.91,
      humidity: 46,
      pressure: 1025,
      sunrise: 1716265583,
      sunset: 1716304961,
      temp: 24.23,
      uvi: 6.93,
      visibility: 10000,
      weather: [
        { description: "clear sky", icon: "01d", id: 800, main: "Clear" },
      ],
      wind_deg: 135,
      wind_gust: 4.13,
      wind_speed: 3.27,
    },
    daily: [
      {
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
        weather: [
          { description: "clear sky", icon: "01d", id: 800, main: "Clear" },
        ],
        wind_deg: 122,
        wind_gust: 5.52,
        wind_speed: 3.76,
      },
      {
        clouds: 0,
        dew_point: 10.39,
        dt: 1716368400,
        feels_like: [Object],
        humidity: 48,
        moon_phase: 0.46,
        moonrise: 1716388020,
        moonset: 1716347700,
        pop: 0,
        pressure: 1026,
        summary: "There will be clear sky today",
        sunrise: 1716352010,
        sunset: 1716391343,
        temp: [Object],
        uvi: 7.1,
        weather: [Array],
        wind_deg: 119,
        wind_gust: 4.17,
        wind_speed: 3.2,
      },
      {
        clouds: 0,
        dew_point: 10.26,
        dt: 1716454800,
        feels_like: [Object],
        humidity: 44,
        moon_phase: 0.5,
        moonrise: 1716477000,
        moonset: 1716437520,
        pop: 0,
        pressure: 1023,
        summary: "There will be clear sky today",
        sunrise: 1716438437,
        sunset: 1716477727,
        temp: [Object],
        uvi: 7.02,
        weather: [Array],
        wind_deg: 84,
        wind_gust: 2.18,
        wind_speed: 2.28,
      },
      {
        clouds: 0,
        dew_point: 8.26,
        dt: 1716541200,
        feels_like: [Object],
        humidity: 33,
        moon_phase: 0.53,
        moonrise: 1716566340,
        moonset: 1716527520,
        pop: 0,
        pressure: 1021,
        summary: "There will be clear sky today",
        sunrise: 1716524865,
        sunset: 1716564111,
        temp: [Object],
        uvi: 6.91,
        weather: [Array],
        wind_deg: 115,
        wind_gust: 5.69,
        wind_speed: 3.35,
      },
      {
        clouds: 0,
        dew_point: 9.68,
        dt: 1716627600,
        feels_like: [Object],
        humidity: 42,
        moon_phase: 0.56,
        moonrise: 1716656040,
        moonset: 1716617520,
        pop: 0,
        pressure: 1022,
        summary: "There will be clear sky today",
        sunrise: 1716611292,
        sunset: 1716650496,
        temp: [Object],
        uvi: 7.04,
        weather: [Array],
        wind_deg: 106,
        wind_gust: 2.38,
        wind_speed: 2.25,
      },
      {
        clouds: 0,
        dew_point: 6.44,
        dt: 1716714000,
        feels_like: [Object],
        humidity: 27,
        moon_phase: 0.6,
        moonrise: 1716746100,
        moonset: 1716707460,
        pop: 0,
        pressure: 1020,
        summary: "There will be clear sky today",
        sunrise: 1716697718,
        sunset: 1716736883,
        temp: [Object],
        uvi: 8,
        weather: [Array],
        wind_deg: 69,
        wind_gust: 2.98,
        wind_speed: 2.16,
      },
      {
        clouds: 0,
        dew_point: 10.74,
        dt: 1716800400,
        feels_like: [Object],
        humidity: 46,
        moon_phase: 0.63,
        moonrise: 1716836280,
        moonset: 1716797160,
        pop: 0,
        pressure: 1026,
        summary: "There will be clear sky today",
        sunrise: 1716784145,
        sunset: 1716823271,
        temp: [Object],
        uvi: 8,
        weather: [Array],
        wind_deg: 118,
        wind_gust: 6.37,
        wind_speed: 4.39,
      },
      {
        clouds: 24,
        dew_point: 12.17,
        dt: 1716886800,
        feels_like: [Object],
        humidity: 49,
        moon_phase: 0.67,
        moonrise: 1716926580,
        moonset: 1716886500,
        pop: 0,
        pressure: 1027,
        summary:
          "The day will start with clear sky through the late morning hours, transitioning to partly cloudy",
        sunrise: 1716870571,
        sunset: 1716909659,
        temp: [Object],
        uvi: 8,
        weather: [Array],
        wind_deg: 106,
        wind_gust: 4.29,
        wind_speed: 2.93,
      },
    ],
    hourly: [
      {
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
        weather: [
          { description: "clear sky", icon: "01d", id: 800, main: "Clear" },
        ],
        wind_deg: 135,
        wind_gust: 4.13,
        wind_speed: 3.27,
      },
      {
        clouds: 2,
        dew_point: 11.7,
        dt: 1716289200,
        feels_like: 24.06,
        humidity: 45,
        pop: 0,
        pressure: 1025,
        temp: 24.39,
        uvi: 6.18,
        visibility: 10000,
        weather: [Array],
        wind_deg: 131,
        wind_gust: 4.16,
        wind_speed: 3.45,
      },
      {
        clouds: 2,
        dew_point: 11.28,
        dt: 1716292800,
        feels_like: 24.33,
        humidity: 43,
        pop: 0,
        pressure: 1024,
        temp: 24.68,
        uvi: 4.4,
        visibility: 10000,
        weather: [Array],
        wind_deg: 128,
        wind_gust: 4.27,
        wind_speed: 3.62,
      },
      {
        clouds: 1,
        dew_point: 10.38,
        dt: 1716296400,
        feels_like: 24.48,
        humidity: 40,
        pop: 0,
        pressure: 1023,
        temp: 24.89,
        uvi: 2.37,
        visibility: 10000,
        weather: [Array],
        wind_deg: 125,
        wind_gust: 4.37,
        wind_speed: 3.73,
      },
      {
        clouds: 0,
        dew_point: 10.06,
        dt: 1716300000,
        feels_like: 24.08,
        humidity: 40,
        pop: 0,
        pressure: 1023,
        temp: 24.53,
        uvi: 0.83,
        visibility: 10000,
        weather: [Array],
        wind_deg: 122,
        wind_gust: 4.36,
        wind_speed: 3.76,
      },
      {
        clouds: 0,
        dew_point: 9.63,
        dt: 1716303600,
        feels_like: 21.8,
        humidity: 45,
        pop: 0,
        pressure: 1023,
        temp: 22.34,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 120,
        wind_gust: 5.52,
        wind_speed: 2.97,
      },
      {
        clouds: 0,
        dew_point: 9.65,
        dt: 1716307200,
        feels_like: 18.41,
        humidity: 56,
        pop: 0,
        pressure: 1023,
        temp: 18.99,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 118,
        wind_gust: 1.98,
        wind_speed: 1.75,
      },
      {
        clouds: 0,
        dew_point: 9.57,
        dt: 1716310800,
        feels_like: 17.39,
        humidity: 59,
        pop: 0,
        pressure: 1024,
        temp: 17.99,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 119,
        wind_gust: 1.52,
        wind_speed: 1.21,
      },
      {
        clouds: 0,
        dew_point: 9.55,
        dt: 1716314400,
        feels_like: 16.82,
        humidity: 61,
        pop: 0,
        pressure: 1025,
        temp: 17.43,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 128,
        wind_gust: 1.16,
        wind_speed: 0.83,
      },
      {
        clouds: 0,
        dew_point: 9.51,
        dt: 1716318000,
        feels_like: 16.24,
        humidity: 63,
        pop: 0,
        pressure: 1025,
        temp: 16.85,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 135,
        wind_gust: 1.16,
        wind_speed: 0.74,
      },
      {
        clouds: 0,
        dew_point: 9.46,
        dt: 1716321600,
        feels_like: 15.67,
        humidity: 65,
        pop: 0,
        pressure: 1025,
        temp: 16.29,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 167,
        wind_gust: 0.97,
        wind_speed: 0.55,
      },
      {
        clouds: 0,
        dew_point: 9.32,
        dt: 1716325200,
        feels_like: 15.21,
        humidity: 67,
        pop: 0,
        pressure: 1025,
        temp: 15.82,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 175,
        wind_gust: 0.97,
        wind_speed: 0.74,
      },
      {
        clouds: 0,
        dew_point: 9.31,
        dt: 1716328800,
        feels_like: 14.63,
        humidity: 69,
        pop: 0,
        pressure: 1025,
        temp: 15.25,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 196,
        wind_gust: 1.15,
        wind_speed: 1.08,
      },
      {
        clouds: 0,
        dew_point: 9.31,
        dt: 1716332400,
        feels_like: 14.24,
        humidity: 72,
        pop: 0,
        pressure: 1025,
        temp: 14.82,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 206,
        wind_gust: 1.52,
        wind_speed: 1.55,
      },
      {
        clouds: 0,
        dew_point: 9.34,
        dt: 1716336000,
        feels_like: 13.71,
        humidity: 74,
        pop: 0,
        pressure: 1026,
        temp: 14.29,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 203,
        wind_gust: 1.74,
        wind_speed: 1.82,
      },
      {
        clouds: 0,
        dew_point: 9.43,
        dt: 1716339600,
        feels_like: 13.13,
        humidity: 78,
        pop: 0,
        pressure: 1026,
        temp: 13.67,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 194,
        wind_gust: 1.73,
        wind_speed: 1.84,
      },
      {
        clouds: 0,
        dew_point: 9.51,
        dt: 1716343200,
        feels_like: 12.54,
        humidity: 81,
        pop: 0,
        pressure: 1026,
        temp: 13.06,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 200,
        wind_gust: 1.76,
        wind_speed: 1.72,
      },
      {
        clouds: 0,
        dew_point: 9.66,
        dt: 1716346800,
        feels_like: 12.16,
        humidity: 84,
        pop: 0,
        pressure: 1026,
        temp: 12.65,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 207,
        wind_gust: 1.78,
        wind_speed: 1.79,
      },
      {
        clouds: 0,
        dew_point: 9.82,
        dt: 1716350400,
        feels_like: 11.9,
        humidity: 87,
        pop: 0,
        pressure: 1026,
        temp: 12.34,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 211,
        wind_gust: 1.77,
        wind_speed: 1.78,
      },
      {
        clouds: 0,
        dew_point: 10.07,
        dt: 1716354000,
        feels_like: 12.59,
        humidity: 85,
        pop: 0,
        pressure: 1027,
        temp: 13.01,
        uvi: 0.14,
        visibility: 10000,
        weather: [Array],
        wind_deg: 212,
        wind_gust: 2.09,
        wind_speed: 1.74,
      },
      {
        clouds: 1,
        dew_point: 10.93,
        dt: 1716357600,
        feels_like: 15.65,
        humidity: 73,
        pop: 0,
        pressure: 1027,
        temp: 16.08,
        uvi: 0.92,
        visibility: 10000,
        weather: [Array],
        wind_deg: 192,
        wind_gust: 2.27,
        wind_speed: 1.56,
      },
      {
        clouds: 1,
        dew_point: 11.43,
        dt: 1716361200,
        feels_like: 18.3,
        humidity: 64,
        pop: 0,
        pressure: 1027,
        temp: 18.7,
        uvi: 2.53,
        visibility: 10000,
        weather: [Array],
        wind_deg: 170,
        wind_gust: 2.14,
        wind_speed: 1.59,
      },
      {
        clouds: 0,
        dew_point: 11.14,
        dt: 1716364800,
        feels_like: 20.35,
        humidity: 55,
        pop: 0,
        pressure: 1026,
        temp: 20.78,
        uvi: 4.61,
        visibility: 10000,
        weather: [Array],
        wind_deg: 143,
        wind_gust: 2.65,
        wind_speed: 1.98,
      },
      {
        clouds: 0,
        dew_point: 10.39,
        dt: 1716368400,
        feels_like: 21.93,
        humidity: 48,
        pop: 0,
        pressure: 1026,
        temp: 22.38,
        uvi: 6.39,
        visibility: 10000,
        weather: [Array],
        wind_deg: 125,
        wind_gust: 3,
        wind_speed: 2.49,
      },
      {
        clouds: 0,
        dew_point: 9.58,
        dt: 1716372000,
        feels_like: 23.08,
        humidity: 42,
        pop: 0,
        pressure: 1024,
        temp: 23.57,
        uvi: 7.1,
        visibility: 10000,
        weather: [Array],
        wind_deg: 117,
        wind_gust: 2.89,
        wind_speed: 2.72,
      },
      {
        clouds: 0,
        dew_point: 8.94,
        dt: 1716375600,
        feels_like: 23.85,
        humidity: 38,
        pop: 0,
        pressure: 1023,
        temp: 24.37,
        uvi: 6.38,
        visibility: 10000,
        weather: [Array],
        wind_deg: 115,
        wind_gust: 2.86,
        wind_speed: 2.92,
      },
      {
        clouds: 0,
        dew_point: 8.55,
        dt: 1716379200,
        feels_like: 24.17,
        humidity: 37,
        pop: 0,
        pressure: 1022,
        temp: 24.68,
        uvi: 4.57,
        visibility: 10000,
        weather: [Array],
        wind_deg: 114,
        wind_gust: 2.9,
        wind_speed: 3.04,
      },
      {
        clouds: 0,
        dew_point: 8.34,
        dt: 1716382800,
        feels_like: 23.99,
        humidity: 36,
        pop: 0,
        pressure: 1021,
        temp: 24.54,
        uvi: 2.46,
        visibility: 10000,
        weather: [Array],
        wind_deg: 117,
        wind_gust: 2.98,
        wind_speed: 3.17,
      },
      {
        clouds: 0,
        dew_point: 8.31,
        dt: 1716386400,
        feels_like: 23.34,
        humidity: 38,
        pop: 0,
        pressure: 1021,
        temp: 23.9,
        uvi: 0.85,
        visibility: 10000,
        weather: [Array],
        wind_deg: 119,
        wind_gust: 3.1,
        wind_speed: 3.2,
      },
      {
        clouds: 0,
        dew_point: 8.71,
        dt: 1716390000,
        feels_like: 20.92,
        humidity: 45,
        pop: 0,
        pressure: 1022,
        temp: 21.54,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 126,
        wind_gust: 4.17,
        wind_speed: 2.43,
      },
      {
        clouds: 0,
        dew_point: 8.62,
        dt: 1716393600,
        feels_like: 17.76,
        humidity: 54,
        pop: 0,
        pressure: 1023,
        temp: 18.45,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 145,
        wind_gust: 2.33,
        wind_speed: 1.6,
      },
      {
        clouds: 0,
        dew_point: 8.55,
        dt: 1716397200,
        feels_like: 16.95,
        humidity: 57,
        pop: 0,
        pressure: 1024,
        temp: 17.64,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 165,
        wind_gust: 1.57,
        wind_speed: 1.24,
      },
      {
        clouds: 0,
        dew_point: 8.52,
        dt: 1716400800,
        feels_like: 16.44,
        humidity: 58,
        pop: 0,
        pressure: 1024,
        temp: 17.15,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 173,
        wind_gust: 1.41,
        wind_speed: 1.12,
      },
      {
        clouds: 0,
        dew_point: 8.52,
        dt: 1716404400,
        feels_like: 15.85,
        humidity: 60,
        pop: 0,
        pressure: 1024,
        temp: 16.57,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 187,
        wind_gust: 1.26,
        wind_speed: 0.94,
      },
      {
        clouds: 0,
        dew_point: 8.48,
        dt: 1716408000,
        feels_like: 15.37,
        humidity: 62,
        pop: 0,
        pressure: 1025,
        temp: 16.09,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 205,
        wind_gust: 1.13,
        wind_speed: 0.95,
      },
      {
        clouds: 0,
        dew_point: 8.4,
        dt: 1716411600,
        feels_like: 14.98,
        humidity: 63,
        pop: 0,
        pressure: 1024,
        temp: 15.71,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 217,
        wind_gust: 1.3,
        wind_speed: 1.2,
      },
      {
        clouds: 0,
        dew_point: 8.32,
        dt: 1716415200,
        feels_like: 14.58,
        humidity: 65,
        pop: 0,
        pressure: 1024,
        temp: 15.3,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 217,
        wind_gust: 1.35,
        wind_speed: 1.25,
      },
      {
        clouds: 0,
        dew_point: 8.25,
        dt: 1716418800,
        feels_like: 14.18,
        humidity: 66,
        pop: 0,
        pressure: 1024,
        temp: 14.91,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 214,
        wind_gust: 1.51,
        wind_speed: 1.44,
      },
      {
        clouds: 0,
        dew_point: 8.26,
        dt: 1716422400,
        feels_like: 13.79,
        humidity: 68,
        pop: 0,
        pressure: 1024,
        temp: 14.51,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 210,
        wind_gust: 1.71,
        wind_speed: 1.68,
      },
      {
        clouds: 0,
        dew_point: 8.23,
        dt: 1716426000,
        feels_like: 13.26,
        humidity: 70,
        pop: 0,
        pressure: 1024,
        temp: 13.98,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 200,
        wind_gust: 1.83,
        wind_speed: 1.88,
      },
      {
        clouds: 0,
        dew_point: 8.29,
        dt: 1716429600,
        feels_like: 12.71,
        humidity: 73,
        pop: 0,
        pressure: 1024,
        temp: 13.41,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 204,
        wind_gust: 1.85,
        wind_speed: 1.83,
      },
      {
        clouds: 0,
        dew_point: 8.35,
        dt: 1716433200,
        feels_like: 12.34,
        humidity: 76,
        pop: 0,
        pressure: 1024,
        temp: 13,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 208,
        wind_gust: 1.61,
        wind_speed: 1.52,
      },
      {
        clouds: 0,
        dew_point: 8.43,
        dt: 1716436800,
        feels_like: 12.01,
        humidity: 77,
        pop: 0,
        pressure: 1025,
        temp: 12.68,
        uvi: 0,
        visibility: 10000,
        weather: [Array],
        wind_deg: 214,
        wind_gust: 1.71,
        wind_speed: 1.69,
      },
      {
        clouds: 0,
        dew_point: 8.66,
        dt: 1716440400,
        feels_like: 12.82,
        humidity: 75,
        pop: 0,
        pressure: 1025,
        temp: 13.46,
        uvi: 0.14,
        visibility: 10000,
        weather: [Array],
        wind_deg: 220,
        wind_gust: 1.87,
        wind_speed: 1.66,
      },
      {
        clouds: 0,
        dew_point: 9.38,
        dt: 1716444000,
        feels_like: 16.35,
        humidity: 62,
        pop: 0,
        pressure: 1025,
        temp: 16.98,
        uvi: 0.92,
        visibility: 10000,
        weather: [Array],
        wind_deg: 193,
        wind_gust: 1.91,
        wind_speed: 1.42,
      },
      {
        clouds: 0,
        dew_point: 10.3,
        dt: 1716447600,
        feels_like: 19.21,
        humidity: 56,
        pop: 0,
        pressure: 1025,
        temp: 19.72,
        uvi: 2.53,
        visibility: 10000,
        weather: [Array],
        wind_deg: 156,
        wind_gust: 2.05,
        wind_speed: 1.33,
      },
      {
        clouds: 0,
        dew_point: 10.63,
        dt: 1716451200,
        feels_like: 21.37,
        humidity: 50,
        pop: 0,
        pressure: 1024,
        temp: 21.83,
        uvi: 4.61,
        visibility: 10000,
        weather: [Array],
        wind_deg: 118,
        wind_gust: 1.86,
        wind_speed: 1.75,
      },
      {
        clouds: 0,
        dew_point: 10.26,
        dt: 1716454800,
        feels_like: 23.25,
        humidity: 44,
        pop: 0,
        pressure: 1023,
        temp: 23.68,
        uvi: 6.35,
        visibility: 10000,
        weather: [Array],
        wind_deg: 102,
        wind_gust: 1.42,
        wind_speed: 1.82,
      },
    ],
    lat: -22.8163,
    lon: 30.5569,
    timezone: "Africa/Johannesburg",
    timezone_offset: 7200,
  };

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (errorMessage) {
    return (
      <DisplayError
        errorMessage={errorMessage}
        tryAgain={() => {
          setIsFetchingLocation(true);
          setErrorMessage(null);
        }}
      />
    );
  }
  if (isFetchingLocation) {
    return (
      <LocationPermision
        fetchWeatherForecast={fetchWeatherForecastII}
        searchManually={searchManually}
      />
    );
  }
  if (isSearchingManually) {
    return (
      <View style={styles.container}>
        {locationModalVisible && (
          <EditLocation
            fetchWeatherForecast={fetchWeatherForecastII}
            setLocationModalVisible={setLocationModalVisible}
            cancelManualSearch={cancelManualSearch}
          />
        )}
      </View>
    );
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <HomeLayout>
      <HomeHeader
        openDrawer={() => navigation.openDrawer()}
        placeName={weatherForecast.placeName}
        setLocationModalVisible={setLocationModalVisible}
      />
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={styles.currentWeatherContainer}
          // onLayout={() => {
          //   updateUserWeatherData({
          //     today: currentWeather,
          //     forecast5Days: forecastArray,
          //   });
          // }}
        >
          <Text style={styles.weatherDescriptionText}>
            {capitalizeFirstLetter(
              weatherForecast.current.weather[0].description
            )}
          </Text>
          <Text style={styles.temperatureText}>
            {parseInt(weatherForecast.current.temp)}°C
          </Text>

          <View style={styles.tempRangeContainer}>
            <Text style={styles.miniDescriptionText}>
              Feels like: {parseInt(weatherForecast.current.feels_like)}°C
            </Text>
            <Text style={styles.miniDescriptionText}>
              {parseInt(weatherForecast.daily[0].temp.min)}°/
              {parseInt(weatherForecast.daily[0].temp.max)}°
            </Text>
          </View>

          {/* <View style={[styles.lastUpdateContainer]}>
          <Text style={styles.lastUpdateText}>
            🕒 Last Updated {lastUpdatedTime}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              fetchWeatherForecastII({
                latitude: weatherForecast.latitude,
                longitude: weatherForecast.longitude,
                // placeName: weatherForecast.placeName,
                // silentRefresh: false,
              });
            }}
          >
            <Text style={styles.refreshText}>
              {isLoading ? "Loading..." : "Fetch"}
            </Text>
          </TouchableOpacity>
        </View> */}
        </View>
        <View style={styles.forecastContainer}>
          <View style={styles.forecastHeader}>
            <Text style={styles.forecastHeaderText}>Hourly Forecast</Text>
          </View>
          <TodaysWather hourlyForecast={weatherForecast.hourly} />
          <AudioPlayer
            playWeatherAudio={playWeatherAudio}
            audioControls={audioControls}
            setAudioControls={setAudioControls}
          />
        </View>

        <View style={styles.forecastContainer}>
          <View style={styles.forecastHeader}>
            <Text style={styles.forecastHeaderText}>Daily Forecast</Text>
          </View>
          <ForecastWeather dailyForecast={weatherForecast.daily} />
        </View>
      </ScrollView>

      {locationModalVisible && (
        <EditLocation
          fetchWeatherForecast={fetchWeatherForecastII}
          setLocationModalVisible={setLocationModalVisible}
        />
      )}
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#303030",
  },
  currentWeatherContainer: {
    // backgroundColor: "rgba(0,0,0, 0.4)",
    // flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: DEVICE_HEIGHT * 0.32 - STATUSBAR_HEIGHT,
  },
  forecastContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    width: "95%",
    minHeight: DEVICE_HEIGHT * 0.35,
    marginTop: 5,
    borderRadius: 9,
    marginBottom: DEVICE_HEIGHT * 0.03,
    alignItems: "center",
    // justifyContent: "space-between",
  },
  temperatureText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 55,
  },
  weatherDescriptionText: {
    color: "white",
    // fontWeight: "bold",
    fontSize: 22,
  },
  miniDescriptionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  lastUpdateContainer: {
    backgroundColor: "rgba(163, 163, 163,0.4)",
    minHeight: "5%",
    minWidth: "30%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 7,
    marginTop: 5,
  },
  lastUpdateText: {
    color: "white",
    fontWeight: "700",
    // fontStyle: "italic",
    marginVertical: 10,
  },
  refreshButton: {
    backgroundColor: "#303030",
    minHeight: 10,
    minWidth: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  refreshText: {
    fontWeight: "bold",
    color: "white",
  },
  tempRangeContainer: {
    flexDirection: "row",
    // backgroundColor: "pink",
    width: "60%",
    justifyContent: "space-between",
  },
  forecastHeader: {
    flexDirection: "row",
    // backgroundColor: "pink",
    width: "100%",
    alignItems: "center",
    borderBottomColor: "grey",
    borderBottomWidth: 0.6,
    height: DEVICE_HEIGHT * 0.05,
    paddingHorizontal: 15,
  },
  forecastHeaderText: {
    // fontWeight: "bold",
    color: "white",
  },
});
