import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { OPEN_WEATHER_API_KEY } from "@env";

import getSavedWeatherData from "../utilities/GetSavedWeatherData";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function SavedLocations({ navigation }) {
  const mapViewRef = useRef();
  const [isLoadingSavedLocations, setIsLoadingSavedLocations] = useState(true);
  const [savedLocationsWeatherData, setSavedLocationsWeatherData] = useState(
    []
  );

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
          setTimeout(() => {
            fitAllMarkersOnTheMap(weatherDataArray);
          }, 1000);
          setIsLoadingSavedLocations(false);
        })
        .catch((error) => {
          alert(error.message);
          setIsLoadingSavedLocations(false);
        });
    }
  };

  const fetchWeatherData = async (latitude, longitude) => {
    const currentWeatherApiUrl =
      "https://api.openweathermap.org/data/2.5/weather";
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

  const fitAllMarkersOnTheMap = (data) => {
    if (mapViewRef.current) {
      // list of id's must be same that has been provided to the identifier props of the Marker
      const markersRefs = data.map((item) => item.placeName);
      mapViewRef.current.fitToSuppliedMarkers(markersRefs, {
        edgePadding: {
          top: DEVICE_HEIGHT * 0.15,
          right: DEVICE_HEIGHT * 0.08,
          bottom: DEVICE_HEIGHT * 0.35,
          left: DEVICE_HEIGHT * 0.08,
        },
      });
    }
  };

  const CustomPin = () => (
    <View style={styles.locationContainer}>
      <Image
        style={[styles.pinImage]}
        source={require("../../assets/Images/saved-location.png")}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {isLoadingSavedLocations ? (
        <ActivityIndicator
          size={"large"}
          color={"grey"}
          style={{ marginTop: DEVICE_HEIGHT / 2 }}
        />
      ) : (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapViewRef}
            style={styles.map}
          >
            {savedLocationsWeatherData.map(
              ({
                placeName,
                currentTemperature,
                description,
                latitude,
                longitude,
              }) => (
                <Marker
                  coordinate={{
                    latitude,
                    longitude,
                  }}
                  title={placeName}
                  description={`${currentTemperature}°C, ${description}`}
                  identifier={placeName}
                  key={placeName}
                >
                  <CustomPin />
                </Marker>
              )
            )}
          </MapView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    // paddingTop: Platform.OS === "ios" ? 20 : 0,
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  headerContainer: {
    // backgroundColor: "grey",
    height: DEVICE_HEIGHT * 0.06,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    top: 35,
    left: 0,
    zIndex: 2,
    paddingHorizontal: 15,
  },
  backButton: {
    backgroundColor: "white",
    height: DEVICE_HEIGHT * 0.06,
    width: DEVICE_HEIGHT * 0.06,
    borderRadius: (DEVICE_HEIGHT * 0.06) / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  searchButton: {
    backgroundColor: "white",
    height: "100%",
    // width: "78%",
    borderRadius: 10,
    justifyContent: "center",
    paddingLeft: 6,
    flex: 1,
    marginLeft: 10,
    elevation: 5,
  },
  titleText: {
    color: "grey",
    fontSize: 17,
  },
  addLocationButton: {
    backgroundColor: "orange",
    height: DEVICE_HEIGHT * 0.07,
    width: "65%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    zIndex: 2,
    borderRadius: 10,
    elevation: 10,
  },
  addLocationText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  locationContainer: {
    // backgroundColor: "red",
    height: DEVICE_HEIGHT * 0.06,
    width: DEVICE_HEIGHT * 0.06,
    justifyContent: "center",
    alignItems: "center",
  },
  pinImage: {
    height: "100%",
    width: "100%",
  },
});
