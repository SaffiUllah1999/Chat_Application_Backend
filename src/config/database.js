const mongoose = require('mongoose');

// const connectionParams = {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true
// }

// main().then(res => console.log("db connected successfully...!!!"))
// main().catch(err => console.log(err));


// async function main() {
//   await mongoose.connect('mongodb+srv://saffiullah1911:123@cluster0.zzrq5.mongodb.net/?retryWrites=true&w=majority');
// }
// const uri = 'mongodb+srv:saffiullah1911:123@cluster0.zzrq5.mongodb.net/?retryWrites=true&w=majority'
// const connection = mongoose.connect(uri, connectionParams).then(() => console.log('connected to cloud atlas')).catch((err) => console.log("!=FAILED"));

// module.exports = connection;
mongoose.connect('Your Link', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.warn("DB Successfully Connected !!")).catch((err) => console.warn(err));
// client.connect(err => {
//   const collection = client.db("CRUD").collection("users");
//   // perform actions on the collection object

// });
