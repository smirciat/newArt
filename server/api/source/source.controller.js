/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/sources              ->  index
 * POST    /api/sources              ->  create
 * GET     /api/sources/:id          ->  show
 * PUT     /api/sources/:id          ->  update
 * DELETE  /api/sources/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import fs from 'fs';
import localEnv from '../../config/local.env.js';
const axios = require("axios");
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
let Bearer='';
import {Source} from '../../sqldb';const admin = require('firebase-admin');
const serviceAccount = require('../../firebase.json');
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firebase_db = admin.firestore();
let timestamp;

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    if(entity) {
      return entity.updateAttributes(updates)
        .then(updated => {
          return updated;
        });
    }
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Sources
export function index(req, res) {
  return Source.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Source from the DB
export function show(req, res) {
  return Source.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Source in the DB
export function create(req, res) {
  return Source.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Source in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Source.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Source from the DB
export function destroy(req, res) {
  return Source.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

async function createDocument(collection,object,uniqueId){
  const docRef = firebase_db.collection(collection).doc(uniqueId);//need this to be unique and readable from TF

   docRef.set(object)
   .then(() => {
     console.log('Document created successfully!');
   })
   .catch((error) => {
     console.error('Error creating document:', error);
   });
}

export async function getCollectionQuery(collectionName,limit,parameter,operator,value,timestampBoolean,parameter2,operator2,value2) {
  try {
    for (let s of [collectionName,limit,parameter,operator,value,timestampBoolean]){
      //console.log(s);
    }
    if (timestampBoolean) {
      value=admin.firestore.Timestamp.fromDate(new Date(value));
      if (value2) value2=admin.firestore.Timestamp.fromDate(new Date(value2));
    }
    const collectionRef = firebase_db.collection(collectionName);
    let date1,date2,date3;
    let querySnapshot, querySnapshot1, querySnapshot2;
    if (!value2) querySnapshot = await collectionRef.where(parameter, operator , value).orderBy('date', 'desc').limit(limit).get();
    else querySnapshot = await collectionRef.where(parameter, operator , value).where(parameter2, operator2 , value2).orderBy('date', 'desc').limit(limit).get();
    if (parameter==="false"){//"dateString")  {//this is currently bypassed
      date3=new Date(value);
      date2=new Date(value);
      date1=new Date(value);
      date2.setDate(date2.getDate() - 1);
      date1.setDate(date1.getDate() - 2);
      date2=date2.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      date1=date1.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      querySnapshot1 = await collectionRef.where(parameter, operator , date1).orderBy('date', 'desc').limit(limit).get();
      querySnapshot2 = await collectionRef.where(parameter, operator , date2).orderBy('date', 'desc').limit(limit).get();
    }
    let mergedData=[];
    if (querySnapshot1){
      querySnapshot1.forEach((doc1) => {
        mergedData.push(doc1);
        //console.log(doc.id, '=>', doc.data());
      });
    }
    if (querySnapshot2){
      querySnapshot2.forEach((doc2) => {
        mergedData.push(doc2);
        //console.log(doc.id, '=>', doc.data());
      });
    }
    querySnapshot.forEach((doc) => {
      mergedData.push(doc);
      //console.log(doc.id, '=>', doc.data());
    });
    return mergedData;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

export async function getCollectionLimited(collectionName,limit) {
  try {
    const collectionRef = firebase_db.collection(collectionName);
    const querySnapshot = await collectionRef.orderBy('date', 'desc').limit(limit).get();

    querySnapshot.forEach((doc) => {
      //console.log(doc.id, '=>', doc.data());
    });
    return querySnapshot;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

async function getCollection(collectionName) {
  try {
    const collectionRef = firebase_db.collection(collectionName);
    const querySnapshot = await collectionRef.get();

    querySnapshot.forEach((doc) => {
      //console.log(doc.id, '=>', doc.data());
    });
    return querySnapshot;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

async function updateDocument(collection,docId,data) {
   const docRef = firebase_db.collection(collection).doc(docId);
   try {
     await docRef.update(data);
     console.log('Document successfully updated!');
     return true;
   } catch (error) {
     console.error('Error updating document:', error);
     return false;
   }
}

function collectionToArray(result){
  let array=[];
  result.forEach(doc=>{
    let obj=doc.data();
    obj._id=doc.id;
    array.push(obj);
  });
  return array;
}

function dateFormat(date){
  let d=new Date();
  if (date) d=new Date(date);
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let day = String(d.getDate()).padStart(2, '0');
  let year = String(d.getFullYear()).slice(-2);
  return month+'/'+day+'/'+year;
}

export async function firebaseQuery(req,res){
  let collection=req.body.collection||'flights';
  let limit=req.body.limit||200;
  let parameter=req.body.parameter||'dateString';
  let operator=req.body.operator||'==';
  let value=dateFormat(req.body.value);
  let timestampBoolean=req.body.timestampBoolean||false;
  const result=await getCollectionQuery(collection,limit,parameter,operator,value,timestampBoolean,req.body.parameter2,req.body.operator2,req.body.value2);
  let array=collectionToArray(result);
  //console.log(array);
  res.status(200).json(array);
}

async function setBearer(){
  let response=await axios(config);
  Bearer=response.data.access_token;
}

async function getTFFlight(body){
  let flightNum=body.flightNum||'850';
  let timestamp='2025-04-10T00:00:00';
  if (body.date){
    timestamp=new Date(body.date);
    timestamp.setHours(0, 0, 0, 0);
    timestamp=timestamp.toISOString();
  }
  let config2 = {
    method: 'get',
    url: 'https://api.tflite.com/manifests/'+timestamp+'/'+flightNum+'/:departureAirport',
    headers: { 
      'Accept': 'application/json', 
      'api-version': 'v1', 
      'Authorization': 'Bearer '+Bearer
    }
  };
  try {
    let response=await axios(config2);
    return response.data;
  }
  catch(err){
    console.log(err.response.data||err.response||err);
    await setBearer();
    if (err.response&&err.response.data&&err.response.data.statusCode===401) {
      try{ 
        let res=await getTFFlight(body);
        if (res) return res;
      }
      catch(err){
        console.log(err);
        return err.response||err;
      }
    }
    return err.response||err;
  }
}

export async function tfFlight(req,res){
  try{
    let array=await getTFFlight(req.body||{});
    res.status(200).json(array);
  }
  catch(err){
    res.status(500).json(err);
  }
}

async function getTFFlights(body){
  let timestamp='2025-04-10T00:00:00';
  let timestamp2='2025-04-11T00:00:00';
  if (body.date){
    timestamp=new Date(body.date);
    timestamp.setHours(0, 0, 0, 0);
    let date=new Date(timestamp);
    timestamp=timestamp.toISOString();
    timestamp2=date.setDate(date.getDate() + 1);
    timestamp2=new Date(timestamp2);
    timestamp2.setHours(0, 0, 0, 0);
    timestamp2=timestamp2.toISOString();
  }
  let config2 = {
    method: 'get',
    url: 'https://api.tflite.com/manifests?departureDate.gte='+timestamp+'&departureDate.lte='+timestamp2,
    headers: { 
      'Accept': 'application/json', 
      'api-version': 'v1', 
      'Authorization': 'Bearer '+Bearer
    }
  };
  try {
    let response=await axios(config2);
    return response.data;
  }
  catch(err){
    console.log(err.response.data||err.response||err);
    await setBearer();
    if (err.response&&err.response.data&&err.response.data.statusCode===401) {
      try{ 
        let res=await getTFFlights(body);
        if (res) return res;
      }
      catch(err){
        console.log(err);
        return err.response||err;
      }
    }
    return err.response||err;
  }
}

export async function tfFlights(req,res){
  try{
    let array=await getTFFlights(req.body||{});
    res.status(200).json(array);
  }
  catch(err){
    res.status(500).json(err);
  }
}

export async function collection(req,res){
  try{
    let array=await getCollection(req.body.collection||'aircraft');
    res.status(200).json(collectionToArray(array));
  }
  catch(err){
    res.status(500).json(err);
  }
}