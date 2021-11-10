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
    'https://api.spotify.com/v1/playlists/37i9dQZF1DX7hmlhGsyxU0/tracks?market=RU&limit=3&offset=5',
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
      console.log(musicData.items[0].track);
      // console.log(musicData.items[0].track.name);
      // console.log(musicData.items[0].track.artists[0].name);
      // console.log(musicData.items[0].track.album.images[2].url);

      infoData.song1 = {
        name: musicData.items[0].track.name,
        artist: musicData.items[0].track.artists[0].name,
        image: musicData.items[0].track.album.images[2].url,
      };
      infoData.song2 = {
        name: musicData.items[1].track.name,
        artist: musicData.items[1].track.artists[0].name,
        image: musicData.items[1].track.album.images[2].url,
      };
      infoData.song3 = {
        name: musicData.items[2].track.name,
        artist: musicData.items[2].track.artists[0].name,
        image: musicData.items[2].track.album.images[2].url,
      };
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
