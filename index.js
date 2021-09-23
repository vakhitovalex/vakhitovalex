import Mustache from 'mustache';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MUSTACHE_MAIN_DIR = './main.mustache';
const OPEN_WEATHER_MAP_KEY = process.env.OPEN_WEATHER_MAP_KEY;
const weather_url = process.env.WEATHER_URL;
let DATA = {
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
  await fetch(`${weather_url}${OPEN_WEATHER_MAP_KEY}&units=metric`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.main.temp);
      DATA.weather = Math.round(data.main.temp);
    });
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  //Fetch Weather
  await setWeatherInformation();
  await generateReadMe();
}

action();
