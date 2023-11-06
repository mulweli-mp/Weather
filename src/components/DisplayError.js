import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Vibration,
} from "react-native";
import LottieView from "lottie-react-native";

export default function DisplayError({ errorMessage, tryAgain }) {
  return (
    <View style={styles.container} onLayout={() => Vibration.vibrate()}>
      <LottieView
        source={require("../../assets/lottie-files/error.json")}
        autoPlay
        style={{
          height: 200,
          width: 200,
        }}
      />

      <Text style={styles.errorText}>{errorMessage}</Text>

      <TouchableOpacity style={styles.reloadButton} onPress={tryAgain}>
        <Text style={styles.reloadText}>TRY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#303030",
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  errorText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginHorizontal: 10,
  },
  reloadButton: {
    backgroundColor: "red",
    minHeight: 45,
    minWidth: 150,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  reloadText: {
    fontWeight: "bold",
    color: "white",
  },
});
