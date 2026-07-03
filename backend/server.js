const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/dashboard", (req, res) => {
  res.json({
    cards: [
      {
        title: "Total Users",
        value: Math.floor(Math.random() * 1000 + 1000).toString(),
      },
      {
        title: "Total Tasks",
        value: Math.floor(Math.random() * 30 + 1).toString(),
      },
      {
        title: "Pending Requests",
        value: Math.floor(Math.random() * 10 + 1).toString(),
      },
    ],
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});