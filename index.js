import Mustache from 'mustache';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import request from 'request';
dotenv.config();

const MUSTACHE_MAIN_DIR = './main.mustache';
const OPEN_WEATHER_MAP_KEY = process.env.OPEN_WEATHER_MAP_KEY;

const weather_url = process.env.WEATHER_URL;
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your client secret

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

// async function getToken() {
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       Authorization:
//         'Basic ' +
//         new Buffer(client_id + ':' + client_secret).toString('base64'),
//     },
//     form: {
//       grant_type: 'client_credentials',
//     },
//     json: true,
//   };
//   request.post(authOptions, function (error, response, body) {
//     if (!error && response.statusCode === 200) {
//       // use the access token to access the Spotify Web API
//       const token = body.access_token;
//       const options = {
//         url: 'https://api.spotify.com/v1/users/bptmvjlwd14p9mys4qlv9i6wb',
//         headers: {
//           Authorization: 'Bearer ' + token,
//         },
//         json: true,
//       };
//       request.get(options, function (error, response, body) {
//         fs.readFile('./.env', (err, data) => {
//           if (err) {
//             console.log(err);
//             return;
//           }
//           const symbol = data.toString('utf8');
//           const array = symbol.split('\n');
//           array.splice(-1, 1, `spot=${token}`);
//           const symbols = array.join('\n');
//           fs.writeFile('./.env', symbols, (err) => {
//             if (err) console.log(err);
//             else console.log(symbols);
//             return;
//           });
//         });
//       });
//     }
//   });
// }

// async function setRecentlyPlayedMusic() {
//   // await getToken(() => {
//   // setTimeout(resolve, 3000);
//   const token = await getToken();
//   await fetch(
//     'https://api.spotify.com/v1/playlists/37i9dQZF1DX7hmlhGsyxU0/tracks?market=RU&limit=3&offset=5',
//     {
//       headers: {
//         Accept: 'application / json',
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//     .then((response) => response.json())
//     .then((musicData) => {
//       infoData.song1 = {
//         name: musicData.items[0].track.name,
//         artist: musicData.items[0].track.artists[0].name,
//         image: musicData.items[0].track.album.images[2].url,
//       };
//       infoData.song2 = {
//         name: musicData.items[1].track.name,
//         artist: musicData.items[1].track.artists[0].name,
//         image: musicData.items[1].track.album.images[2].url,
//       };
//       infoData.song3 = {
//         name: musicData.items[2].track.name,
//         artist: musicData.items[2].track.artists[0].name,
//         image: musicData.items[2].track.album.images[2].url,
//       };
//     });
// }

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), infoData);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  // await getToken();
  await setWeatherInformation();
  // await setRecentlyPlayedMusic();
  await generateReadMe();
}

action();
