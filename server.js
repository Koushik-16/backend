// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
require('dotenv').config();
const port = 3001; // Or any other port you prefer
const { google } = require('googleapis');
const { error } = require('autoprefixer/lib/utils');
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
  }));

  
  
// Middleware to parse JSON requests
app.use(express.json());

const apikey = process.env.APIKEY;
// POST endpoint to receive locations and optimize route
app.post('/',  async(req, res) => {
  try {
   const data  = req.body.markers;
   const n = data.length;
  
  
   const r =  await callApi(data , n);
    console.log(r);
  
   
   

  
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 async function callApi(data , n) {
  let graph = [];
  for(let i = 0 ; i < n ; i++) {
   for(let j = 0; j < n ; j++) {
     graph[i] = [];
     if(i !== j) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${data[i].lat},${data[i].lng}&destinations=${data[j].lat},${data[j].lng}&key=${apikey}`;
       await axios.get(url)
    .then(response => {
    graph[i][j] =  response.data.rows[0].elements[0].distance.text;

    }).catch(error => {
      console.error(error);
      throw new Error('Error fetching distance data');
    })  ;
  }else graph[i][j] = 0;

   }
 }
return graph;
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
});