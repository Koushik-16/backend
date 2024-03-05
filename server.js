// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
require('dotenv').config();
const port = 3001; // Or any other port you prefer
const { google } = require('googleapis');
const geneticAlgorithm = require('./genetic');



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
  const [path , distance] =   geneticAlgorithm(r , n * 10 ,n * 20 , 4, 0.8 , 0.2 );
  const bestpath = [];
  for(let i= 0 ;i < n ; i++){
    bestpath.push(data[path[i]]);
  }

  
   res.json({bestpath , distance});

  
   
   

  
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 async function callApi(data , n) {
  let graph = Array.from(Array(n), () => new Array(n));
  for(let i = 0 ; i < n ; i++) {
   for(let j = 0; j < n ; j++) {
     
     if(i !== j && j > i) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${data[i].lat},${data[i].lng}&destinations=${data[j].lat},${data[j].lng}&key=${apikey}`;
       await axios.get(url)
    .then(async (response) => {
     const dis =  response.data.rows[0].elements[0].distance.text;
     graph[i][j] = parseInt(dis.replace(/\D/g, ''), 10);
    
    }).catch(error => {
      console.error(error);
      throw new Error('Error fetching distance data');
    })  ;
  }else if(i ===j ) graph[i][j] = 0;

  else {
    graph[i][j] = graph[j][i];
  }

   }
 }
//  console.log(graph);
return graph;
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
});
