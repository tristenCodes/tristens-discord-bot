class WeatherService {
  base_url = process.env.OPENWEATHER_URL;

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
   * @param {string[]} forecastType - hourly, minutely, or daily when fetching data
   * @returns
   */
  async getWeatherDataForLatLon(lat, lon, forecastType) {
    const availableForecastTypes = ['daily', 'hourly', 'minutely', 'currently'];

    // return an array that will exclude all info except the necessary one
    const exclusions = availableForecastTypes.filter(
      (forecast) => forecast !== forecastType
    );

    const weatherResponse = await fetch(
      `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
        exclusions && [...exclusions].join(',')
      }&units=imperial&appid=${process.env.OPENWEATHER_APIKEY}`
    );
    const weatherInfo = await weatherResponse.json();
    console.log(weatherInfo);
    const weatherInfoForCategory = weatherInfo[forecastType];
    console.log(
      '🚀 ~ WeatherService ~ getWeatherDataForLatLon ~ weatherInfoForCategory:',
      weatherInfoForCategory
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

    console.log(data);
    return data;
  }

  /**
   *
   * @param {string} forecastType - available options: 'hourly', 'minutely', 'daily'
   */
  async getAlertsForLocation(lat, lon) {
    const exclusions = ['daily', 'hourly', 'minutely', 'currently'];
    const weatherResponse = await fetch(
      `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
        exclusions && [...exclusions].join(',')
      }&units=imperial&appid=${process.env.OPENWEATHER_APIKEY}`
    );
    const data = await weatherResponse.json();
    return data?.alerts;
  }

  parseDailyWeather() {}

  parseHourlyWeather(data) {
    const hourlyInfo = data.map((section) => {
      const utcString = new Date(section.dt * 1000).toUTCString();
      const extractedInfo = {
        dt: utcString.slice(17, 22),
        temp: section.temp,
      };

      return extractedInfo;
    });
    return hourlyInfo;
  }

  parseMinutelyWeather() {}

  parseCurrentWeather() {}
}

module.exports = WeatherService;
