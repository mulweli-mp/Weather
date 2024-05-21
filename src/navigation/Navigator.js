import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigation from "./DrawerNavigation";
import Settings from "../screens/Settings";
import SavedLocations from "../screens/SavedLocations";
import PlayAudio from "../screens/PlayAudio";
import StreamAudio from "../screens/StreamAudio";

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DrawerNavigation"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="SavedLocations" component={SavedLocations} />
        <Stack.Screen name="PlayAudio" component={PlayAudio} />
        <Stack.Screen name="StreamAudio" component={StreamAudio} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
