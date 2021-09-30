import Mustache from 'mustache';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MUSTACHE_MAIN_DIR = './main.mustache';
const OPEN_WEATHER_MAP_KEY = process.env.OPEN_WEATHER_MAP_KEY;
const weather_url = process.env.WEATHER_URL;
let weatherData = {
  name: 'Alex',
  date: new Date().toLocaleDateString('en-RU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Moscow',
  }),
};

async function setWeatherInformation() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=kazan&appid=${OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      const weatherDescription = data.weather.map((obj) => {
        const value = Object.values(obj.main).join('');
        return value;
      });
      console.log(weatherDescription);

      // console.log(weatherDescr);
      // const main = data.weather.main;
      // console.log(data.weather);
      // const cond = data.weather;
      // console.log(cond);
      // console.log(cond[main]);

      weatherData.weather = Math.round(data.main.temp);
      weatherData.weatherDescription = weatherDescription;
      weatherData.dayTimeLength = data.sys.sunset - data.sys.sunrise;
      weatherData.hours = Math.floor(weatherData.dayTimeLength / 3600) % 24;
      weatherData.minutes = Math.floor(weatherData.dayTimeLength / 60) % 60;

      weatherData.sunrise = new Date(
        data.sys.sunrise * 1000
      ).toLocaleDateString('en-RU', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'Europe/Moscow',
      });
      weatherData.sunset = new Date(data.sys.sunset * 1000).toLocaleDateString(
        'en-RU',
        {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short',
          timeZone: 'Europe/Moscow',
        }
      );
    });
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), weatherData);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  //Fetch Weather
  await setWeatherInformation();
  await generateReadMe();
}

action();
