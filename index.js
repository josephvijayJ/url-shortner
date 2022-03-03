const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'Hlk013mlhf';
// const URL = "mongodb://localhost:27017";
const URL =
  'mongodb+srv://Jose:Joseph123!@josephcluster.sasww.mongodb.net/retryWrites=true&w=majority';
//mongodb+srv://shortener:url@cluster0.jjyk2.mongodb.net?retryWrites=true&w=majority

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());

let authenticate = function (req, res, next) {
  if (req.headers.authorization) {
    try {
      let verifyResult = jwt.verify(req.headers.authorization, secret);
      next();
    } catch (error) {
      res.status(401).json({ message: ' Token Invalid' });
    }
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
};

// Create the URL

app.post('/create-url', async (req, res) => {
  try {
    //Create the short URL
    let connection = await MongoClient.connect(URL);
    let db = connection.db('UrlShortener');
    await db.collection('ProjectUser').insertOne({
      longUrl: req.body.longUrl,
      shortUrl: generateUrl(),
    });

    await connection.close();
    res.json({ message: 'URL added' });
  } catch (error) {
    console.log(error);
  }
});

//generate the URl

function generateUrl() {
  var randomResult = [];
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < 5; i++) {
    randomResult += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return randomResult;
}

//Get the Url
app.get('/get-url', async (req, res) => {
  try {
    let connection = await MongoClient.connect(URL);
    let db = connection.db('UrlShortener');
    let url = await db.collection('ProjectUser').find({}).toArray();
    await connection.close();
    res.json(url);
  } catch (error) {
    console.log(error);
  }
});

app.get('/user', async (req, res) => {
  try {
    // connect the database
    let connection = await MongoClient.connect(URL);
    //select DB
    let db = connection.db('UrlShortener');
    //select collection
    //DO any operation
    let users = await db.collection('users').find({}).toArray();
    //close the connection
    await connection.close();
    // message for Api is worked or not
    res.json(users);
  } catch (error) {
    console.log(error);
  }
  // res.json(UserList)
});

app.get('/Url-shortener', authenticate, function (req, res) {
  res.json({ totalUsers: 20 });
});

// delete method to delete the data from API

app.delete('/url/:id', async function (req, res) {
  try {
    let connection = await MongoClient.connect(URL);
    let db = connection.db('UrlShortener');
    let objId = mongodb.ObjectId(req.params.id);
    await db.collection('ProjectUser').deleteOne({ _id: objId });
    await connection.close();
    res.json({ message: 'User Deleted' });
  } catch (error) {
    console.log(error);
  }
});

//Registration form

app.post('/register', async function (req, res) {
  try {
    let connection = await MongoClient.connect(URL);
    let db = connection.db('UrlShortener');
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;

    await db.collection('users').insertOne(req.body);
    connection.close();
    res.json({ message: 'Customer Registered' });
  } catch (error) {
    console.log(error);
  }
});

// Login Form
app.post('/login', async function (req, res) {
  try {
    let connection = await MongoClient.connect(URL);
    let db = connection.db('UrlShortener');
    let user = await db.collection('users').findOne({ email: req.body.email });

    //If user is present allow then won't allow

    if (user) {
      let userVerify = await bcrypt.compare(req.body.password, user.password);
      if (userVerify) {
        let token = jwt.sign({ userid: user._id }, secret, { expiresIn: '2h' });
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Email or Password do not Correct  ' });
      }
    } else {
      res.status(401).json({ message: 'Email or Password do not Correct' });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('connected to server');
});
