import { useRef, useState, useEffect } from "react";
import MapView from "react-native-maps";
import {
  StyleSheet,
  View,
  Platform,
  Modal,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function AddLocationMap({
  setMapModalVisible,
  setLocationModalVisible,
  fetchWeatherForecast,
  focusInput,
}) {
  const mapViewRef = useRef();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  useEffect(() => {
    getLocationPermision();
  }, []);

  const getLocationPermision = async () => {
    let gpsServiceStatus = await Location.hasServicesEnabledAsync();
    if (gpsServiceStatus) {
      //Device location is enabled
      const { canAskAgain, status } =
        await Location.getForegroundPermissionsAsync();

      if (status === "granted") {
        getUserLocation();
      } else {
        if (canAskAgain) {
          requestForegroundLocation();
        } else {
          locationIsNotAvailable();
        }
      }
    } else {
      //Device location is disabled
      locationIsNotAvailable();
    }
  };

  const getUserLocation = async () => {
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    setLatitude(latitude);
    setLongitude(longitude);
    animateToLocation({
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
      latitude,
      longitude,
    });
  };

  const requestForegroundLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      getUserLocation();
    } else {
      locationIsNotAvailable();
    }
  };

  const locationIsNotAvailable = () => {
    animateToLocation({
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
      latitude: -25.770793,
      longitude: 28.224445,
    });
  };

  const animateToLocation = (region) => {
    setIsFetchingLocation(false);
    if (mapViewRef.current) {
      setTimeout(() => {
        mapViewRef.current.animateToRegion(region, 3000);
      }, 1000);
    }
  };

  const fitAllMarkersOnTheMap = () => {
    if (mapViewRef.current) {
      // list of id's must be same that has been provided to the identifier props of the Marker
      mapViewRef.current.fitToSuppliedMarkers(
        [
          "riderLocation",
          "destinationMarker",
          "pickUpLocationMarker",
          "driverCarMarker",
          "destinationLocationMarker",
        ],
        {
          edgePadding: {
            top: DEVICE_HEIGHT * 0.15,
            right: DEVICE_HEIGHT * 0.08,
            bottom: DEVICE_HEIGHT * 0.35,
            left: DEVICE_HEIGHT * 0.08,
          },
        }
      );
    }
  };

  const onRegionChangeComplete = (region) => {
    const { latitude, longitude } = region;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  const onTapAddLocation = () => {
    fetchWeatherForecast({
      latitude,
      longitude,
      placeName: null,
      silentRefresh: false,
    });
    setLocationModalVisible(false);
    setMapModalVisible(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setMapModalVisible(false)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={focusInput} style={styles.searchButton}>
            <Text style={styles.titleText}>Enter name of the city</Text>
          </TouchableOpacity>
        </View>
        {isFetchingLocation ? (
          <ActivityIndicator
            size={"large"}
            color={"grey"}
            style={{ marginTop: DEVICE_HEIGHT / 2 }}
          />
        ) : (
          <>
            <View style={styles.pinContainer}>
              <Image
                source={require("../../assets/Images/location-pin.png")}
                style={styles.pinImage}
              />
            </View>

            <MapView
              ref={mapViewRef}
              onRegionChangeComplete={onRegionChangeComplete}
              style={styles.map}
            />

            <TouchableOpacity
              onPress={onTapAddLocation}
              style={styles.addLocationButton}
            >
              <Text style={styles.addLocationText}>ADD LOCATION</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    paddingTop: Platform.OS === "ios" ? 20 : 0,
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
    top: Platform.OS === "ios" ? 45 : 25,
    left: 0,
    zIndex: 2,
    paddingHorizontal: 10,
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
  pinContainer: {
    // backgroundColor: "red",
    height: DEVICE_HEIGHT * 0.1,
    width: DEVICE_HEIGHT * 0.1,
    zIndex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: DEVICE_HEIGHT / 2 - (DEVICE_HEIGHT * 0.1) / 2,
  },
  pinImage: {
    height: "100%",
    width: "100%",
  },
});
