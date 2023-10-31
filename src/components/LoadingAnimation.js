import { StyleSheet, ActivityIndicator, View } from "react-native";

export default function LoadingAnimation() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={"green"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
