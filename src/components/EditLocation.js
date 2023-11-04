import { useContext, useState } from "react";
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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MAPBOX_ACCESS_TOKEN } from "@env";

import { UserContext } from "../context";

import weatherIcons from "../utilities/WeatherIcons";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EditLocation({
  fetchWeatherForecast,
  setLocationModalVisible,
}) {
  const [userWeatherData] = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const onChangeText = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      searchPlaces(text);
    } else {
      setSearchResults([]);
    }
  };

  const searchPlaces = (query) => {
    setIsLoading(true);
    const geocodingEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`;

    const proximity = `${-25.7449},${28.1878}`;
    fetch(`${geocodingEndpoint}?access_token=${MAPBOX_ACCESS_TOKEN}`)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data.features);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error in geocoding request:", error);
      });
  };

  const RenderItem = ({ item }) => (
    <TouchableOpacity style={styles.savedPlaceContainer}>
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
          <Text style={styles.tempText}>{item.currentTemp}°C</Text>
        </View>
        <Text numberOfLines={2} style={styles.descriptionText}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const onTapLocation = (data) => {
    const latitude = data.center[1];
    const longitude = data.center[0];
    const searchQueryPlaceName = data.text;

    fetchWeatherForecast(
      latitude,
      longitude,
      "searchLocation",
      searchQueryPlaceName
    );
    setLocationModalVisible(false);
  };

  return (
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
          //   onPress={() => setLocationModalVisible(false)}
          style={styles.mapButton}
        >
          {isLoading ? (
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
                onPress={() => onTapLocation(location)}
                style={styles.placeButton}
              >
                <Text style={styles.locationText} numberOfLines={1}>
                  {location.place_name}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ))}
        </View>
      ) : (
        <View style={styles.savedPlacesContainer}>
          <FlatList
            data={userWeatherData.savedLocationsWeather}
            ListHeaderComponent={() =>
              userWeatherData.currentLocationWeather && (
                <RenderItem item={userWeatherData.currentLocationWeather} />
              )
            }
            renderItem={({ item }) => <RenderItem item={item} />}
            keyExtractor={(item, index) => item.placeName + index}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}
    </View>
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
