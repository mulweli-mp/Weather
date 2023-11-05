import { StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";

export default function LoadingAnimation() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/lottie-files/loading.json")}
        autoPlay
        style={{
          height: 200,
          width: 200,
        }}
      />
      <Text style={styles.messegeText}>Please wait...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#303030",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messegeText: {
    color: "grey",
  },
});
