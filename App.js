import Navigator from "./src/navigation/Navigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Navigator />
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
