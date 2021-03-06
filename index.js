var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var fetch = require("node-fetch");

app.use(bodyParser.json());

let server = ""
let taskName = ""
let endpoint = ""
if(process.env.k_server){
  server = process.env.k_server
} else {
  console.log("Server (k_server) environment variable not found")
  process.exit(0)
}
if(process.env.k_task){
  taskName = process.env.k_task
} else {
  console.log("Kapacitor (k_taskName) task environment variable not found")
  process.exit(0)
}
if(process.env.k_endpoint){
  endpoint = process.env.k_endpoint
} else {
  console.log("Endpoint (k_endpoint) environment variable not found")
  process.exit(0)
}

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}



app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.status(200).send('Default response');
  res.end();
});

app.all('/search', function(req, res){
  //This endpoint searches and finds the tags which can be used for series
  console.log("Accessing /search endpoint")
  setCORSHeaders(res);
  let result = [];
  fetch(`http://${server}/kapacitor/v1/tasks/${taskName}/${endpoint}`)
  .then(response => response.json())
  .then(function(responseData) {
    _.each(responseData.series, (series) => {
        console.log(series.tags);
        result.push(series.tags['cpu'])
    })
    result.push('All')
    res.json(result);
    res.end();
  })

});

// app.all('/annotations', function(req, res) {
//   setCORSHeaders(res);
//   console.log(req.url);
//   console.log(req.body);
//
//   res.json(annotations);
//   res.end();
// });

app.all('/query', function(req, res){
  // This endpoint gets the data
  setCORSHeaders(res);
  console.log("Accessing /query endpoint")
  var tsResult = [];
  fetch(`http://${server}/kapacitor/v1/tasks/${taskName}/${endpoint}`)
  .then(response => response.json())
  .then(function(responseData) {
    _.each(req.body.targets, function(target) {
      if(target.target != 'All') {
        var targetData = _.filter(responseData.series, function(t) {
          return t.tags['cpu'] === target.target;
        });
        _.each(targetData, function(data) {
          let temp = {}

          temp['target'] = data.tags['cpu']
          _.map(data.values, (val) =>{
            //getting date, value but we need value, date
            let newtemp = val[1]
            val[1] = new Date(val[0]).getTime();
            val[0] = newtemp
          })
          temp['datapoints'] = data.values
          tsResult.push(temp)
        });
      } else {
        console.log("selecting all data")
        // All is selected so send all series
        _.each(responseData.series, function(data) {
          let temp = {}

          temp['target'] = data.tags['cpu']
          _.map(data.values, (val) =>{
            //getting date, value but we need value, date
            let newtemp = val[1]
            val[1] = new Date(val[0]).getTime();
            val[0] = newtemp
          })
          temp['datapoints'] = data.values
          tsResult.push(temp)
        })
      }
      })
    res.json(tsResult);
    res.end();
  })

});

// app.all('/tag[\-]keys', function(req, res) {
//   setCORSHeaders(res);
//   console.log(req.url);
//   console.log(req.body);
//
//   res.json(tagKeys);
//   res.end();
// });
//
// app.all('/tag[\-]values', function(req, res) {
//   setCORSHeaders(res);
//   console.log(req.url);
//   console.log(req.body);
//
//   if (req.body.key == 'City') {
//     res.json(cityTagValues);
//   } else if (req.body.key == 'Country') {
//     res.json(countryTagValues);
//   }
//   res.end();
// });

app.listen(3333);

console.log("Server is listening to port 3333");
