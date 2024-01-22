const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const db = mysql.createConnection({
    host: 'localhost',    
    user: 'root',         
    password: 'my-secret-pw',  
    database: 'MovieLens' 
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

const app = express();

app.use(cors());

app.get('/viewers', (req, res) => {
    const sql = 'SELECT * FROM Viewer';
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
