const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('customer'));
app.use(fileUpload());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adps5.mongodb.net/${process.env_NAME}?retryWrites=true&w=majority`;


console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS)



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  console.log(err)
  const customerCollection = client.db("creativeAgency").collection("clients");
  const ProductsCollection = client.db("creativeAgency").collection("products");
  const PortfolioCollection = client.db("creativeAgency").collection("portfolio");
  const feedbackCollection = client.db("creativeAgency").collection("feedback");
  const adminCollection = client.db("creativeAgency").collection("admin");

  // ==add user order==
  app.post('/addOrder', (req, res) => {
    const newEvents = req.body;
    customerCollection.insertOne(newEvents)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newEvents);
  })





  // for admin
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    console.log('email', email)
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin);
            
        })
})
  



  // ====add admin email====
  app.post('/addAdminEmail', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
        console.log(req.body);
    })
  })
  // ============


  //=== user orders====
  app.get('/allOrders', (req, res) => {
    customerCollection.find({email: req.query.email})
    .toArray((error, documents) => {
      res.send(documents);
    })
  })

  // ==== ALL USER ORDER FOR ADMIN ====

  app.get('/addOrdersForAdmin', (req, res) => {
    customerCollection.find({})
      .toArray((error, documents) => {
        res.send(documents);
        console.log(documents);
        console.log(error);
    })
  })
      
  // ====add services====
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const details = req.body.details;
    console.log(file, name, details, price);
    const filePath = `${__dirname}/customer/${file.name}`
    file.mv(filePath, error => {
      if (error) {
        
        console.log(error);
         res.status(500).send({ msg: 'Failed to upload Image' });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      
      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      
      ProductsCollection.insertOne({ name, details, image, price })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(error);
              res.status(500).send({ msg: 'Failed to upload Image' });
              
          }
          res.send(result.insertedCount > 0);
        })
      })
    })
 
  })


  /


  // ====show services on home page====
  app.get('/services', (req, res) => {
    ProductsCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
          console.log(documents)
        })
});


// ====add reviews====
  app.post('/review', (req, res) => {
    const review = req.body;
    feedbackCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(review);
  })

  // ====show reviews on home page=====
  app.get('/feedback', (req, res) => {
    feedbackCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
        console.log(documents);
    })
  })


  // portfolio carosuel

  app.get('/portfolio', (req, res) => {
    PortfolioCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
    })
  })

  

});


app.get('/', (req, res) => {
  res.send('Hello i am working')
})



app.listen(process.env.PORT || port);