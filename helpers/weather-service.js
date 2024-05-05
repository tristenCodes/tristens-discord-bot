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
   * @param {string[]} exclusions - exclude hourly, minutely, or daily when fetching data
   * @returns
   */
  async getWeatherDataForLatLon(lat, lon, exclusions) {
    const weatherResponse = await fetch(
      `${this.base_url}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${
        exclusions && [...exclusions].join(',')
      }&appid=${process.env.OPENWEATHER_APIKEY}`
    );
    const data = await weatherResponse.json();
    return data;
  }

  /**
   *
   * @param {string} forecastType - available options: 'hourly', 'minutely', 'daily'
   */
  async getHourlyForecast(forecastType) {}
}

module.exports = WeatherService;
