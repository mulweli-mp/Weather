import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export default function StreamAudio() {
  const [audioURIs, setAudioURIs] = useState([]);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filenames = [
    "1.mp3",
    "2.mp3",
    "3.mp3",
    "4.mp3",
    "5.mp3",
    "6.mp3",
    "7.mp3",
    "8.mp3",
    "9.mp3",
    "10.mp3",
    "11.mp3",
    "12.mp3",
    "13.mp3",
    "14.mp3",
    "15.mp3",
    "16.mp3",
    "17.mp3",
    "18.mp3",
    "19.mp3",
    "20.mp3",
    "20-.mp3",
    "30-.mp3",
    "40-.mp3",
    "50-.mp3",
    "60-.mp3",
    "70-.mp3",
    "80-.mp3",
    "90-.mp3",
    "100.mp3",
    "200.mp3",
    "300.mp3",
    "400.mp3",
    "500.mp3",
    "600.mp3",
    "700.mp3",
    "800.mp3",
    "900.mp3",
    "1000.mp3",
    "100-.mp3",
    "200-.mp3",
    "300-.mp3",
    "400-.mp3",
    "500-.mp3",
    "600-.mp3",
    "700-.mp3",
    "800-.mp3",
    "900-.mp3",
    "afternoon-pre_temp1.mp3",
    "afternoon-pre_temp2.mp3",
    "afternoon-pre_temp3.mp3",
    "afternoon1.mp3",
    "afternoon2.mp3",
    "celcius.mp3",
    "cold.mp3",
    "evening-pre_temp1.mp3",
    "evening-pre_temp2.mp3",
    "evening1.mp3",
    "evening2.mp3",
    "evening3.mp3",
    "fahrenheit.mp3",
    "kelvin.mp3",
    "morning-pre_temp1.mp3",
    "morning-pre_temp2.mp3",
    "morning-pre_temp3.mp3",
    "morning-pre_temp4.mp3",
    "morning-pre_temp4.mp3",
    "morning1.mp3",
    "morning2.mp3",
    "morning3.mp3",
    "morning4.mp3",
    "very_hot.mp3",
    "very_cold.mp3",
    "warm.mp3",
  ];

  useEffect(() => {
    fetchAudios();
  }, []);

  async function fetchAudios() {
    try {
      const downloadedURIs = await Promise.all(
        filenames.map(async (filename) => {
          const fileUri = FileSystem.documentDirectory + filename;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          if (!fileInfo.exists) {
            const downloadResumable = FileSystem.createDownloadResumable(
              `https://api-mbxgyl2ata-uc.a.run.app/audio/${filename}`,
              fileUri
            );
            try {
              const { uri } = await downloadResumable.downloadAsync();
              setDownloadedCount((prevCount) => prevCount + 1);
              return uri;
            } catch (error) {
              console.error(`Failed to download ${filename}:`, error);
              return null; // Handle or rethrow error as needed
            }
          } else {
            setDownloadedCount((prevCount) => prevCount + 1);
            return fileUri;
          }
        })
      );

      //   console.log(downloadedURIs);
      setAudioURIs(downloadedURIs);
      setLoading(false);
    } catch (error) {
      setError("Error downloading audio files.");
      console.error("Error downloading audio files:", error);
      setLoading(false);
    }
  }

  async function playAudio(uri) {
    console.log(uri);
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();

      // Unload the sound after it finishes playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      setError("Error playing audio.");
      console.error("Error playing audio:", error);
    }
  }

  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>
          Downloading files: {downloadedCount} / {filenames.length}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {audioURIs.map((uri, index) => {
        const filename = uri.split("/").pop();
        return (
          <View key={index} style={styles.audioContainer}>
            <Button
              title={`Play Audio ${index + 1}`}
              onPress={() => playAudio(uri)}
            />
            <Text style={styles.audioText}>{filename}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  audioContainer: {
    marginVertical: 10,
    alignItems: "center",
    height: 110,
    backgroundColor: "pink",
    justifyContent: "center",
  },
  audioText: {
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  progressBar: {
    width: 200,
    marginTop: 10,
  },
});
