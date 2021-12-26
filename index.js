const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.razkq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log('database connected');
    const database = client.db('g-store');
    const usersCollection = database.collection('users');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');

    // POST API for users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // POST user for  google sign in
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // api for getting admin info
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //  UPDATE PUT API for admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log(user.email);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // POST Product API
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
    // get products
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });
    // get specific product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // POST order API
    app.post('/orders', async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await ordersCollection.insertOne(product);
      res.json(result);
    });

    // GET MY ORDER
    app.get('/myorders', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();

      res.send(orders);
    });
    // get products
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    // DELETE ORDERS
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // UPDATE status API
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      // const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'shifted',
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      console.log(result)
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('G store server running');
});

app.listen(port, () => {
  console.log(`port running at`, port);
});
