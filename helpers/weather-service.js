const { getTimeFromUTC } = require('./utils');

class WeatherService {
  base_url = process.env.OPENWEATHER_URL;
  availableForecastTypes = ['daily', 'hourly', 'minutely', 'current', 'alerts'];

  /**
   * @param {string} zipcode
   * @param {string} countryCode
   * @returns
   */
  async convertEntryToLatLon(zipcode, countryCode) {
    const APIKEY = process.env.OPENWEATHER_APIKEY;
    if (!APIKEY) throw new Error('OPENWEATHER API KEY UNDEFINED');

    const conversionUrl = `${this.base_url}/geo/1.0/zip?zip=${zipcode},${countryCode}&appid=${APIKEY}`;
    const result = await fetch(conversionUrl);
    if (!result.ok) {
      throw new Error(`error fetching from ${conversionUrl}`);
    }

    const data = await result.json();
    const { lat, lon } = data;
    return { lat, lon };
  }

  /**
   *
   * @param {number} lat - lattitude for location
   * @param {number} lon - longitude for location
   * @param {string[]} forecastType - hourly, minutely, daily, alerts, or data
   * @returns
   */
  async getWeatherDataForLatLon(lat, lon, forecastType) {
    // return an array that will exclude all info except the necessary one
    const exclusions = this.availableForecastTypes.filter(
      (forecast) => forecast !== forecastType
    );

    const weatherResponse = await fetch(
      `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
        exclusions && [...exclusions].join(',')
      }&units=imperial&appid=${process.env.OPENWEATHER_APIKEY}`
    );
    const weatherInfo = await weatherResponse.json();
    console.log(
      '🚀 ~ WeatherService ~ getWeatherDataForLatLon ~ weatherInfo:',
      weatherInfo
    );
    const weatherInfoForCategory = weatherInfo[forecastType];
    console.log(
      '🚀 ~ WeatherService ~ getWeatherDataForLatLon ~ weatherInfoForCategory:',
      weatherInfoForCategory,
      forecastType
    );
    let data;

    switch (forecastType) {
      case 'daily':
        data = this.parseDailyWeather(weatherInfoForCategory);
        break;
      case 'hourly':
        data = this.parseHourlyWeather(weatherInfoForCategory);
        break;
      case 'minutely':
        data = this.parseMinutelyWeather(weatherInfoForCategory);
        break;
      case 'current':
        data = this.parseCurrentWeather(weatherInfoForCategory);
        break;
    }
    return data;
  }

  //   /**
  //    *
  //    * @param {string} forecastType - available options: 'hourly', 'minutely', 'daily'
  //    */
  //   async getAlertsForLocation(lat, lon) {
  //     const exclusions = ['daily', 'hourly', 'minutely', 'currently', 'alerts'];
  //     const weatherResponse = await fetch(
  //       `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
  //         exclusions && [...exclusions].join(',')
  //       }&units=imperial&appid=${process.env.OPENWEATHER_APIKEY}`
  //     );
  //     const data = await weatherResponse.json();
  //     return data?.alerts;
  //   }

  parseDailyWeather(data) {
    if (!data) return 'no data';
    const dailyInfo = data.map((section) => {
      const extractedInfo = {
        dt: getTimeFromUTC(section.dt),
        high: section?.temp?.max,
        low: section?.temp?.min,
        weather: section?.weather?.main,
        weatherDescription: section?.weather?.description,
      };
      return extractedInfo;
    });
    return dailyInfo;
  }

  parseHourlyWeather(data) {
    if (!data) return 'no data';
    const hourlyInfo = data.map((section) => {
      const extractedInfo = {
        dt: getTimeFromUTC(section.dt),
        temp: section.temp,
        feelsLike: section.feels_like,
        weather: section.weather.map((weatherSection) => {
          return {
            main: weatherSection.main,
            description: weatherSection.description,
          };
        }),
      };

      return extractedInfo;
    });
    return hourlyInfo;
  }

  parseMinutelyWeather(data) {
    if (!data) return 'no data';
    const minuteInfo = data.map((section) => {
      return {
        dt: getTimeFromUTC(section.dt),
        precipitation: `${Math.round(section.precipitation * 100)}%`,
      };
    });
    return minuteInfo;
  }

  parseCurrentWeather(data) {
    if (!data) return 'no data';
    const currentInfo = {
      dt: getTimeFromUTC(data.dt),
      weather: data.weather.map((section) => {
        return {
          main: section?.main,
          description: section?.description,
        };
      }),
      rain: data?.rain ?? "no rain",
    };
    return currentInfo;
  }
}

module.exports = WeatherService;
