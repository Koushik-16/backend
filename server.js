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
   const warehouse  = req.body.markers;
   const riders = req.body.rider;
   const users = req.body.users;
   const wtu = await findwtu(warehouse , users) ;
   const rtw = await findrtw(riders , warehouse);
    let dis = Number.MAX_SAFE_INTEGER;
    let w ;
    let u;
    let r;
   for(let i =0; i < rtw.length ; i++) {
    for(let j = 0 ; j < wtu.length ; j++) {
      for(let k =0 ; k < wtu[0].length ; k++) {
          let curr = rtw[i][j] + wtu[j][k];
          if(curr < dis) {
            dis = curr;
            w = j;
            r = i;
            u = k;
          }
      }
    }
   }


   let locations = [];
   locations.push(users[u]);
   for(let i= 0 ;i < users.length ; i++) {
    if(users[i] === users[u]) continue;
    else locations.push(users[i]);
   }
   let n = locations.length;
   const utu = await callApi(locations , n);
   const [path , distance] =   geneticAlgorithm(utu , n * 10 ,n * 20 , 4, 0.8 , 0.2 );
   let anspath = [];
   anspath.push(riders[r]);
   anspath.push(warehouse[w]);
   for(let i = 0 ; i < path.length ; i++) {
    anspath.push(locations[path[i]]);
   }
    console.log(dis);
    console.log(distance);
   let ansdis = dis + distance;
   console.log(ansdis);

   
 
   res.json({anspath , ansdis});

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function findwtu(warehouse , users) {
  let graph = Array.from(Array(warehouse.length), () => new Array(users.length));
  for(let i = 0 ; i < warehouse.length ; i++) {
    for(let j = 0; j < users.length ; j++) { 
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${warehouse[i].lat},${warehouse[i].lng}&destinations=${users[j].lat},${users[j].lng}&key=${apikey}`;
      await axios.get(url)
    .then(async (response) => {
     const dis =  response.data.rows[0].elements[0].distance.text;
     graph[i][j] = parseInt(dis.replace(/\D/g, ''), 10);
    
    }).catch(error => {
      console.error(error);
      throw new Error('Error fetching distance data');
    })  ;

    return graph;

    }
  }
}


async function findrtw(riders , warehouse) {
  let graph = Array.from(Array(riders.length), () => new Array(warehouse.length));
  for(let i = 0 ; i < riders.length ; i++) {
    for(let j = 0; j < warehouse.length ; j++) { 
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${riders[i].lat},${riders[i].lng}&destinations=${warehouse[j].lat},${warehouse[j].lng}&key=${apikey}`;
      await axios.get(url)
    .then(async (response) => {
     const dis =  response.data.rows[0].elements[0].distance.text;
     graph[i][j] = parseInt(dis.replace(/\D/g, ''), 10);
    
    }).catch(error => {
      console.error(error);
      throw new Error('Error fetching distance data');
    })  ;

    return graph;

    }
  }
}


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
