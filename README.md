# Weather App

Weather App is a mobile application built with React Native Expo that provides users with up-to-date weather information for their current location and other locations around the world. It offers a range of features, including:

- Display of current weather conditions, including current temperature, minimum and maximum temperatures, and weather description (e.g., sunny, cloudy, etc.).
- A 7-day weather forecast for the user's current location or any location of their choice
- Location search functionality to view weather information for any location.
- Map integration that allows users to pinpoint a specific location on the map and view its weather forecast.
- Offline persistence, ensuring users can access the most recently updated weather information even without an internet connection.

  
## Screenshots
 <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <img src="https://github.com/user-attachments/assets/47a9d914-670e-48d9-afbf-fcabe0471ac3" alt="Screenshot 1" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/81569a58-8fc4-4fdc-8e50-3f529a0657ac" alt="Screenshot 2" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/846fbc26-5090-460a-b69e-c26fed2b81a1" alt="Screenshot 3" width="135" height="300" style="border: 1px solid #ddd;">
     <img src="https://github.com/user-attachments/assets/0fa543bc-b64f-438c-8265-3ff19610d404" alt="Screenshot 4" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/81bac4ea-ed22-43af-aebf-ae5e8c547f96" alt="Screenshot 5" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/face6a5e-d323-4d38-9a39-fd741716f20f" alt="Screenshot 6" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/6ef3dad4-8eb1-4229-ad56-ad51d0558c3e" alt="Screenshot 7" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/c6ddcb0e-905b-4ead-a21e-b74703998f23e" alt="Screenshot 8" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/3a22f0d9-db28-4e6f-90b7-bebb1b8b7e41" alt="Screenshot 9" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/cb631e13-52fd-48d8-bc50-db4db55c6232" alt="Screenshot 10" width="135" height="300" style="border: 1px solid #ddd;">
    <img src="https://github.com/user-attachments/assets/04bac1ca-7cc0-4822-b0d3-288af0c22eb2" alt="Screenshot 11" width="135" height="300" style="border: 1px solid #ddd;">   
</div>

## Try the app yourself
[Download the Weather APK file here](https://drive.google.com/file/d/1chCC7MoFU7cLd4FSZbJJG0wM5ahENJ9N/view?usp=sharing) and install it on your Android device
  
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
   git clone git clone https://github.com/mulweli-mp/Weather.git
    ```
2. Navigate to the project directory:
    ```bash
   cd Weather
    ```
3. Install the required dependencies:
    ```bash
   npm install
    ```
4. Add .env file at the project level with the secret keys used in this project which are [OPEN_WEATHER_API_KEY](https://home.openweathermap.org/api_keys),   [MAPBOX_ACCESS_TOKEN](https://docs.mapbox.com/help/getting-started/access-tokens) and [GOOGLE_MAPS_APIKEY](https://console.cloud.google.com/apis/credentials) such that .env file will look like this:

    ```bash
    OPEN_WEATHER_API_KEY = "your key here"
    MAPBOX_ACCESS_TOKEN = "your token here"
    GOOGLE_MAPS_APIKEY = "your key here"
    ```
  
6. Start the app:
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

- Enjoy offline access to your last updated weather information.

- If the user doesn't refresh data for more than an hour, the app will try to silently do that for them for a smoother user experience

<a name="themes"></a>
## Themes
The theme of the app depends on the time of the day and the weather at the currently selected location. i.e Background image will be a landscape of the area with sun if it is sunny, rain if rainy, etc

<a name="Offline-ersistence"></a>
## Offline Persistence
Weather App uses the '@react-native-async-storage/async-storage' library to provide offline persistence. This means that even when you're not connected to the internet, you can still access the most recent weather data.

<a name="technologies-used"></a>
## Technologies Used

- React Native Expo
- React Context for state management
- react-native-maps to display the maps  
- react-native-reanimated for animations
- @react-native-async-storage/async-storage
<a name="conventions"></a>
## Conventions


- **Component Naming**: Meaningful and descriptive names are used for React components to enhance code readability.

- **Folder Structure**: The project is organized into clear folders, such as `src` for source code, `assets` for assets, and `components` for reusable components.

- **Comments**: Comments are used to explain complex logic, non-obvious behavior, or important details within the code.

<a name="architecture"></a>
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
- **env**: Contains two sensitive keys namely: OPEN_WEATHER_API_KEY, MAPBOX_ACCESS_TOKEN, and GOOGLE_MAPS_APIKEY

<a name="third-party-libraries"></a>
## Third-Party Libraries

The Weather App utilizes several third-party libraries to enhance functionality and user experience:

- [React Native Maps](https://www.npmjs.com/package/react-native-maps): Provides map integration for pinpointing locations.

- [Lottie React Native](https://www.npmjs.com/package/lottie-react-native): Adds animations for improved user engagement.

- [Async Storage](https://www.npmjs.com/package/@react-native-async-storage/async-storage): Enables offline persistence for weather data.

- [React Navigation](https://reactnavigation.org/): Manages navigation within the app.

- [dotenv](https://www.npmjs.com/package/react-native-dotenv): Helps manage environment variables.

- [Expo Location](https://www.npmjs.com/package/expo-location): Facilitates location-based features.

    
