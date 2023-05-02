const express = require('express');
const jwt = require("jsonwebtoken");
var p2p = require('socket.io-p2p-server').Server;
var bodyParser = require('body-parser');
const app = express();
var cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;
const users = require("./src/models/users")
const bcrypt = require("bcrypt");
const socket = require("socket.io")
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }))


require('./src/config/database')
// const user_routes = require('./src/user/users.routes');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const Users = await users.find()
    res.json(Users)
  } catch (err) { res.status(500).send(err) }

})

app.post('/sendMessages', async (req, res) => {
  const EnduserId = req.body.message.send_body[0].Enduser_id;
  try {
    users.findOne({ _id: req.body._id }).then((updatedDocument) => {
      if (updatedDocument) {
        const messages = updatedDocument.message.send_body.filter(item => item.Enduser_id === EnduserId);
        res.status(200).json(messages);
      } else {
        res.status(404).send({ message: " On Loading SendMessages No document found with the specified email" });
      }
    })
  } catch (err) {
    res.status(500).json({ error: "Initial Error" });
  }
});

app.post('/getMessages', async (req, res) => {
  const Sender_Id = req.body.message.send_body[0].Enduser_id;
  try {
    users.findOne({ _id: Sender_Id }).then((updatedDocument) => {
      if (updatedDocument) {

        const messages = updatedDocument.message.send_body.filter(item => (item.Enduser_id === req.body._id));
        res.status(200).json(messages);
      } else {
        res.status(404).send({ message: "No GetMessages document found with the specified email" });
      }
    })
  } catch (err) {
    res.status(500).json({ error: "Initial Error" });
  }
});

app.post('/Get_Messages', async (req, res) => {

  const Array = [];

  const EnduserId = req.body.message.send_body[0].Enduser_id;
  const Sender_Id = req.body.message.send_body[0].Enduser_id;

  try {

    //Send_Messages
    users.find(
      {
        $or: [
          { _id: req.body._id },
          { _id: EnduserId }
        ]
      }
    ).then((updatedDocument) => {

      console.log("------------------")
      console.log(updatedDocument)
      console.log("------------------")

      if (updatedDocument) {

        updatedDocument.filter((item) => {
          const messages_received = item.message.send_body.filter((value) => (value.Enduser_id === EnduserId))
          console.log("---------+++-+--------")
          console.log(JSON.stringify(messages_received))
          Array.push(messages_received)
          console.log("---------+++++---------")
        })
        updatedDocument.filter((item) => {
          item.message.send_body.filter((value) => { (value.Enduser_id === EnduserId) ? (value.receiver = false) && (value.sender = true) : "" })
        })

        updatedDocument.filter((item) => {
          const messages_send = item.message.send_body.filter((value) => (value.Enduser_id === req.body._id))
          console.log("---------+++-+--------")
          console.log(JSON.stringify(messages_send))
          Array.push(messages_send)
          console.log("---------+++++---------")
        })

        updatedDocument.filter((item) => {
          item.message.send_body.filter((value) => { (value.Enduser_id === req.body._id) ? (value.receiver = true) && (value.sender = false) : "" })

        })
        const Array_1 = Array.flat().sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        })

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        console.log(Array_1);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        res.status(200).json(Array_1)
      }

      //  else {
      //   res.status(404).send({ message: " On Loading SendMessages No document found with the specified email" });
      // }
    })
  } catch (e) { }
})

app.post("/register", (request, response) => {

  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const User = new users({
        email: request.body.email,
        password: hashedPassword,
        message: {
          send_body: [{ body: '', Enduser_id: '', sender: false, receiver: false }]
        }
      });

      // save the new user
      User.save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/message", (request, response) => {
  console.log("-------" + JSON.stringify(request.body.message.send_body[0]))
  const filter = { _id: request.body._id };
  const update = { $push: { "message.send_body": request.body.message.send_body[0] } };

  users.findOneAndUpdate(filter, update)
    .then((updatedDocument) => {
      if (updatedDocument) {
        response.send({ message: "Document updated successfully" });
      } else {
        response.status(404).send({ message: "/message No document found with the specified email" });
      }
    })
    .catch((error) => {
      response.status(500).send({ message: "An error occurred while updating the document", error });
    });
});


// login endpoint

app.post("/login", (request, response) => {

  console.log("Called")
  // check if email exists
  users.findOne({ email: request.body.email })    // if email exists
    .then((users) => {
      // compare the password entered and the hashed password found

      bcrypt.compare(request.body.password, users.password)
        // console.log("User ID :" + users.id)

        // if the passwords match
        .then((passwordCheck) => {
          console.log(passwordCheck)

          // check if password matches

          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token

          const token = jwt.sign(
            {
              userId: users._id,
              userEmail: users.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            Id: users._id,
            email: users.email,
            token,
          });
        })

        // catch error if password does not match

        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.post("/DisplayImage", (request, response) => {
  // console.log("-------" + JSON.stringify(request.body.message.send_body[0]))
  // const filter = { _id: request.body._id };
  // const update = { $push: { "message.send_body": request.body.message.send_body[0] } };

  users.findOne({ _id: request.body._id }).then((updatedDocument) => {
    if (updatedDocument) {
      const Image = updatedDocument.Image
      response.send({ Image });
    } else {
      response.status(404).send({ message: "/message No document found with the specified email" });
    }
  })
    .catch((error) => {
      response.status(500).send({ message: "An error occurred while updating the document", error });
    });
});

app.post("/UpdateImage", (request, response) => {

  const filter = { _id: request.body._id };
  const update = { $set: { "Image": request.body.Image } };

  console.log(request.body._id)

  users.findOneAndUpdate(filter, update).then((updatedDocument) => {
    if (updatedDocument) {
      response.send("Successfully updated");
      console.log(updatedDocument)
      // let Image = updatedDocument.body.Image

    } else {
      console.log("error 404")
      response.status(404).send({ message: "/message No document found with the specified email" });
    }
  })
    .catch((error) => {
      console.log("error in Catch")
      response.status(500).send({ message: "An error occurred while updating the document", error });
    });
});

// app.use('/User', user_routes)

global.onLineUsers = new Map();
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("addUser", (id) => {
    console.log("ID get " + id)
    // onLineUsers.set(id, socket.id)
  });

  socket.on('send_message', (data) => {
    // const Send_User_Socket = onLineUsers.get(data)
    console.log("received message in server side", data)
    io.emit('received_message', data)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});