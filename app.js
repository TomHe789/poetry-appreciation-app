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
  multipleStatements: true,
});

connection.connect();

// 用户登录校验
app.post("/isAuthLogin", function (req, res) {
  let { username, password } = req.body;
  let successRes = { code: 1, msg: "登录成功" };
  let failedRes = { code: -1, msg: "登录失败" };
  console.log(username, password);
  isAuthLogin(username, password, (str) => {
    if (str) {
      res.send(successRes);
    } else {
      res.send(failedRes);
    }
  });
});

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

// 根据访问量排序诗词
app.get("/getPoetryRatings", (req, res) => {
  // 获取请求参数
  let { currentPage, pageSize } = req.query;
  getPoetryRateings(currentPage, pageSize, (str) => {
    res.send(str);
  });
});

// 模糊查询诗词名称接口
app.get("/getPoetryFuzzyQuery", (req, res) => {
  // 获取查询关键字
  let { keyword } = req.query;
  fuzzyQueryPoetry(keyword, (str) => {
    res.send(str);
  });
});

// 获取用户留言
app.get("/getUserMessage", (req, res) => {
  // 获取查询关键字
  getUserMessage((str) => {
    res.send(str);
  });
});

// 新增用户留言
app.post("/addUserMessage", (req, res) => {
  let { content, author, time, poetry_title } = req.body;
  console.log(content, author, time, poetry_title);
  addUserMessage(content, author, time, poetry_title, (str) => {
    res.send(str);
  });
});

// connection.end();

// 登录校验
function isAuthLogin(username, password, callback) {
  let addSql = `SELECT password FROM user_info WHERE username = "${username}"`;
  let str = false;
  // 通过sql查询密码
  connection.query(addSql, function (err, result) {
    if (err) {
      console.log("[INSERT ERROR] - ", err.message);
    }
    // 校验数据库查询出的密码与用户输入的密码是否一致
    if (result.length > 0 && result[0].password === password) {
      str = true;
    }
    callback(str);
  });
}

// 获取用户信息
function getUserInfo(callback) {
  let sql = "SELECT * FROM user_info";
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    } else {
      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 用户注册
function userRegist(username, password, callback) {
  let str = true;
  let addSql = `INSERT INTO user_info (username, password) VALUES ("${username}", ${password})`;
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
    } else {
      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 根据id查询诗词内容
function getPoetryContent(poetryId, callback) {
  let sql1 = `SELECT * FROM poetry_info WHERE id = ${poetryId};`;
  let sql2 = `UPDATE poetry_info set views=views+1 WHERE id = ${poetryId};`;
  let str = "";

  connection.query(sql1, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    } else {
      // 诗词点击量+1
      connection.query(sql2, function (err) {
        if (err) {
          console.log("[SELECT ERROR]：", err.message);
        } else {
          console.log(`${poetryId}号 访问量增加1`);
        }
      });

      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 分页排序查询诗词信息 根据访问量进行排序
function getPoetryRateings(currentPage, pageSize, callback) {
  let m = (currentPage - 1) * pageSize;
  let n = pageSize;
  // 先降序排序 后分页查询
  let sql = `SELECT * from poetry_info ORDER BY views DESC, id ASC LIMIT ${m}, ${n};`;
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    } else {
      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 模糊查询诗词接口
function fuzzyQueryPoetry(keyword, callback) {
  let sql = `SELECT * from poetry_info WHERE title like "%${keyword}%";`;
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    } else {
      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 获取用户留言
function getUserMessage(callback) {
  let sql = "SELECT * FROM note_info";
  let str = "";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR]：", err.message);
    } else {
      str = JSON.stringify(result);
      console.log(result);
      callback(str);
    }
  });
}

// 用户新增留言
function addUserMessage(content, author, time, poetry_title, callback) {
  let str = true;
  let addSql = `INSERT INTO note_info (content, author, time, poetry_title) VALUES ("${content}", "${author}", '${time}', "${poetry_title}");`;
  connection.query(addSql, function (err, result) {
    if (err) {
      console.log("[INSERT ERROR] - ", err.message);
      str = false;
    }
    callback(str);
  });
}

// 监听服务器端口号 开启服务
app.listen(3000, function () {
  console.log("server runing at 3000 port");
});
