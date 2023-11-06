import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  Linking,
  AppState,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";
import * as Location from "expo-location";

import LoadingAnimation from "./LoadingAnimation";

export default function LocationPermision({
  fetchWeatherForecast,
  searchManually,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [gpsServiceOff, setGpsServiceOff] = useState(true);
  useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );
    getLocationPermision();

    return () => {
      subscription.remove();
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      //App came to the foreground
      getLocationPermision();
    }
  };

  const getLocationPermision = async () => {
    let gpsServiceStatus = await Location.hasServicesEnabledAsync();
    if (gpsServiceStatus) {
      //Device location is enabled
      setGpsServiceOff(false);
      const foregroundResponse = await Location.getForegroundPermissionsAsync();

      if (foregroundResponse.status === "granted") {
        getUserLocation();
      } else {
        setCanAskAgain(foregroundResponse.canAskAgain);
        setIsLoading(false);
      }
    } else {
      //Device location is disabled
      setGpsServiceOff(true);
      setIsLoading(false);
    }
  };

  const getUserLocation = async () => {
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    fetchWeatherForecast({
      latitude,
      longitude,
      placeName: null,
      silentRefresh: false,
    });
  };

  const requestForegroundLocation = async () => {
    if (canAskAgain) {
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        getUserLocation();
      } else {
        setCanAskAgain(canAskAgain);
      }
    } else {
      Linking.openSettings();
    }
  };

  const searchLocationManually = () => {};

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/lottie-files/location-animation.json")}
        autoPlay
        style={{
          height: 200,
          width: 200,
        }}
      />

      <Text style={styles.tittleText}>LOCATION PERMISSION</Text>

      <Text style={styles.messageText}>
        We need access to your device location so that we can show you weather
        forecast at your location
      </Text>

      {gpsServiceOff && (
        <Text
          style={{
            fontWeight: "bold",
            marginVertical: 10,
            marginHorizontal: 20,
            color: "white",
            textAlign: "center",
            fontSize: 17,
          }}
        >
          Please go turn on your device location and come back and press
          "Continue"
        </Text>
      )}

      {!canAskAgain && (
        <>
          <Text
            style={{
              fontWeight: "bold",
              marginTop: 15,
              color: "red",
            }}
          >
            📌LOCATION PERMISION DENIED
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              marginVertical: 10,
              marginHorizontal: 20,
              color: "white",
              textAlign: "center",
            }}
          >
            To enable it, press "Continue" then go to{" "}
            {Platform.OS !== "ios" && `"Permissions" then `} "Location" and
            allow access to location "While Using the App"
          </Text>
        </>
      )}

      <TouchableOpacity
        onPress={requestForegroundLocation}
        style={styles.continueButton}
      >
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>

      <Text
        onPressIn={searchManually}
        style={styles.rejectText}
        onPress={searchLocationManually}
      >
        I will search manually
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#303030",
    height: "100%",
    width: "100%",
    alignItems: "center",
    // justifyContent: "center",
    paddingTop: 100,
  },
  messageText: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    margin: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    color: "white",
  },

  tittleText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  rejectText: {
    fontWeight: "500",
    marginTop: 15,
    color: "#4287f5",
  },
  continueButton: {
    backgroundColor: "black",
    height: "7%",
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
    elevation: 5,
    marginTop: 10,
  },
  continueText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
});
