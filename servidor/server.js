// obligatorio
require('dotenv').config()
const cors = require("cors")
const express = require("express");
const mongoose = require("mongoose");

const dataClientRouter = require("./routes/router")
const prefixRouter = require("./routes/routerPrefix")

const app = express();
const port = process.env.PORT || 3000

app.use(express.json());
app.use(cors())

app.use("/emails", dataClientRouter)
app.use("/prefix", prefixRouter)


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to BBDD"))
  .catch(error => console.log("Error trying to connect to BBDD:", error))

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
});