import { useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

import { MAPBOX_ACCESS_TOKEN, OPEN_WEATHER_API_KEY } from "@env";

import { UserContext } from "../context";

import weatherIcons from "../utilities/WeatherIcons";
import getSavedWeatherData from "../utilities/GetSavedWeatherData";
import AddLocationMap from "./AddLocationMap";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EditLocation({
  fetchWeatherForecast,
  setLocationModalVisible,
}) {
  const [userWeatherData] = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState(false);
  const [isLoadingSavedLocations, setIsLoadingSavedLocations] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [savedLocationsWeatherData, setSavedLocationsWeatherData] = useState(
    []
  );
  const [mapModalVisible, setMapModalVisible] = useState(false);

  useEffect(() => {
    getSavedLocationsCurrentWeather();
  }, []);

  const getSavedLocationsCurrentWeather = async () => {
    const savedWeatherData = await getSavedWeatherData();
    if (savedWeatherData) {
      savedLocations = savedWeatherData.savedLocationsWeather;
      fetchWeatherForAllLocations(savedLocations)
        .then((weatherDataArray) => {
          setSavedLocationsWeatherData(weatherDataArray);
          setIsLoadingSavedLocations(false);
        })
        .catch((error) => {
          alert(error.message);
          setIsLoadingSavedLocations(false);
        });
    }
  };

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
    const currentWeatherApiUrl =
      "http://api.openweathermap.org/data/2.5/weather";
    const response = await fetch(
      `${currentWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Weather data request failed.");
    }

    const data = await response.json();
    const { main, weather } = data;
    const { temp } = main;
    const { main: weatherMain, description } = weather[0];

    const general = weatherCategories[weatherMain] || "unknown";
    const currentTemperature = Math.round(temp);

    const weatherData = {
      general,
      description,
      currentTemperature,
    };
    return weatherData;
  };

  // Function to fetch weather data for all locations and return a new array with weather data
  const fetchWeatherForAllLocations = async (locations) => {
    const weatherPromises = locations.map((location) =>
      fetchWeatherData(location.latitude, location.longitude)
    );

    try {
      const weatherData = await Promise.all(weatherPromises);
      return weatherData.map((data, index) => ({
        ...locations[index],
        ...data,
      }));
    } catch (error) {
      // Parent function wll catch the error
    }
  };

  const onChangeText = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      searchPlaces(text);
    } else {
      setSearchResults([]);
    }
  };

  const searchPlaces = (query) => {
    setIsLoadingSearchResults(true);
    const geocodingEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`;

    const proximity = `${-25.7449},${28.1878}`;
    fetch(`${geocodingEndpoint}?access_token=${MAPBOX_ACCESS_TOKEN}`)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data.features);
        setIsLoadingSearchResults(false);
      })
      .catch((error) => {
        console.error("Error in geocoding request:", error);
      });
  };

  const onTapLocation = (data) => {
    const { latitude, longitude, placeName } = data;

    fetchWeatherForecast({
      latitude,
      longitude,
      placeName,
      silentRefresh: false,
    });
    setLocationModalVisible(false);
  };

  const RenderItem = ({ item, isFirstItem }) => {
    let currentlyDisplayedLocation =
      !isFirstItem &&
      userWeatherData.currentLocationWeather.today.placeName === item.placeName;

    if (currentlyDisplayedLocation) {
      //Remove duplicate location that is already in ListHeaderComponent
      return null;
    }
    return (
      <TouchableOpacity
        onPress={() => onTapLocation(item)}
        style={styles.savedPlaceContainer}
      >
        <View style={styles.aboutLocation}>
          <Text numberOfLines={2} style={styles.tempText}>
            {item.placeName}
          </Text>
        </View>
        <View style={styles.locationsWeather}>
          <View style={styles.tempContainer}>
            <Image
              style={styles.weatherImage}
              source={weatherIcons[item.general]}
            />
            <Text style={styles.tempText}>{item.currentTemperature}°C</Text>
          </View>
          <Text numberOfLines={2} style={styles.descriptionText}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.closeButtonText}>Edit Locations</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.inputStyle}
            onChangeText={onChangeText}
            value={searchQuery}
            placeholder="Enter the name of city"
            placeholderTextColor={"grey"}
          />
          <TouchableOpacity
            onPress={() => setMapModalVisible(true)}
            style={styles.mapButton}
          >
            {isLoadingSearchResults ? (
              <ActivityIndicator size={"small"} color={"white"} />
            ) : (
              <Feather name="map" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {searchQuery.length > 0 ? (
          <View style={styles.searchResultsContainer}>
            {searchResults.map((location) => (
              <ScrollView
                key={location.place_name}
                style={styles.placeContainer}
                showsHorizontalScrollIndicator={false}
                horizontal
                keyboardShouldPersistTaps="always"
              >
                <TouchableOpacity
                  onPress={() => {
                    const latitude = location.center[1];
                    const longitude = location.center[0];
                    const placeName = location.text;
                    onTapLocation({ latitude, longitude, placeName });
                  }}
                  style={styles.placeButton}
                >
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location.place_name}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ))}
          </View>
        ) : isLoadingSavedLocations ? (
          <ActivityIndicator
            size={"large"}
            color={"grey"}
            style={{ marginTop: 100 }}
          />
        ) : (
          <View style={styles.savedPlacesContainer}>
            <FlatList
              data={savedLocationsWeatherData}
              ListHeaderComponent={() =>
                userWeatherData.currentLocationWeather && (
                  <RenderItem
                    item={userWeatherData.currentLocationWeather.today}
                    isFirstItem={true}
                  />
                )
              }
              renderItem={({ item }) => <RenderItem item={item} />}
              keyExtractor={(item, index) => item.placeName + index}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
            />
          </View>
        )}
        <AddLocationMap mapModalVisible={mapModalVisible} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#303030",
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },
  headerContainer: {
    // backgroundColor: "grey",
    height: DEVICE_HEIGHT * 0.08,
    width: "100%",
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  closeButton: {
    // backgroundColor: "red",
    height: "90%",
    width: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
  },
  searchContainer: {
    backgroundColor: "#404040",
    height: DEVICE_HEIGHT * 0.07,
    width: "92%",
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 9,
  },
  inputStyle: {
    height: "90%",
    padding: 10,
    // width: "85%",
    // backgroundColor: "pink",
    flex: 1,
    color: "white",
  },
  mapButton: {
    backgroundColor: "#303030",
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    marginRight: 5,
  },
  searchResultsContainer: {
    // backgroundColor: "green",
    minHeight: 50,
    width: "100%",
    alignItems: "center",
    borderTopColor: "grey",
    borderTopWidth: 1,
    marginTop: 5,
  },
  placeContainer: {
    // backgroundColor: "pink",
    height: 50,
    width: "92%",
    // marginTop: 3,

    borderBottomColor: "grey",
    borderBottomWidth: 1,
    // overflow: "scroll",
  },
  locationText: {
    color: "white",
  },
  placeButton: {
    flex: 1,
    // backgroundColor: "green",
    justifyContent: "center",
  },
  loadingIndicator: {
    backgroundColor: "white",
    height: "5%",
    width: "90%",
    justifyContent: "center",
  },
  movingView: {
    width: 50,
    height: 10,
    backgroundColor: "red",
    position: "absolute",
  },
  savedPlaceContainer: {
    backgroundColor: "#404040",
    height: DEVICE_HEIGHT * 0.13,
    width: SCREEN_WIDTH * 0.92,
    alignItems: "center",
    marginTop: 5,
    borderRadius: 5,
    flexDirection: "row",
  },
  savedPlacesContainer: {
    // backgroundColor: "pink",
    flex: 1,
    width: SCREEN_WIDTH,
    paddingTop: 15,
    alignItems: "center",
  },

  aboutLocation: {
    // backgroundColor: "green",
    height: "100%",
    width: "60%",
    justifyContent: "center",
    paddingLeft: 5,
  },
  locationsWeather: {
    // backgroundColor: "pink",
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tempContainer: {
    // backgroundColor: "red",
    // height: "50%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: 5,
  },
  tempText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
    marginLeft: 5,
  },
  descriptionText: {
    // fontWeight: "500",
    color: "white",
  },
  weatherImage: {
    height: 25,
    width: 25,
  },
});
