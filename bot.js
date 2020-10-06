const fs = require('fs');
const Papa = require('papaparse');

const csvFilePath = 'covid19-cb3fb0151bc2414bb144176bb0a05cfc.csv'

const file = fs.createReadStream(csvFilePath);

var csvData=[];
Papa.parse(file, {
  header: true,
  step: function(result) {
    csvData.push(result.data)
  },
  complete: function(results, file) {
    console.log('Complete', csvData.length, 'records.'); 
  }
});


function findCasesByCity(city) {
  return csvData.filter(data => data.city === city)[0].confirmed
}

var TwitterPackage = require('twitter');

var secret = {
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
}
var Twitter = new TwitterPackage(secret);

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', {track: '#CovidNaMinhaCidade'}, function(stream) {

  // ... when we get tweet data...
  stream.on('data', function(tweet) {

    // print out the text of the tweet that came in
    console.log(tweet.text);
    var city = tweet.text.substring('#CovidNaMinhaCidade '.length);
    var totalCases = findCasesByCity(city)
    //build our reply object
    var statusObj = {status: "Oi @" + tweet.user.screen_name + ", o total de casos confirmados em "+city+" é de: "+totalCases, in_reply_to_status_id: tweet.id_str}

    //call the post function to tweet something
    Twitter.post('statuses/update', statusObj,  function(error, tweetReply, response){

      //if we get an error print it out
      if(error){
        console.log(error);
      }

      //print the text of the tweet we sent out
      console.log(tweetReply.text);
    });
  });

  // ... when we get an error, log it...
  stream.on('error', function(error) {
    //print out the error
    console.log(error);
  });
});
