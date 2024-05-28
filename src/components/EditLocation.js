import { useContext, useState, useEffect, useRef } from "react";
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
  Alert,
  Vibration,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

import { MAPBOX_ACCESS_TOKEN, OPEN_WEATHER_API_KEY } from "@env";

import { UserContext } from "../context";

import weatherIcons from "../utilities/WeatherIcons";
import weatherCategories from "../utilities/WeatherIcons";
import getSavedWeatherData from "../utilities/GetSavedWeatherData";
import AddLocationMap from "./AddLocationMap";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EditLocation({
  fetchWeatherForecast,
  setLocationModalVisible,
  cancelManualSearch,
}) {
  const [userWeatherData, updateUserWeatherData, deleteSavedLocation] =
    useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState(false);
  const [isLoadingSavedLocations, setIsLoadingSavedLocations] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [savedLocationsWeatherData, setSavedLocationsWeatherData] = useState(
    []
  );
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    getSavedLocationsCurrentWeather();
  }, []);

  const getSavedLocationsCurrentWeather = async () => {
    const savedWeatherData = await getSavedWeatherData();
    if (savedWeatherData) {
      const savedLocations = savedWeatherData.savedLocationsWeather;
      fetchWeatherForAllLocations(savedLocations)
        .then((weatherDataArray) => {
          setSavedLocationsWeatherData(weatherDataArray);
          setIsLoadingSavedLocations(false);
        })
        .catch((error) => {
          alert(error.message);
          setIsLoadingSavedLocations(false);
        });
    } else {
      setIsLoadingSavedLocations(false);
    }
  };

  const fetchWeatherDataII = async (latitude, longitude) => {
    const currentWeatherApiUrl =
      "https://api.openweathermap.org/data/3.0/onecall";
    const currentWeatherResponse = await fetch(
      `${currentWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}&units=metric&exclude=minutely,alerts`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error(
        "Something went wrong fetching weather data. Please try again later"
      );
    }

    const currentWeatherData = await currentWeatherResponse.json();

    return currentWeatherData.current;
  };

  const fetchWeatherForAllLocations = async (locations) => {
    const weatherPromises = locations.map((location) =>
      fetchWeatherDataII(location.latitude, location.longitude)
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
    // console.log(`MAPBOX_ACCESS_TOKEN:`, MAPBOX_ACCESS_TOKEN);
    setIsLoadingSearchResults(true);
    const geocodingEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`;

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

  const focusInput = () => {
    setMapModalVisible(false);
    inputRef?.current?.blur(); //Making sure the keboard is visible
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 1000);
  };

  const showDeleteAlert = (placeName, isFirstItem) => {
    Vibration.vibrate();
    if (isFirstItem) {
      alert(
        "You can not delete currently displayed location, please select another location as primary first in order to delete this one"
      );

      return;
    }
    Alert.alert(
      `Delete ${placeName}?`,
      "Confirm if you want to delete this place from your list",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "default",
          onPress: () => deletePlace(placeName),
        },
      ]
    );
    Vibration.vibrate();
  };

  const deletePlace = (placeName) => {
    let currentPlaces = savedLocationsWeatherData;
    currentPlaces = currentPlaces.filter(
      (item) => item["placeName"] !== placeName
    );
    deleteSavedLocation(currentPlaces);
    setSavedLocationsWeatherData(currentPlaces);
  };

  const RenderItem = ({ item, isFirstItem }) => {
    let currentlyDisplayedLocation =
      !isFirstItem &&
      userWeatherData?.currentLocationWeather?.placeName === item.placeName;

    if (currentlyDisplayedLocation) {
      //Remove duplicate location that is already in ListHeaderComponent
      return null;
    }

    let locationData = item;

    if (isFirstItem) {
      locationData = savedLocationsWeatherData.find(
        (location) => location.placeName === item.placeName
      );
    }
    return (
      <TouchableOpacity
        onPress={() => onTapLocation(item)}
        onLongPress={() => showDeleteAlert(locationData.placeName, isFirstItem)}
        style={styles.savedPlaceContainer}
      >
        <View style={styles.aboutLocation}>
          <Text numberOfLines={2} style={styles.tempText}>
            {locationData.placeName}
          </Text>
        </View>
        <View style={styles.locationsWeather}>
          <View style={styles.tempContainer}>
            <Image
              style={styles.weatherImage}
              source={{
                uri: `http://openweathermap.org/img/wn/${locationData.weather[0].icon}@2x.png`,
              }}
            />
            <Text style={styles.tempText}>
              {Math.round(locationData.temp)}°C
            </Text>
          </View>
          <Text numberOfLines={2} style={styles.descriptionText}>
            {locationData.weather[0].description}
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
            onPress={() => {
              if (cancelManualSearch) {
                cancelManualSearch();
              }
              setLocationModalVisible(false);
            }}
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
            ref={inputRef}
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
                //This is to make sure that the location displayed at home page is always at the top here
                //And that it can not be deleted
                userWeatherData?.currentLocationWeather.current?.temp && (
                  <RenderItem
                    item={{
                      placeName:
                        userWeatherData.currentLocationWeather.placeName,
                    }}
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
        {mapModalVisible && (
          <AddLocationMap
            setMapModalVisible={setMapModalVisible}
            setLocationModalVisible={setLocationModalVisible}
            fetchWeatherForecast={fetchWeatherForecast}
            focusInput={focusInput}
          />
        )}
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
    height: 50,
    width: 50,
  },
});
