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
  let result = ['cpu-total', 'cpu0', 'cpu1', 'cpu2', 'cpu3', 'cpu4', 'cpu5']
  res.json(result);
  res.end();
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

  var tsResult = [];
  fetch('http://159.203.167.38:9092/kapacitor/v1/tasks/cpu_stream_dump/data')
  .then(res => res.json())
  .then(function(responseData) {

    _.each(req.body.targets, function(target) {

      var k = _.filter(responseData.series, function(t) {
        return t.tags['cpu'] === target.target;
      });
      _.each(k, function(kk) {
        let temp = {}
        temp['target'] = kk.tags['cpu']
        _.map(kk.values, (val) =>{
          val[0] = new Date(val[0]).getTime();
        })
        temp['datapoints'] = kk.values
        tsResult.push(temp)
      });


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
