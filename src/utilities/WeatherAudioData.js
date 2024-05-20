const getTimeOfDay = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
};

const getRandomIntro = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return randomIndex + 1;
};

const getTemperatureCategory = (feels_like) => {
  if (feels_like < 5) {
    return `very_cold`;
  } else if (feels_like < 18) {
    return `cold`;
  } else if (feels_like < 28) {
    return `warm`;
  } else if (feels_like < 32) {
    return `hot`;
  } else {
    return `very_hot`;
  }
};
const getWeatherCategory = (weatherId) => {
  if (weatherId <= 202) {
    return `na mithathabo na mvula`;
  } else if (weatherId <= 221) {
    return `na mithathabo`;
  } else if (weatherId <= 232) {
    return `na mithathabo na vhusuto`;
  } else if (weatherId <= 321) {
    return `na vhusuto`;
  } else if (weatherId <= 531) {
    return `na mvula`;
  } else if (weatherId <= 622) {
    return `na snow`;
  } else if (weatherId <= 781) {
    return `na mimuya`;
  } else if (weatherId === 800) {
    return `and ahuna na gole na lithihi`;
  } else if (weatherId <= 803) {
    return `na makole o balanganaho`;
  } else {
    //<804
    return `na gole lo tibaho`;
  }
};

const readStructure = {
  greetings: {
    morning: [
      "Lotsha lotshela zwezwi nwana wa mukalaha ahuna na zwine, ",
      "He Ndaa! ",
      "Lotsha, ",
      "Ndi Matsheloni, ",
    ],
    afternoon: ["Duvha lavhudi vhukuma, ", "Ndi Masiari, "],
    evening: [
      "Lokovhela, ",
      "Lokovhela, ", //Must replace
      "Ndi Madekwana, ",
      //   "Ndia kholwa vhovha na duvha lavhudi, ", //Must record this
    ],
  },
  currentWeather: {
    morning: [
      "Huvhonala hutshinga hu khou ",
      "Zwazwino hu khou vhonala mutsho wau ",
      "Arali vhonovha nnda, vhado zwipfa uri hu khou ",
      "Matsheloni a namusi huvhonala hutshinga hu khou ",
      //   "Namusi lotsha nga hei ndila; zwazwino hu khou ", //Must record this
    ],
    afternoon: [
      "Zwazwino hu khou ",
      "Masiari avhudi vhukuma na mutsho wau ",
      "Masiari a namusi hu khou ",
    ],
    evening: [
      "Madekwana a namusi hu khou ",
      "Lokovhela zwavhudi vhukuma ngauri huvhonala hu khou ",
      //   "Madekwana ano hu khou ", //Must record this
    ],
  },
  dayWeather: {
    afternoon: [
      "Fhedzi-ha, ritshi sedza nga masiari ri khou vhona mutsho wau ",
    ],
    evening: ["Hu uri nga madekwana hu do ", "Nga madekwana hu do "],
    afternoon_evening: {
      primary: ["Nga masiari na madekwana hudo "],
      dayRead: "nga masiari",
      eveRead: "nga madekwana",
    },
  },
  tomorrow: {
    weatherDescription: [
      "Ritshi lavhelesa la matshelo, ri khou wana uri hudovha hu ",
      "Matshelo litshaho hudovha hu ",
    ],
    minmaxTemperature: "ya fhasisa ndi ",
    maxTemperature: "ya nthesa ndi ",
  },
};

export default weatherAudioData = (data) => {
  const timeOfDay = getTimeOfDay();

  const currentTempRead = getTemperatureCategory(data.current.feels_like);

  const audioInput = {
    timeOfDayDescription: timeOfDay,
    timeOfDayNumber: getRandomIntro(readStructure.greetings[timeOfDay]),
    pre_temp: getRandomIntro(readStructure.currentWeather[timeOfDay]),
    currentTempDecription: currentTempRead,
    currentTemp: parseInt(data.current.temp),
    unit: "celcius",
  };

  return audioInput;
  //   const currentWeatherRead = getWeatherCategory(data.current.weather[0].id);

  //   let restOfTheDay = "";
  //   const dayTempRead = `${getTemperatureCategory(data.daily[0].feels_like.day)}`;
  //   const eveTempRead = `${getTemperatureCategory(data.daily[0].feels_like.eve)}`;

  //   const afternoonReading = `${getRandomIntro(
  //     readStructure.dayWeather.afternoon
  //   )} ${dayTempRead}`;

  //   const eveningReading = `${getRandomIntro(
  //     readStructure.dayWeather.evening
  //   )} ${eveTempRead}`;

  //   if (timeOfDay === "morning") {
  //     if (dayTempRead === eveTempRead) {
  //       restOfTheDay = `${readStructure.dayWeather.afternoon_evening.primary} ${dayTempRead}, ${data.daily[0].temp.day}°C ${readStructure.dayWeather.afternoon_evening.dayRead} - ${data.daily[0].temp.eve}°C ${readStructure.dayWeather.afternoon_evening.eveRead}`;
  //     } else {
  //       restOfTheDay = `${afternoonReading}. ${eveningReading}`;
  //     }
  //   } else if (timeOfDay === "afternoon") {
  //     restOfTheDay = `${eveningReading}`;
  //   }

  //   const tomorrowWeatherRead = getWeatherCategory(data.daily[1].weather.id);
  //   const lowestTempRead = `${readStructure.tomorrow.minmaxTemperature} ${data.daily[1].temp.min}°C`;
  //   const hightTempRead = `${readStructure.tomorrow.maxTemperature} ${data.daily[1].temp.max}°C`;
  //   const tomorrowReading = `${getRandomIntro(
  //     readStructure.tomorrow.weatherDescription
  //   )}${tomorrowWeatherRead}; ${lowestTempRead} - ${hightTempRead}`;

  //   const reading = `${getRandomIntro(
  //     readStructure.greetings[timeOfDay]
  //   )}${getRandomIntro(
  //     readStructure.currentWeather[timeOfDay]
  //   )}${currentTempRead} - ${
  //     data.current.temp
  //   }°C ${currentWeatherRead}. ${restOfTheDay}. ${tomorrowReading}`;

  //   return reading;
};

// console.log(
//   readWeather({
//     current: {
//       temp: 41,
//       feels_like: 42,
//       weather: [
//         {
//           id: 803,
//           main: "Clouds",
//           description: "broken clouds",
//           icon: "04d",
//         },
//       ],
//     },
//     daily: [
//       {
//         temp: {
//           day: 299.03,
//           min: 290.69,
//           max: 300.35,
//           night: 291.45,
//           eve: 297.51,
//           morn: 292.55,
//         },
//         feels_like: {
//           day: 299.21,
//           night: 291.37,
//           eve: 297.86,
//           morn: 292.87,
//         },

//         weather: [
//           {
//             id: 500,
//             main: "Rain",
//             description: "light rain",
//             icon: "10d",
//           },
//         ],
//       },

//       {
//         temp: {
//           day: 299.03,
//           min: 290.69,
//           max: 300.35,
//           night: 291.45,
//           eve: 297.51,
//           morn: 292.55,
//         },
//         weather: [
//           {
//             id: 500,
//             main: "Rain",
//             description: "light rain",
//             icon: "10d",
//           },
//         ],
//       },
//     ],
//   })
// );
