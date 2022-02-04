let express = require("express");
let bodyParser = require("body-parser");
let mysql = require("mysql");
const res = require("express/lib/response");
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "heyi",
  database: "poetry_apprication",
});

connection.connect();

// 获取用户信息
app.get("/getUserInfo", function (req, res) {
  getUserInfo((str) => {
    res.send(str);
  });
});

// 用户注册接口
app.post("/userRegist", function (req, res) {
  let { username, password } = req.body;
  console.log(username, password);
  userRegist(username, password, (str) => {
    res.send(str);
  });
});

// 获取诗词信息
app.get("/getPoetryInfo", function (req, res) {
  // 获取请求参数
  let { currentPage, pageSize } = req.query;
  getPoetryInfo(currentPage, pageSize, (str) => {
    res.send(str);
  });
});

// 根据id查询诗词内容
app.get("/getPoetryContent", (req, res) => {
  // 获取请求参数
  let { poetryId } = req.query;
  getPoetryContent(poetryId, (str) => {
    res.send(str);
  });
});

// connection.end();

// 获取用户信息
function getUserInfo(callback) {
  let sql = "SELECT * FROM user_info";
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    }
    str = JSON.stringify(result);
    console.log(result);
    callback(str);
  });
}

// 用户注册
function userRegist(username, password, callback) {
  let str = true;
  let addSql = `INSERT INTO user_info (username, password) VALUES (${username}, ${password})`;
  connection.query(addSql, function (err, result) {
    if (err) {
      console.log("[INSERT ERROR] - ", err.message);
      str = false;
    }
    callback(str);
  });
}

// 获取诗词信息 分页查询 currentPage pageSize
function getPoetryInfo(currentPage, pageSize, callback) {
  let m = (currentPage - 1) * pageSize;
  let n = pageSize;
  // 分页查询 去掉前m条 返回后n条

  let sql = `SELECT * FROM poetry_info ORDER BY id LIMIT ${m}, ${n};`;
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    }
    str = JSON.stringify(result);
    console.log(result);
    callback(str);
  });
}

// 根据id查询诗词内容
function getPoetryContent(poetryId, callback) {
  let sql = `SELECT * FROM poetry_info WHERE id = ${poetryId};`;
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    }
    str = JSON.stringify(result);
    console.log(result);
    callback(str);
  });
}

// 监听服务器端口号 开启服务
app.listen(3000, function () {
  console.log("server runing at 30000 port");
});
