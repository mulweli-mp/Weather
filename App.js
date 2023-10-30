import Navigator from "./src/navigation/Navigator";
import { ThemeProvider } from "./src/context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Navigator />
    </ThemeProvider>
  );
}

export default App;
