const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const multer = require('multer')
const fs = require('fs')
const readline = require('readline');
const upload = multer({ dest: 'uploads/' })

const app = express();
//const db_name = path.join(__dirname, "data", "apptest.sqlite3");
//const db = new sqlite3.Database(db_name, err => {
const db = new sqlite3.Database("apptest.sqlite3", err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful connection to the database 'apptest.db'");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => { 
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => { 
  var sql_create = `CREATE TABLE IF NOT EXISTS Teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL
    );`;
    
  db.run(sql_create, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of the 'Teams' table");
  });
  sql_create = `CREATE TABLE IF NOT EXISTS Matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    league VARCHAR(100) NOT NULL,
    kind VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    time VARCHAR(100) NOT NULL,
    home INTEGER,
    homescore INTEGER,
    awayscore INTEGER,
    away INTEGER,
    stadium VARCHAR(100) NOT NULL,
    viewers INTEGER,
    broadcasts VARCHAR(100) NOT NULL
  );`;
  db.run(sql_create, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of the 'Matches' table");
  });


  /*
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
    (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
    (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
    (3, 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
  });
  */

  //res.send ("Hello world...");
  res.render("index");
});
app.get("/about", (req, res) => {
    res.render("about");
});
app.get("/data", (req, res) => {
    const test = {
      title: "Test",
      items: ["one", "two", "three"]
    };
    res.render("data", { model: test });
});
app.get("/teams", (req, res) => {
    const sql = "SELECT * FROM Teams ORDER BY id;"
    db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("teams", { model: rows });
    });
});
app.get("/matches", (req, res) => {
  const sql = "SELECT * FROM Matches ORDER BY id;"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("matches", { model: rows });
  });
});
app.get("/teamedit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Teams WHERE id = ?";
    db.get(sql, id, (err, row) => {
      // if (err) ...
      res.render("teamedit", { model: row });
    });
});
app.post("/teamedit/:id", (req, res) => {
    const id = req.params.id;
    const team = [req.body.name, id];
    const sql = "UPDATE Teams SET name = ? WHERE (id = ?)";
    db.run(sql, team, err => {
      // if (err) ...
      res.redirect("/teams");
    });
});
app.get("/matchedit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Matches WHERE id = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    console.log(row);
    res.render("matchedit", { model: row });
  });
});
app.post("/matchedit/:id", (req, res) => {
  const id = req.params.id;
  const match = [req.body.year, req.body.league, req.body.kind, req.body.date, req.body.time, req.body.home, req.body.homescore, req.body.awayscore, req.body.away, req.body.stadium, req.body.viewers, req.body.broadcasts, id];
  const sql = "UPDATE Matches SET year = ?,league = ?,kind = ?,date = ?,time = ?,home = ?,homescore = ?,awayscore = ?,away = ?,stadium = ?,viewers = ?,broadcasts = ? WHERE (id = ?)";
  db.run(sql, match, err => {
    // if (err) ...
    res.redirect("/matches");
  });
});
app.get("/teamcreate", (req, res) => {
    const team = {
      name: " "
    }
    res.render("teamcreate", { model: team });
});
app.post("/teamcreate", (req, res) => {
    const sql = "INSERT INTO teams (name) VALUES (?)";
    const team = [req.body.name];
    db.run(sql, team, err => {
      // if (err) ...
      res.redirect("/teams");
    });
});
app.get("/matchcreate", (req, res) => {
  const match = {}
  res.render("matchcreate", { model: match });
});
app.post("/matchcreate", (req, res) => {
  const sql = "INSERT INTO Matches (year, league, kind, date, time, home, homescore, awayscore, away, stadium, viewers, broadcasts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const match = [req.body.year, req.body.league, req.body.kind, req.body.date, req.body.time, req.body.home, req.body.homescore, req.body.awayscore, req.body.away, req.body.stadium, req.body.viewers, req.body.broadcasts];
  db.run(sql, match, err => {
    if (err){console.log("Insert Error");console.log(err);}
    res.redirect("/matches");
  });
});
app.get("/teamdelete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM teams WHERE id = ?";
    db.get(sql, id, (err, row) => {
      // if (err) ...
      res.render("teamdelete", { model: row });
    });
});
app.post("/teamdelete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM teams WHERE id = ?";
    db.run(sql, id, err => {
      // if (err) ...
      res.redirect("/teams");
    });
});
app.get("/matchdelete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Matches WHERE id = ? ";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    console.log(row);
    res.render("matchdelete", { model: row });
  });
});
app.post("/matchdelete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Matches WHERE id = ? ";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/matches");
  });
});
app.get("/teamshow/:id", (req, res) => {
    const id = req.params.id;
    var matches = 0;
    var wins = 0;
    var loses = 0;
    var draws = 0;
    var gpoints = 0;
    var lpoints = 0;
    var details = {wins:0, loses:0, draws:0};
    var sql = "SELECT COUNT(home = ? or NULL) FROM Matches";

    db.get(sql, id, (err, row) => {
      matches += row["COUNT(home = ? or NULL)"]
    });
    sql = "SELECT COUNT(away = ? or NULL) FROM Matches";
    db.get(sql, id, (err, row) => {
      matches += row["COUNT(away = ? or NULL)"]
    });
    sql = "SELECT COUNT((home = ? or NULL) and (homescore > awayscore or NULL)) FROM Matches";
    db.get(sql, id, (err, row) => {
      console.log(wins)
      wins += parseInt(row["COUNT((home = ? or NULL) and (homescore > awayscore or NULL))"]);
      console.log(parseInt(row["COUNT((home = ? or NULL) and (homescore > awayscore or NULL))"]))
      console.log(wins)
    });
    sql = "SELECT COUNT((away = ? or NULL) and (homescore < awayscore or NULL)) FROM Matches";
    db.get(sql, id, (err, row) => {wins += parseInt(row["COUNT((away = ? or NULL) and (homescore < awayscore or NULL))"]);});
    sql = "SELECT COUNT((home = ? or NULL) and (homescore < awayscore or NULL)) FROM Matches";
    db.get(sql, id, (err, row) => {loses += row["COUNT((home = ? or NULL) and (homescore < awayscore or NULL))"];});
    sql = "SELECT COUNT((away = ? or NULL) and (homescore > awayscore or NULL)) FROM Matches";
    db.get(sql, id, (err, row) => {loses += row["COUNT((away = ? or NULL) and (homescore > awayscore or NULL))"];});
    sql = "SELECT COUNT((home = ? or away = ? or NULL) and (homescore = awayscore or NULL)) FROM Matches";
    db.get(sql, id, (err, row) => {draws += row["COUNT((home = ? or away = ? or NULL) and (homescore = awayscore or NULL))"];});

    details.wins = wins;
    details.loses = loses;
    details.draws = draws;

    console.log(wins)
    console.log(loses)
    console.log(draws)
    console.log(details)

    sql = "SELECT * FROM Teams WHERE id = ?";
    db.get(sql, id, (err, row) => {
      // if (err) ...
      console.log(row)
      res.render("teamshow", { model: row });
    });
});
app.post("/teamshow/:id", (req, res) => {
  res.redirect("/teams");
});
app.post('/teamupload', upload.single('upName'), (req, res) => {
  console.log(`originalname: ${req.file.originalname}`)
  console.log(`path: ${req.file.path}`)

  const rs = fs.createReadStream(req.file.path);
  const rl = readline.createInterface({input: rs, });
  var sql = "";
  rl.on('line', (linestring)=>{
    sql = 'INSERT INTO Teams (name) VALUES ('+linestring+')';
    db.run(sql, err => {
      if(err){console.log(err);}
    });
  })

  res.redirect("/teams");
})
app.post('/matchupload', upload.single('upName'), (req, res) => {
  console.log(`originalname: ${req.file.originalname}`)
  console.log(`path: ${req.file.path}`)

  const rs = fs.createReadStream(req.file.path);
  const rl = readline.createInterface({input: rs, });
  var sql = "";
  rl.on('line', (linestring)=>{
    sql = 'INSERT INTO Matches (year, league, kind, date, time, home, homescore, awayscore, away, stadium, viewers, broadcasts) VALUES ('+linestring+')';
    db.run(sql, err => {
      if(err){console.log(err);}
    });
  })

  res.redirect("/matches");
})