import { useState, createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = (props) => {
  const [themeColors, setThemeColors] = useState({
    theme: "sea", //Other option is "forest"
    sunny: "#47ab2f",
    cloudy: "#54717a",
    rainy: "#57575d",
  });

  const changeTheme = (theme) => {
    setThemeColors((prevState) => ({
      ...prevState,
      theme,
    }));
  };

  return (
    <ThemeContext.Provider value={[themeColors, changeTheme]}>
      {props.children}
    </ThemeContext.Provider>
  );
};
