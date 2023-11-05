import Navigator from "./src/navigation/Navigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import { StatusBar } from "expo-status-bar";

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Navigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
