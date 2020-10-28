import { config } from 'dotenv';
config();

import fs from 'fs';
import Papa from 'papaparse';
import TwitterPackage from 'twitter';
import axios from 'axios';
import { LocationStatistics } from './src/interfaces/LocationStatistics';

const csvFilePath = 'covid19-cb3fb0151bc2414bb144176bb0a05cfc.csv'
const file = fs.createReadStream(csvFilePath);

const csvData: any[] = [];
Papa.parse(file, {
  header: true,
  step: (result) => csvData.push(result.data),
  complete: (results, file) => console.log('Complete', csvData.length, 'records.')
});


function findCasesByCityInCsv(city: string): Number {
  return csvData.filter(data => data.city === city)[0].confirmed
}

async function findCasesByCityInApi(city: string): Promise<Number> {

  let response = await axios.get('https://brasil.io/covid19/cities/cases/');

  if (response.status != 200)
    return -1;

  let parsedCities: LocationStatistics[] = [];
  let cityStatistics: LocationStatistics[];

  Object.keys(response.data.cities).map((cityToParse) => parsedCities.push(response.data.cities[cityToParse]));

  cityStatistics = parsedCities.filter((c: LocationStatistics) => c.city == city);

  return (cityStatistics.length > 0) ? cityStatistics[0].confirmed : -1;
}

async function findCasesByCity(city: string): Promise<Number> {
  let cityStatistics: Number = await findCasesByCityInApi(city);

  console.log('retorno API: ', cityStatistics);

  if (cityStatistics >= 0)
    return cityStatistics;

  return findCasesByCityInCsv(city);
}

const secret = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
} as TwitterPackage.AccessTokenOptions;

const Twitter = new TwitterPackage(secret);

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', { track: '#CovidNaMinhaCidade' }, (stream) => {
  console.log("listening...");

  // ... when we get tweet data...
  stream.on('data', (tweet) => {

    // print out the text of the tweet that came in
    console.log(tweet.text);
    const city = tweet.text.substring('#CovidNaMinhaCidade '.length);

    findCasesByCity(city).then((totalCases) => {
      //build our reply object
      const statusObj = { status: `Oi @${tweet.user.screen_name}, o total de casos confirmados em ${city} é de: ${totalCases}`, in_reply_to_status_id: tweet.id_str };

      //call the post function to tweet something
      Twitter.post('statuses/update', statusObj, (error, tweetReply, response) => {

        //if we get an error print it out
        if (error) {
          console.log(error);
        }

        //print the text of the tweet we sent out
        console.log(tweetReply.text);
      });
    });
  });

  // ... when we get an error, log it...
  stream.on('error', (error) => {
    //print out the error
    console.log(error);
  });
});
