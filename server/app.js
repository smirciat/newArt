/**
 * Main application file
 */

'use strict';

import express from 'express';
import fs from 'fs';
import localEnv from './config/local.env.js';
import sqldb from './sqldb';
//import http from 'http';
import config from './config/environment';
import https from 'https';
const baseUrl = 'http://localhost:' + config.port;
const axios = require("axios");
const agent = new https.Agent({
    rejectUnauthorized: false
});
var privateKey  = fs.readFileSync(localEnv.KEY, 'utf8');
var certificate = fs.readFileSync(localEnv.CERT, 'utf8');
var credentials = {key: privateKey, cert: certificate};
const bodyParameters = {
   headers: {'Authorization':'Bearer 01960326-6a68-7495-a4bf-e535d007829d'}
};


// Populate databases with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = https.createServer(credentials,app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);

let callbackFunction=()=>{
  return;
  axios.post(baseUrl + '/api/things/pax',{dateString:new Date().toLocaleDateString()}, { httpsAgent: agent })
    .then((response)=>{
      console.log('pax & frt interval going');
    })
    .catch(err=>{console.log(err.response.data)}
  );
};

async function tf(){
  let data = JSON.stringify({
    "client_id": localEnv.TF_ID,
    "client_secret": localEnv.TF_SECRET
  });
  
  
  let config = {
    method: 'post',
    url: 'https://api.tflite.com/authentication/oauth/token',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json',
      'api-version':'v1'
    },
    data : data
  };
  
  
  axios(config)
  .then((response) => {
    //token is response.data.access_token
    let config = {
      method: 'get',
      url: 'https://api.tflite.com/manifests/2025-04-10T00:00:00/850/:departureAirport',
      headers: { 
        'Accept': 'application/json', 
        'api-version': 'v1', 
        'Authorization': 'Bearer '+response.data.access_token
      }
    };
    axios(config).then(res=>{
      console.log((res.data));
    });
    
  })
  .catch((error) => {
    console.log(error);
  });
}

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    //callbackFunction();
    tf();
    return;
    const startDate = '2025-03-01T00:00:00Z';
    const endDate = '2025-03-02T00:00:00Z';//type=shift or type=available or type=???
    axios.get('https://fyccqqeiahhzheubvavn.supabase.co/functions/v1/tenant-api-handler?table=calendar_events&start_plain_date_time='+startDate+'&end_plain_date_time='+endDate+'&type=shift&employee_full_name=Andy Smircich', bodyParameters)
      .then(res=>{
        console.log(res.data.data)
      })
      .catch(err=>{
        console.log(err);
      });
    setInterval(callbackFunction,24*60*60*1000);  
  });
}

sqldb.sequelize.sync()
  .then(startServer)
  .catch(function(err) {
    console.log('Server failed to start due to error: %s', err);
  });

// Expose app
exports = module.exports = app;
