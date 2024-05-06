const WeatherService = require('../../helpers/weather-service');
const { SlashCommandBuilder } = require('discord.js');
const data = new SlashCommandBuilder()
  .setName('weatherforecast')
  .setDescription('Get weather information for your area')
  .addStringOption((option) =>
    option
      .setName('zipcode')
      .setDescription(
        'enter your zip code / postal code, if canadian postal code, only enter first 3 letters/digits.'
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('country_code')
      .setDescription('enter your country code')
      .setMinLength(2)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('forecast_type')
      .setDescription('select daily, hourly, or minutely forecast')
      .setRequired(true)
      .addChoices(
        {
          name: 'Daily',
          value: 'daily',
        },
        {
          name: 'Hourly',
          value: 'hourly',
        },
        {
          name: 'Minutely',
          value: 'minutely',
        },
        {
          name: 'Current',
          value: 'current',
        },
        {
          name: 'Alerts',
          value: 'alerts',
        }
      )
  );

const execute = async (interaction) => {
  const zipcode = interaction.options.getString('zipcode');
  const countryCode = interaction.options.getString('country_code');
  const forecastType = interaction.options.getString('forecast_type');

  const weatherService = new WeatherService();

  const area = await weatherService.convertEntryToLatLon(zipcode, countryCode);
  const weatherInfo = await weatherService.getWeatherDataForLatLon(
    area.lat,
    area.lon,
    forecastType
  );

  console.log('weather info: ', weatherInfo);

  await interaction.reply({
    content: JSON.stringify(weatherInfo),
    ephemeral: true,
  });
};

module.exports = {
  data,
  execute,
};
