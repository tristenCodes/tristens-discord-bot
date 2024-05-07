const { MAX_RESPONSE_LENGTH } = require('../constants/constants');
const {
  getDateTimeFromUnixTimeStamp,
  getDayFromUnixTimestamp,
  getTimezoneOffsetFromWeatherData,
  trimStringLength,
} = require('./time-utils');

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

  const alertData = parseAlertData(data) ?? '';

  return `${dailyInfo.join('\n')}\n${alertData}`;
}

function parseHourlyWeather(data) {
  if (!data) return '**no data available**';
  const timezoneOffset = getTimezoneOffsetFromWeatherData(data);
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

function parseMinutelyWeather(data) {
  if (!data) return '**no data available**';
  const timezoneOffset = getTimezoneOffsetFromWeatherData(data);
  const minuteInfo = data.minutely.map((section) => {
    const extractedInfo = {
      dt: getDateTimeFromUnixTimeStamp(section.dt, timezoneOffset, {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }),
      precipitation: `${Math.round(section.precipitation * 10)}%`,
    };
    const displayText = `**${extractedInfo.dt}**\nPrecipitation: ${extractedInfo.precipitation}\n`;
    return displayText;
  });
  return trimStringLength(
    `*Minute forecast does not give you weather alerts!*\n\n${minuteInfo.join(
      '\n'
    )}`,
    1000
  );
}

function parseCurrentWeather(data) {
  if (!data) return '**no data available**';
  const timezoneOffset = getTimezoneOffsetFromWeatherData(data);
  const currentInfo = {
    dt: getDateTimeFromUnixTimeStamp(data.current.dt, timezoneOffset, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }),
    weather: `${data.current.weather[0]?.main} - ${data.current.weather[0]?.description}\n`,
  };
  const alertData = parseAlertData(data);
  const displayText = `**${currentInfo.dt}**\n${currentInfo.weather}\n${
    alertData ? alertData : ''
  }`;
  return displayText.length > MAX_RESPONSE_LENGTH
    ? trimStringLength(displayText)
    : displayText;
}

function parseAlertData(data) {
  const timezoneOffset = getTimezoneOffsetFromWeatherData(data);
  let alertInfo = data?.alerts?.map((alert) => {
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

const parseWeatherData = (forecastType, weatherInfo) => {
  let parsedData;
  switch (forecastType) {
    case 'daily':
      parsedData = parseDailyWeather(weatherInfo);
      break;
    case 'hourly':
      parsedData = parseHourlyWeather(weatherInfo);
      break;
    case 'minutely':
      parsedData = parseMinutelyWeather(weatherInfo);
      break;
    case 'current':
      parsedData = parseCurrentWeather(weatherInfo);
      break;
    case 'alerts':
      parsedData = parseAlertData(weatherInfo);
      if (!parsedData) {
        parsedData = 'There are no alerts for your area at this moment.';
      }
      break;
  }
  return parsedData;
};

module.exports = {
  parseWeatherData,
};
