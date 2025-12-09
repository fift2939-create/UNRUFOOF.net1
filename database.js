const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://nabel:abo12345abo@cluster0.af3mbhx.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  if (db) return db;
  console.log("Attempting to connect to MongoDB Atlas...");
  try {
    await client.connect();
    console.log("MongoDB client connected.");
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    db = client.db("rufoof");
    return db;
  } catch (err) {
    console.error("--- MONGODB CONNECTION FAILED ---");
    console.error(err);
    console.error("--- PLEASE CHECK YOUR CONNECTION STRING, PASSWORD, AND IP WHITELIST IN MONGODB ATLAS ---");
    process.exit(1);
  }
}

function getDB() {
    if (!db) {
        throw new Error('Must connect to DB first');
    }
    return db;
}

module.exports = { connectDB, getDB };
