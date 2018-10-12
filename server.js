const express = require("express");
const path = require("path");

const app = express();
app.use("/-", express.static("static"));
app.get('/favicon.ico', function(req, res) {
  res.send("");
})
app.get("/", sendApp);
app.get("/:src/:dest", sendApp);

function sendApp(req, res) {
  res.sendFile(path.join(__dirname, "app.html"));
}

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("server started");
});
