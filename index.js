import Mustache from 'mustache';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MUSTACHE_MAIN_DIR = './main.mustache';
const OPEN_WEATHER_MAP_KEY = process.env.OPEN_WEATHER_MAP_KEY;
const token = process.env.spotifyToken;
const weather_url = process.env.WEATHER_URL;
let infoData = {
  name: 'Alex',
  date: new Date().toLocaleDateString('en-RU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour12: false,
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
      infoData.weatherDescription = data.weather.map((obj) => {
        const value = Object.values(obj.main).join('');
        console.log(value);
        switch (value) {
          case 'Clear':
            infoData.weatherEmoji = ':sunny:';
            break;
          case 'Clouds':
            infoData.weatherEmoji = ':cloud:';
            break;
          case 'Rain':
            infoData.weatherEmoji = ':cloud_with_rain:';
            break;
          case 'Snow':
            infoData.weatherEmoji = ':cloud_with_snow:';
            break;
          default:
            infoData.weatherEmoji = '';
        }
        return value;
      });

      infoData.weather = Math.round(data.main.temp);

      infoData.dayTimeLength = data.sys.sunset - data.sys.sunrise;
      infoData.hours = Math.floor(infoData.dayTimeLength / 3600) % 24;
      infoData.minutes = Math.floor(infoData.dayTimeLength / 60) % 60;

      infoData.sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
        'ru-RU',
        {
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short',
          timeZone: 'Europe/Moscow',
        }
      );
      infoData.sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString(
        'ru-RU',
        {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
          timeZone: 'Europe/Moscow',
        }
      );
    });
}

async function setRecentlyPlayedMusic() {
  await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=10&after=1624892230',
    {
      headers: {
        Accept: 'application / json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => response.json())
    .then((musicData) => {
      console.log(musicData.items[0]);
      infoData.song1 = musicData.items[0].track.name;
      infoData.songName2 = musicData.items[1].track.name;
      infoData.songName3 = musicData.items[2].track.name;
    });
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), infoData);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  //Fetch Weather
  await setWeatherInformation();
  await setRecentlyPlayedMusic();
  await generateReadMe();
}

action();
