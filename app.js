let express = require("express");
let bodyParser = require('body-parser')
let mysql = require("mysql");
const res = require("express/lib/response");
let app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));

let connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "heyi",
  database: "poetry_apprication",
});

connection.connect();

app.get("/getUserInfo", function (req, res) {
  getUserInfo((str) => {
    res.send(str)
  })
});

app.post("/userRegist", function(req, res){
  let {username, password} = req.body;
  console.log(username, password)
  userRegist(username, password, (str) => {
    res.send(str)
  });
})

// connection.end();

// 获取用户信息
function getUserInfo(callback){
  let sql = "SELECT * FROM user_info";
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    }
    str = JSON.stringify(result);
    console.log(result);
    callback(str)
  });
}

// 用户注册
function userRegist(username, password, callback){
  let str = true;
  let addSql = `INSERT INTO user_info (username, password) VALUES (${username}, ${password})`;
  connection.query(addSql, function(err, result) {
    if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        str = false;
    }
    callback(str)
  })

}

app.listen(3000, function () {
  console.log("server runing at 30000 port");
});
