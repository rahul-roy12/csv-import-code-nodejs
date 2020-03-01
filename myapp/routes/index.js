var express = require('express');
var app = express();
var router = express.Router();
const fs = require('fs');
const mysql = require("mysql");
const multer = require('multer');
const csv = require('fast-csv');
const NodeTable = require("nodetable");

// create a new connection to the database
const db = mysql.createConnection({
  host: "localhost",
  user: "rahul",
  password: "12345",
  database: "csvdata"
});

const upload = multer({ dest: './csv-file' });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Import Data', msg:'' });
});

router.post('/upload-csv', upload.single('csvfile'), function (req, res) {
  const fileRows = [];
  //open uploaded file
  csv.parseFile(req.file.path)
    .on("data", function (data) {
      fileRows.push(data); // push each row
    })
    .on("end", function () {
      //console.log(fileRows)
      fs.unlinkSync(req.file.path); 
      fileRows.shift();
       
      //console.log(fileRows);
        let query ="INSERT INTO csv (id, level,cvss,title,vulnerability,solution,reference) VALUES ?";
        db.query(query, [fileRows], (error, response) => {
          if(error) throw error;
          res.render('index',{title:'Csv import',msg:'Data imported successfully'});
        });
  });

});

router.get('/show-data', (req, res, next) => {
  res.render('show-data', {title:'show data'})
 });


app.use('/upload-csv', router);

router.get("/data", (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  const requestQuery = req.query;
  let columnsMap = [
    {
      db: "id",
      dt: 0
    },
    {
      db: "level",
      dt: 1
    },
    {
      db: "cvss",
      dt: 2
    },
    {
      db: "title",
      dt: 3
    },
    {
      db: "vulnerability",
      dt: 4
    },
    {
      db: "solution",
      dt: 5
    },
    {
      db: "reference",
      dt: 6
    }
  ];

  // Custome SQL query
  const query = "SELECT * FROM csv";
  const primaryKey = "id";

  const nodeTable = new NodeTable(requestQuery,db, query, primaryKey, columnsMap);
 
  nodeTable.output((err, data)=>{
    //console.log(data);
    if (err) {
      console.log(err);
      return;
    }

    // Directly send this data as output to Datatable
    res.send(data)
  })
  
});


module.exports = router;
