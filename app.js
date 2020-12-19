const express = require("express");
const app = express();
const fileupload = require("express-fileupload");
// const myList = [1, 4, 5, 1, 2, 4, 5, 6, 7];
// const unique = [...new Set(myList)];

// console.log(unique);
app.set("view engine", "ejs");
app.set("views", "views");
app.use(fileupload());
const homepageroute = require("./routes/homeroute");

app.use(homepageroute);

app.listen(3000, () => console.log("listening"));
