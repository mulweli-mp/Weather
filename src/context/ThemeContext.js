import { useState, createContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = (props) => {
  const [themeColors, setThemeColors] = useState({
    theme: "forest", //Other option is "sea"
    sunny: "#47ab2f",
    cloudy: "#54717a",
    rainy: "#57575d",
  });

  useEffect(() => {
    getSavedTheme();
  }, []);

  const saveSelectedTheme = async (theme) => {
    try {
      const jsonValue = JSON.stringify(theme);
      await AsyncStorage.setItem("theme", jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const getSavedTheme = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("theme");
      let theme = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (theme) {
        setThemeColors((prevState) => ({
          ...prevState,
          theme,
        }));
      }
    } catch (e) {
      // error reading value
      alert(e);
    }
  };

  const changeTheme = (theme) => {
    setThemeColors((prevState) => ({
      ...prevState,
      theme,
    }));
    saveSelectedTheme(theme);
  };

  return (
    <ThemeContext.Provider value={[themeColors, changeTheme]}>
      {props.children}
    </ThemeContext.Provider>
  );
};
