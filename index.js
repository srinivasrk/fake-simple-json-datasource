var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var fetch = require("node-fetch");

app.use(bodyParser.json());


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
  setCORSHeaders(res);
  let result = [];
  fetch('http://159.203.167.38:9092/kapacitor/v1/tasks/cpu_stream_dump/data')
  .then(response => response.json())
  .then(function(responseData) {
    _.each(responseData.series, (series) => {
        console.log(series.tags);
        result.push(series.tags['cpu'])
    })
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

  setCORSHeaders(res);
  console.log(req.body.targets)
  var tsResult = [];
  fetch('http://159.203.167.38:9092/kapacitor/v1/tasks/cpu_stream_dump/data')
  .then(response => response.json())
  .then(function(responseData) {
    _.each(req.body.targets, function(target) {

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
    })
    console.log(tsResult)
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
