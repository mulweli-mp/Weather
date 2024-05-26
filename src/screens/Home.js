import { useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Vibration,
  AppState,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import { OPEN_WEATHER_API_KEY, GOOGLE_MAPS_APIKEY } from "@env";
import { UserContext } from "../context";
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
import HomeLayout from "../components/HomeLayout";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

export default function Home({ navigation }) {
  const [userWeatherData, updateUserWeatherData] = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [lastUpdatedTime, setlastUpdatedTime] = useState({
    words: "Just Now",
    number: 0,
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSearchingManually, setIsSearchingManually] = useState(false);
  const [audioControls, setAudioControls] = useState({
    isPlaying: false,
    isSilent: true,
  });
  const [readWeatherAudioData, setReadWeatherAudioData] = useState(null);
  const sounds = useRef([]);

  const scrollY = new Animated.Value(0);

  const onRefresh = () => {
    fetchWeatherForecastII({
      latitude: weatherForecast.latitude,
      longitude: weatherForecast.longitude,
      placeName: weatherForecast.placeName,
      silentRefresh: true,
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );

    syncUpdateTime();
    const intervalId = setInterval(() => {
      syncUpdateTime();
    }, 30000);

    // Clear subscription and interval
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [weatherForecast]);

  const _handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      //App came to the foreground
      if (weatherForecast) {
        const minutesDifference = calculateMinutesDifference(
          weatherForecast?.timeUpdated,
          new Date()
        );

        console.log("minutesDifference", minutesDifference);
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
    if (weatherForecast) {
      const minutesDifference = calculateMinutesDifference(
        weatherForecast?.timeUpdated,
        new Date()
      );

      let lastUpdateString = "";

      if (minutesDifference < 2) {
        lastUpdateString = "Just Now";
      } else if (minutesDifference > 2 && minutesDifference < 60) {
        lastUpdateString = `${Math.round(minutesDifference)} mins ago`;
      } else {
        const hoursDifference = minutesDifference / 60;
        if (hoursDifference < 24) {
          lastUpdateString =
            Math.round(hoursDifference) == 1
              ? "an hour ago"
              : `${Math.round(hoursDifference)} hours ago`;
        } else {
          const dateUpdated = new Date(weatherForecast?.timeUpdated);
          lastUpdateString = `${dateUpdated}`.substring(0, 21);
        }
      }

      setlastUpdatedTime({
        words: lastUpdateString,
        number: minutesDifference,
      });
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

  const getOfflineWeatherData = async (errorText) => {
    try {
      const savedData = await getSavedWeatherData();
      if (savedData) {
        //Previously saved data is available
        const { currentLocationWeather } = savedData;
        setWeatherForecast(currentLocationWeather);
        // console.log(currentLocationWeather);
        setIsLoading(false);
        setRefreshing(false);

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
        setIsLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      setErrorMessage(err.message);
      setIsLoading(false);
      setRefreshing(false);
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
    const currentWeatherApiUrl =
      "https://api.openweathermap.org/data/3.0/onecall";
    const { latitude, longitude, silentRefresh, placeName } = data;

    try {
      if (silentRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setIsFetchingLocation(false);
      setIsSearchingManually(false);

      const currentWeatherResponse = await fetch(
        `${currentWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric&exclude=minutely,alerts`
      );

      if (!currentWeatherResponse.ok) {
        throw new Error(
          "Something went wrong fetching weather data. Please try again later"
        );
      }

      const currentWeatherData = await currentWeatherResponse.json();

      let resolvedPlaceName = placeName;
      if (!resolvedPlaceName) {
        const placeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
        );

        if (!placeResponse.ok) {
          throw new Error(
            "Something went wrong fetching place data. Please try again later"
          );
        }

        const placeData = await placeResponse.json();
        const filteredArray = placeData.results.filter(
          (obj) => !obj.hasOwnProperty("plus_code")
        );

        if (filteredArray.length > 0) {
          const address = filteredArray[0].formatted_address;
          const placeComponents = address.split(",");
          resolvedPlaceName = placeComponents[1].trim();
        } else {
          resolvedPlaceName = "Unknown Location";
        }
      }

      const weatherData = {
        ...currentWeatherData,
        ...data,
        placeName: resolvedPlaceName,
        timeUpdated: new Date(),
      };

      setWeatherForecast(weatherData);
      updateUserWeatherData(weatherData);

      setIsLoading(false);
      setRefreshing(false);
    } catch (error) {
      getOfflineWeatherData(error.message);
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
    <HomeLayout
      theme={weatherForecast.current.weather[0].icon}
      disableTheme={lastUpdatedTime.number > 60}
      scrollY={scrollY}
    >
      <HomeHeader
        openDrawer={() => navigation.openDrawer()}
        placeName={weatherForecast.placeName}
        setLocationModalVisible={setLocationModalVisible}
      />
      {lastUpdatedTime.number > 60 && (
        <View style={styles.refreshContainer}>
          <Text style={styles.forecastHeaderText}>
            The Weather displayed is outdated. It was Last updated{" "}
            {lastUpdatedTime.words}. Pull down to refresh or press REFRESH below
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // Disable native driver for opacity animation
        )}
        scrollEventThrottle={16} // Control the rate at which onScroll events are fired
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.currentWeatherContainer}>
          <Text style={styles.weatherDescriptionText}>
            {capitalizeFirstLetter(
              weatherForecast.current.weather[0].description
            )}
          </Text>
          <Text style={styles.temperatureText}>
            {Math.round(weatherForecast.current.temp)}°C
          </Text>

          <View style={styles.tempRangeContainer}>
            <Text style={styles.miniDescriptionText}>
              Feels like: {Math.round(weatherForecast.current.feels_like)}°C
            </Text>
            <Text style={styles.miniDescriptionText}>
              {Math.round(weatherForecast.daily[0].temp.min)}°/
              {Math.round(weatherForecast.daily[0].temp.max)}°
            </Text>
          </View>
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
    textAlign: "center",
  },
  refreshContainer: {
    backgroundColor: "brown",
    minHeight: 1,
    width: "90%",
    alignItems: "center",
    // justifyContent: "space-between",
    padding: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  refreshButton: {
    backgroundColor: "white",
    minHeight: 1,
    width: "35%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 15,
    padding: 7,
    elevation: 5,
  },
  buttonText: {
    fontWeight: "600",
    color: "black",
  },
});
