# what does it do ?

This nodejs application will read the kapacitor endpoint and parses the data for grafana input

# how do I run this?

Once the task is defined in kapacitor and the endpoint is emitting JSON data configure these env variables

```
k_server=<serverip>:9092
k_task=<taskname as defined by kapacitor>
k_endpoint=<httpOutNode>
```

to start the server runs on port 3333

```
npm install
node index.js
```


Also created a docker image here:

https://hub.docker.com/r/srini92/grafanafakedatasource/
