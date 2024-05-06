const MAX_RESPONSE_LENGTH = 2000;

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
const trimStringLength = (originalString, length = MAX_RESPONSE_LENGTH) => {
  const trimmedString = originalString.substring(0, length - 3);
  const newString = trimmedString + '...';
  return newString;
};

function parseDailyWeather(data) {
  if (!data) return '**no data available**';
  const dailyInfo = data.daily.map((section) => {
    const extractedInfo = {
      dt: getDayFromUnixTimestamp(section.dt),
      high: section?.temp?.max,
      low: section?.temp?.min,
      weather: section?.weather[0]?.main,
      weatherDescription: section?.weather[0]?.description,
    };

    const displayText = `**${extractedInfo.dt}**\nHigh: ${
      extractedInfo.high
    }\nLow: ${extractedInfo.low}\nWeather: ${
      extractedInfo.weather ?? 'No Data'
    } - ${extractedInfo.weatherDescription ?? ''}\n`;

    return displayText;
  });

  return dailyInfo.join('\n');
}

function parseHourlyWeather(data, timezoneOffset) {
  if (!data) return '**no data available**';
  const hourlyInfo = data.hourly.map((section) => {
    const extractedInfo = {
      dt: getDateTimeFromUnixTimeStamp(section.dt, timezoneOffset, {
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC',
      }),
      temp: section.temp,
      feelsLike: section.feels_like,
      weather: `${section.weather[0].main} - ${section.weather[0].description}`,
    };
    const displayText = `**${extractedInfo.dt}**\nTemp: ${extractedInfo.temp}\nFeels Like: ${extractedInfo.feelsLike}\n${extractedInfo.weather}\n`;

    return displayText;
  });
  return hourlyInfo.join('\n').length > MAX_RESPONSE_LENGTH
    ? trimStringLength(hourlyInfo.join('\n'))
    : hourlyInfo.join('\n');
}

function parseMinutelyWeather(data, timezoneOffset) {
  if (!data) return '**no data available**';
  const minuteInfo = data.minutely.map((section) => {
    const extractedInfo = {
      dt: getDateTimeFromUnixTimeStamp(section.dt, timezoneOffset, {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }),
      precipitation: `${Math.round(section.precipitation * 100)}%`,
    };
    const displayText = `**${extractedInfo.dt}**\nPrecipitation: ${extractedInfo.precipitation}\n`;
    return displayText;
  });
  return trimStringLength(minuteInfo.join('\n'), 1000);
}

function parseCurrentWeather(data, timezoneOffset) {
  if (!data) return '**no data available**';
  const currentInfo = {
    dt: getDateTimeFromUnixTimeStamp(data.current.dt, timezoneOffset, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }),
    weather: `${data.current.weather[0]?.main} - ${data.current.weather[0]?.description}`,
  };
  const alertData = parseAlertData(data.alerts);
  const displayText = `**${currentInfo.dt}**\n${currentInfo.weather}\n\n${
    alertData ? alertData : ''
  }`;
  return displayText.length > MAX_RESPONSE_LENGTH
    ? trimStringLength(displayText)
    : displayText;
}

function parseAlertData(alerts, timezoneOffset) {
  let alertInfo = alerts?.map((alert) => {
    const alertObjectInfo = {
      startDt: getDateTimeFromUnixTimeStamp(alert.start, timezoneOffset, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }),
      endDt: getDateTimeFromUnixTimeStamp(alert.end, timezoneOffset, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }),
      event: alert.event,
      description: alert.description,
    };
    const displayText = `**${alertObjectInfo.event}**\n${alertObjectInfo.startDt} - ${alertObjectInfo.endDt}\n${alertObjectInfo.description}\n`;
    return displayText;
  });
  if (!alertInfo) {
    return undefined;
  }
  alertInfo = alertInfo.join('\n');
  return alertInfo?.length > MAX_RESPONSE_LENGTH
    ? trimStringLength(alertInfo)
    : alertInfo;
}

module.exports = {
  getTimeFromUTC: getTimeFromUnixTimestamp,
  getDateTimeFromUnixTimeStamp,
  getDayFromUnixTimestamp,
  trimStringToMaxLength: trimStringLength,
  parseCurrentWeather,
  parseDailyWeather,
  parseHourlyWeather,
  parseMinutelyWeather,
  parseAlertData,
};
