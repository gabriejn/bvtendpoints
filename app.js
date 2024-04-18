const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

require('dotenv').config();

const port = process.env.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.use(async function(req, res, next) {
  try {
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    await req.db.query(`SET SESSION sql_mode = "TRADITIONAL"`);
    await req.db.query(`SET time_zone = '-8:00'`);

    await next();

    req.db.release();
  } catch (err) {
    console.log(err);

    if (req.db) req.db.release();
    throw err;
  }
  //console.log(req.db);
});


app.use(cors());

app.use(express.json());

app.get('/cars', async function(req, res) {
  try {
    console.log('/cars/:id')
  } catch (err) {
    
  }

});
//console.log(process.env.DB_DATABASE)
app.get('/', async function(req, res) {
    try {
        const [rows, fields] = await req.db.query('SELECT * FROM cars WHERE deleted_flag =0');
    res.json({ success: true, data: rows });
        
} catch (err) {
    console.error(err); // Log the error

    res.status(500).json({ success: false, error: err.message });
  }
});


app.use(async function(req, res, next) {
  try {
    console.log('Middleware after the get /cars');
  
    await next();

  } catch (err) {

  }
});

app.post('/cars', async function(req, res) {
  try {
    const { make, model, year } = req.body;
  
    const query = await req.db.query(
      `INSERT INTO cars (make, model, year) 
       VALUES (:make, :model, :year)`,
      {
        make,
        model,
        year,
      }
    );
  
    res.json({ success: true, message: 'Car successfully created', data: null });
  } catch (err) {
    res.json({ success: false, message: err, data: null })
  }
});

app.delete('/cars/:id', async function(req,res) {
    try {
        const {id} = req.params;
        console.log(Number(id));
        await req.db.query('UPDATE cars SET deleted_flag = "1" WHERE id = ?',[Number(id)]);
        res.json({ success: true, message: 'Car deleted successfully' });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

//CHANGE MODEL YEAR TO 
app.put('/cars/:model', async function(req,res) {
    try {
        const {model} = req.params;
        await req.db.query('UPDATE cars SET year = "1998" WHERE model = ?',[model]);
        res.json({ success: true, message: 'Car year changed successfully' });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });


app.listen(port, () => console.log(`212 API Example listening on http://localhost:${port}`));