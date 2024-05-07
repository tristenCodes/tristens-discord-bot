const { MAX_RESPONSE_LENGTH } = require('../constants/constants');
/**
 *
 * @param {number} unixTimestamp
 * @param {Intl.DateTimeFormatOptions} options
 * @returns
 */
const getDateTimeFromUnixTimeStamp = (
  unixTimestamp,
  timezoneOffset,
  options
) => {
  const date = new Date(unixTimestamp * 1000);
  if (!timezoneOffset) {
    console.log(new Intl.DateTimeFormat('en-US', options).format(date));
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
  const localDate = new Date(date.getTime() + timezoneOffset * 1000);
  return new Intl.DateTimeFormat('en-US', options).format(localDate);
};

const getDayFromUnixTimestamp = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

const getTimezoneOffsetFromWeatherData = (weatherData) => {
  const timezoneOffset = weatherData?.timezone_offset;
  return timezoneOffset;
};

const trimStringLength = (originalString, length = MAX_RESPONSE_LENGTH) => {
  const trimmedString = originalString.substring(0, length - 3);
  const newString = trimmedString + '...';
  return newString;
};

module.exports = {
  getDateTimeFromUnixTimeStamp,
  getDayFromUnixTimestamp,
  getTimezoneOffsetFromWeatherData,
  trimStringLength,
};
