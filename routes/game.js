const express = require("express");
const router = express.Router();
const fs = require("fs");

let user = {};

/* GET home page. */
router.get("/", function (req, res, next) {
  fs.readFile("./views/game.html", (err, data) => {
    if (err) {
      res.send("error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }
  });
});

router.post('/', async(req, res) => {
  user = req.body;

  res.redirect('/game');
});

router.get('/user', async(req, res) => {
  
  res.send(user);
});

module.exports = router;
