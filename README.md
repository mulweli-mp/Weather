# Weather App

Weather App is a mobile application built with React Native Expo that provides users with up-to-date weather information for their current location and other locations around the world. It offers a range of features, including:

- Display of current weather conditions, including current temperature, minimum and maximum temperatures, and weather description (e.g., sunny, cloudy, etc.).
- A 5-day weather forecast for the user's current location or any location of their choice
- Location search functionality to view weather information for any location.
- Map integration that allows users to pinpoint a specific location on the map and view its weather forecast.
- Two visually pleasing themes to choose from: "Forest" and "Sea."
- Offline persistence, ensuring users can access the most recently updated weather information even without an internet connection.

  
## Screenshots
 <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/84b462fd-8816-4d40-9549-64a9afb653a3" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/228fab00-bbe2-41ae-8651-b5d61cea2577" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/09bca3f5-fbba-4645-828c-c6bf50f63840" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
     <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/17394240-a2fe-47cf-9f02-345dc2ca92a5" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/7d68625e-ea15-4dde-acf9-589a30623f14" alt="Screenshot 1" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/a1cc45b7-acd8-4efc-bbae-5c343e6b96f5" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/GeneCodeFx/Weather/assets/52564475/71183a4b-4b1b-4e0b-b2f1-5f78b2fc3c05" alt="Screenshot 2" width="135" height="300" style="border: 1px solid #ddd;">
</div>

## Try the app yourself
[Download the Weather APK file here](https://drive.google.com/file/d/1LxrgIgzlLo-i91yjhYJshnDYy257M5hf/view?usp=sharing) and install it on your Android device
  
## Table of Contents
- [Building the project](#building-the-project)
- [Usage](#usage)
- [Themes](#themes)
- [Offline Persistence](#offline-persistence)
- [Technologies Used](#technologies-used)
- [Conventions](#conventions)
- [Architecture](#architecture)
- [Dependencies](#third-party-libraries)

<a name="building-the-project"></a>
## Building the project

To build the project on your local machine and install it on your device, follow these steps:

1. Clone the repository to your local machine:
    ```bash
   git clone git clone https://github.com/GeneCodeFx/Weather.git
    ```
2. Navigate to the project directory:
    ```bash
   cd Weather
    ```
3. Install the required dependencies:
    ```bash
   npm install
    ```
4. Add .env file at the project level with two keys used in this project which are OPEN_WEATHER_API_KEY and MAPBOX_ACCESS_TOKEN such that .env file will look like this:
    ```bash
   OPEN_WEATHER_API_KEY = "your key here"
    MAPBOX_ACCESS_TOKEN = "your token here"
    ```
    If you are from DVT, I will send these keys via email when I submit the project otherwise OPEN_WEATHER_API_KEY can be found [here](https://home.openweathermap.org/api_keys)
   and MAPBOX_ACCESS_TOKEN can be found [here](https://docs.mapbox.com/help/getting-started/access-tokens/)
  
5. Start the app:
    ```bash
   npx expo start
    ```
The app can be run on Android and iOS

<a name="usage"></a>

## Usage

- Upon launching the app, it will request location access to fetch your current weather data.

- Explore the app's features, including viewing current weather, 5-day forecasts, and searching for other locations.
  
- To search for more locations or select them on the map, tap the name of your current city at the top center of the home screen.
  
- Visualise all saved locations on the map by opening the app drawer and selecting the option to do just that

- Change the app's theme by selecting either "Forest" or "Sea" from the theme menu located on the app drawer.

- Enjoy offline access to your last updated weather information.

- The app offers the user the ability to see the last time weather data was updated and the button to refresh anytime

- If the user doesn't refresh data for more than an hour, the app will try to silently do that for them for a smoother user experience

<a name="themes"></a>
## Themes
The Weather App offers two visually appealing themes for a customized user experience: "Forest" and "Sea." Choose your preferred theme from the settings menu.

<a name="Offline-ersistence"></a>
## Offline Persistence
Weather App uses the '@react-native-async-storage/async-storage' library to provide offline persistence. This means that even when you're not connected to the internet, you can still access the most recent weather data.

<a name="technologies-used"></a>
## Technologies Used

- React Native Expo
- React Context for state management
<a name="conventions"></a>
## Conventions

- **Coding Style**: Closely followed the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) wherever possible for maintaining consistent coding style.

- **Component Naming**: Meaningful and descriptive names are used for React components to enhance code readability.

- **Folder Structure**: The project is organized into clear folders, such as `src` for source code, `assets` for assets, and `components` for reusable components.

- **Comments**: Comments are used to explain complex logic, non-obvious behavior, or important details within the code.

<a name="architecture"></a>- 
## Architecture

The Weather App follows a component-based architecture, leveraging React Native and Expo. It uses React Context for state management to handle application-wide data.
<a name="Structure"></a>
## Folder Structure

- `src/`
  - `components/`
  - `screens/`
  - `navigation/`
  - `context/`
  - `utilities/`
- `assets/`
  - `icons/`
  - `images/`
  - `lottie-files/`
- `App.js`
- `.env`

Summary of the structure above:

- **components**: Contains reusable UI components.
- **screens**: Defines individual screens or views of the app.
- **navigation**: Manages app navigation using React Navigation.
- **context**: Handles state management across the whole app
- **utilities**: Contains functions and variables that are used in several components
- **assets**: Self explanatory 
- **App.js**: Starting point of the app
- **env**: Contains two sensitive keys namely: OPEN_WEATHER_API_KEY and MAPBOX_ACCESS_TOKEN

<a name="third-party-libraries"></a>
## Third-Party Libraries

The Weather App utilizes several third-party libraries to enhance functionality and user experience:

- [React Native Maps](https://www.npmjs.com/package/react-native-maps): Provides map integration for pinpointing locations.

- [Lottie React Native](https://www.npmjs.com/package/lottie-react-native): Adds animations for improved user engagement.

- [Async Storage](https://www.npmjs.com/package/@react-native-async-storage/async-storage): Enables offline persistence for weather data.

- [React Navigation](https://reactnavigation.org/): Manages navigation within the app.

- [dotenv](https://www.npmjs.com/package/react-native-dotenv): Helps manage environment variables.

- [Expo Location](https://www.npmjs.com/package/expo-location): Facilitates location-based features.

    
