const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.send('server is up amd running');
});

module.exports = router;