const getDateTimeFromUnixTimeStamp = (unixTimestamp) => {
  const utcString = new Date(unixTimestamp * 1000).toUTCString();
  return utcString;
};

const getTimeFromUnixTimestamp = (unixTimestamp) => {
  const utcString = new Date(unixTimestamp * 1000).toUTCString();
  return utcString.slice(17, 22);
};

const getDayFromUnixTimestamp = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

/**
 *
 * @param {string} originalString
 * @returns
 */
const trimStringToMaxLength = (originalString) => {
  const trimmedString = originalString.substring(0, 2000 - 3);
  const newString = trimmedString + '...';
  return newString;
};

module.exports = {
  getTimeFromUTC: getTimeFromUnixTimestamp,
  getDateTimeFromUTC: getDateTimeFromUnixTimeStamp,
  getDayFromUnixTimestamp,
  trimStringToMaxLength,
};
