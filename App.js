import Navigator from "./src/navigation/Navigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

function App() {
  return (
    <ThemeProvider>
      <Navigator />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default App;
