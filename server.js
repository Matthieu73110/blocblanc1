const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'garage_user',
  password: 'garage_password',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

const verifyTokenAndRole = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access Denied: No Token Provided!');
  }
  const roles = req.requiredroles || ["admin", "client"];
  try {
    const decoded = jwt.verify(token, 'OEKFNEZKkF78EZFH93023NOEAF');
    req.user = decoded;
    const sql = 'SELECT role FROM users WHERE id = ?';
    db.query(sql, [req.user.id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(404).send('User not found');
      }

      const userRole = results[0].role;
      if (!roles.includes(userRole)) {
        return res.status(403).send('Access Denied: You do not have the required role!');
      }

      next();
    });
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

// Routes
app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'OEKFNEZKkF78EZFH93023NOEAF', { expiresIn: 86400 });
    
    // Send the token with the response
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 hours
    res.status(200).json({ auth: true, role: user.role, token: token });
  });
});

app.get('/api/clients/', (req, res) => {
  const sql = 'SELECT id, CONCAT(firstname, " ", lastname) AS name FROM users WHERE role = "client"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
});

app.get('/api/clients/count', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results[0]);
  });
});

app.get('/api/vehicules/', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT * FROM vehicules';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

// Route to create a vehicle
app.post('/api/vehicules/', (req, res) => {
  req.requiredroles = ["admin"];
  verifyTokenAndRole(req, res, () => {
    const { marque, modele, annee, client_id } = req.body;

    const sql = 'INSERT INTO vehicules (marque, modele, annee, client_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [marque, modele, annee, client_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(201).send('Véhicule créé');
    });
  });
});

// Route to update a vehicle
app.put('/api/vehicules/:id', (req, res) => {
  req.requiredroles = ["admin"];
  verifyTokenAndRole(req, res, () => {
    const id = req.params.id;
    const { marque, modele, annee, client_id } = req.body;

    const sql = 'UPDATE vehicules SET marque = ?, modele = ?, annee = ?, client_id = ? WHERE id = ?';
    db.query(sql, [marque, modele, annee, client_id, id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).send('Véhicule mis à jour');
    });
  });
});

// Delete a vehicle
app.delete('/api/vehicules/:id', (req, res) => {
  req.requiredroles = ["admin"];
  verifyTokenAndRole(req, res, () => {
    const id = req.params.id;

    const sql = 'DELETE FROM vehicules WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).send('Vehicle deleted successfully');
    });
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
  res.sendFile(
    path.join(__dirname, "./client/dist/index.html")
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
