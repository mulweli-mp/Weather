import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Entypo,
  AntDesign,
  Feather,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
const DEVICE_HEIGHT = Dimensions.get("window").height;
const DEVICE_WIDTH = Dimensions.get("window").width;

const iconSize = DEVICE_HEIGHT * 0.027;

export default function AudioPlayer({
  playWeatherAudio,
  audioControls,
  setAudioControls,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          if (!audioControls.isPlaying) {
            playWeatherAudio();
          }
        }}
        style={styles.playContainer}
      >
        {audioControls.isPlaying ? (
          <AntDesign name="pause" size={iconSize} color="white" />
        ) : (
          <Entypo name="controller-play" size={iconSize} color="white" />
        )}
      </TouchableOpacity>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>0:00/0:55</Text>
      </View>
      <View style={styles.trackContainer}>
        <View style={styles.trackWidth}></View>
        <View style={styles.trackPointer}></View>
      </View>
      <View style={styles.muteContainer}>
        <TouchableOpacity
          onPress={() => {
            const controlsState = audioControls;
            setAudioControls({
              ...controlsState,
              isMute: !controlsState.isMute,
            });
          }}
          style={styles.playContainer}
        >
          {audioControls.isMute ? (
            <Ionicons name="volume-mute" size={iconSize} color="white" />
          ) : (
            <Feather name="volume-2" size={iconSize} color="white" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.menuContainer}>
        <SimpleLineIcons
          name="options-vertical"
          size={iconSize}
          color="white"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#cfcfcf",
    borderColor: "#cfcfcf",
    borderWidth: 1,
    height: DEVICE_HEIGHT * 0.07,
    width: "90%",
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: DEVICE_HEIGHT * 0.03,
    borderRadius: DEVICE_HEIGHT * 0.07,
    flexDirection: "row",
  },
  timeText: {
    color: "white",
    fontSize: 11,
  },
  playContainer: {
    // backgroundColor: "blue",
    width: DEVICE_HEIGHT * 0.05,
    height: DEVICE_HEIGHT * 0.05,
    borderRadius: (DEVICE_HEIGHT * 0.05) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timeContainer: {
    // backgroundColor: "yellow",
    width: "20%",
    height: DEVICE_HEIGHT * 0.05,
    alignItems: "center",
    justifyContent: "center",
  },

  trackContainer: {
    // backgroundColor: "pink",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "80%",
    marginHorizontal: 10,
  },

  muteContainer: {
    // backgroundColor: "cyan",
    width: DEVICE_HEIGHT * 0.05,
    height: DEVICE_HEIGHT * 0.05,
    borderRadius: (DEVICE_HEIGHT * 0.05) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    // backgroundColor: "green",
    width: DEVICE_HEIGHT * 0.05,
    height: DEVICE_HEIGHT * 0.05,
    borderRadius: (DEVICE_HEIGHT * 0.05) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  trackWidth: {
    backgroundColor: "grey",
    width: "100%",
    height: "7%",
    borderRadius: (DEVICE_HEIGHT * 0.05) / 2,
    // alignItems: "center",
    // justifyContent: "center",
  },
  trackPointer: {
    backgroundColor: "white",
    width: DEVICE_HEIGHT * 0.015,
    height: DEVICE_HEIGHT * 0.015,
    borderRadius: (DEVICE_HEIGHT * 0.015) / 2,
    position: "absolute",
    left: 0,
  },
});
