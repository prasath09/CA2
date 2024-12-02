const express = require('express');
//const mysql = require('mysql');
const mysql = require('mysql2');


const PORT = 5000;
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());

const connection = mysql.createConnection({
    host: 'apidb.cj8eoeeosxkn.ap-southeast-1.rds.amazonaws.com',
    user: 'admin',
    password: 'apidb2024',
    database: 'apiservices',
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

// API endpoint to fetch client details
app.get('/api/clients', (req, res) => {
    const query = 'SELECT id, name, address, phone FROM client';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching client data:', error);
            res.status(500).json({ error: 'Failed to fetch client data' });
        } else {
            res.json(results);
        }
    });
});

// API Endpoint to Save Personal Details
app.post("/api/save-client", (req, res) => {
  // Log the request body to check if data is being received
  console.log("Request Body:", req);
  console.log("req",req);
  console.log("res",res);
  //const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // SQL Query to Insert Data into Client Table
  const query = `
    INSERT INTO client (name, address, phone)
    VALUES (?, ?, ?)
  `;

  connection.query(query, [name, address, phone], (error, results) => {
    if (error) {
      console.error("Error saving client data:", error);
      res.status(500).json({ error: "Failed to save client data" });
    } else {
      res.json({ message: "Client data saved successfully", clientId: results.insertId });
    }
  });
});
// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// API Endpoint to Save Client Data
app.post(
  '/api/saves-client',
  upload.fields([{ name: 'panCard' }, { name: 'aadharCard' }, { name: 'otherDocuments' }]),
  (req, res) => {
      const { name, address, phone, businessName, gstNumber, businessType } = req.body;
      const panCard = req.files?.panCard?.[0]?.filename || null;
      const aadharCard = req.files?.aadharCard?.[0]?.filename || null;
      const otherDocuments = req.files?.otherDocuments?.map((file) => file.filename).join(',') || null;

      // SQL Query to Insert Data into Client Table
      const query = `
          INSERT INTO client (name, address, phone, business_name, gst_number, business_type, pan_card, aadhar_card, other_documents)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connection.query(
          query,
          [name, address, phone, businessName, gstNumber, businessType, panCard, aadharCard, otherDocuments],
          (error, results) => {
              if (error) {
                  console.error('Error saving client data:', error);
                  res.status(500).json({ error: 'Failed to save client data' });
              } else {
                  res.json({ message: 'Client data saved successfully', clientId: results.insertId });
              }
          }
      );
  }
);


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
