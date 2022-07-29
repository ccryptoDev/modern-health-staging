/* eslint-disable guard-for-in */
"use strict";

process.env.TZ = "UTC";

const MongoClient = require( "../node_modules/mongodb" ).MongoClient;
const dbURI = "mongodb://localhost:27017";
const dbName = "modern-health";
let dbClient;

MongoClient.connect( dbURI, { useNewUrlParser: true }  )
.then( ( client ) => {
	dbClient = client;
	const db = client.db( dbName );

	return db.collection( "practicemanagement" )
  .update( { ContactName: "Pompeii Surgical" }, {$set:{ LinkForm: "https://bit.ly/PompeiiSurgical" } })
	.then( ( ) => {
    console.log('UPDAYED')
  })
} )
.finally( () => {
	dbClient.close();
} );
