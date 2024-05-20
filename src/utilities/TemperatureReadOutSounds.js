export default temperatureReadOutSounds = (inputNumber) => {
  const inputString = inputNumber.toString();
  const lastDigit = inputString[inputString.length - 1];

  if (inputString.length > 3) {
    return ["_"];
  } else if (inputString.length === 3) {
    const lastTwoDigits = inputString.slice(1);
    const lastTwoDigitsString = lastTwoDigits.toString();

    if (lastTwoDigits == "00") {
      return [inputString];
    } else {
      let lastTwo = [];
      if (lastTwoDigits <= 20 || lastDigit === "0") {
        lastTwo = [lastTwoDigitsString];
      } else {
        lastTwo = [`${lastTwoDigitsString[0]}0-`, `0${lastTwoDigitsString[1]}`];
      }

      return [...[`${inputString[0]}00-`], ...lastTwo];
    }
  } else if (inputNumber <= 20 || lastDigit === "0") {
    if (inputNumber < 10) {
      return [`0${inputString}`];
    } else {
      return [inputString];
    }
  } else if (inputString.length === 2) {
    return [`${inputString[0]}0-`, `0${inputString[1]}`];
  } else {
    return ["_"];
  }
};
