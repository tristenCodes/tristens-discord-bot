const getTimeFromUTC = (dateTime) => {
  const utcString = new Date(dateTime * 1000).toUTCString();
  return utcString.slice(17, 22);
};

module.exports = {
  getTimeFromUTC,
};
