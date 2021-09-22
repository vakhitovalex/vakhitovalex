import Mustache from 'mustache';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MUSTACHE_MAIN_DIR = './main.mustache';
const weather_key = process.env.OPEN_WEATHER_MAP_KEY;
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

// const response = await fetch('https://api.github.com/users/github');
// const data = await response.json();

// console.log(data);

async function setWeatherInformation() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=kazan&appid=${weather_key}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      DATA.weather = Math.round(data.main.temp);
    });
}

// fetch(
//   '`https://api.openweathermap.org/data/2.5/weather?q=kazan&appid=${SECRET.OPEN_WEATHER_MAP_KEY}&units=metric`'
// ).then((res) => res.json()
// .then(res) => console.log(res));

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
