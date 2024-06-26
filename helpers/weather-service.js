const { parseWeatherData } = require('./parsing-utils');

const mockApiCall = JSON.parse(process.env.MOCK_API_CALL);

class WeatherService {
  base_url = process.env.OPENWEATHER_URL;
  availableForecastTypes = ['daily', 'hourly', 'minutely', 'current'];

  /**
   * @param {string} zipcode
   * @param {string} countryCode
   * @returns
   */
  async convertEntryToLatLon(zipcode, countryCode) {
    const APIKEY = process.env.OPENWEATHER_APIKEY;
    if (!APIKEY) throw new Error('OPENWEATHER API KEY UNDEFINED');
    if (!mockApiCall) {
      const conversionUrl = `${this.base_url}/geo/1.0/zip?zip=${zipcode},${countryCode}&appid=${APIKEY}`;
      const result = await fetch(conversionUrl);
      if (!result.ok) {
        throw new Error(`error fetching from ${conversionUrl}`);
      }

      const data = await result.json();
      const { lat, lon } = data;
      return { lat, lon };
    } else {
      const mockData = require('../testdata.json');
      const lat = mockData.lat;
      const lon = mockData.lon;
      return { lat, lon };
    }
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

    if (!mockApiCall) {
      const weatherResponse = await fetch(
        `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
          exclusions && [...exclusions].join(',')
        }&units=imperial&appid=${process.env.OPENWEATHER_APIKEY}`
      );
      const weatherInfo = await weatherResponse.json();
      const data = parseWeatherData(forecastType, weatherInfo);
      return data;
    } else {
      console.log('test data');
      const weatherInfo = require('../testdata.json');
      const data = parseWeatherData(forecastType, weatherInfo);
      return data;
    }
  }
}

module.exports = WeatherService;
