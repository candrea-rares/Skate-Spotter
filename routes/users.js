const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');


const router = express.Router();
const pool = require('../database');





router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  router.get('/user', async (req, res) => {
    const token = req.headers.authorization;
  
    if (!token) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }
  
    try {
      const decodedToken = jwt.verify(token, 'your_secret_key');
      const userId = decodedToken.userId;
  
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
  
      if (result.rows.length === 0) {
        res.status(401).json({ message: 'User not found' });
        return;
      }
  
      const user = result.rows[0];
      const userProfileData = { 
        email: user.email,
        username: user.username,
        role: user.role
        // add any other user profile data you want to return
      };
  
      res.status(200).json({ data: userProfileData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
 /* function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      return next(); // authorized
    }
    return res.status(401).send('Unauthorized'); // not authorized
  }

  router.get('/admin', isAdmin, (req, res) => {
    res.send('This page is only accessible to admin users.');
  }); */


  router.get('/pending_data', (req, res) => {
    pool.query(
      `SELECT pd.id, pd.name, pd.location, pd.latitude, pd.longitude, pd.description, ARRAY_AGG(pi.filename) AS images
       FROM pending_data pd
       JOIN pending_images pi ON pd.id = pi.data_id
       GROUP BY pd.id, pd.name, pd.location, pd.latitude, pd.longitude, pd.description`,
      (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error retrieving pending data from database');
        } else {
          const pendingData = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            location: row.location,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            images: row.images
          }));
          res.json(pendingData);
        }
      }
    );
  });
  
  async function getSpotDataById(id) {
    try {
      const client = await pool.connect();
      const result = await client.query(`
      SELECT sd.*, array_agg(si.filename) AS filenames 
      FROM spots_data sd 
      LEFT JOIN spots_images si ON sd.id = si.data_id 
      WHERE sd.id = $1 
      GROUP BY sd.id;
      `, [id]);
      client.release();
      return result.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  router.get('/spots/:id', async (req, res) => {
    try {
      const spotData = await getSpotDataById(req.params.id);
      res.json(spotData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/sponsor_me_data', (req, res) => {
    pool.query(
      `SELECT id, video_url, name, skating_duration, age, contact
       FROM sponsor_me_data`,
      (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error retrieving sponsor_me_data from database');
        } else {
          const pendingData = result.rows.map(row => ({
            id: row.id,
            video_url: row.video_url,
            name: row.name,
            skating_duration: row.skating_duration,
            age: row.age,
            contact: row.contact,
          }));
          res.json(pendingData);
        }
      }
    );
  });

  router.get('/comments', async (req, res) => {
    try {
      const { itemId } = req.query;
      const { rows } = await pool.query('SELECT *, to_char(created_at, \'YYYY-MM-DD HH24:MI:SS\') AS formatted_created_at FROM comments WHERE item_id = $1 ORDER BY created_at DESC', [itemId]);

      // Map the rows to include the formatted date
      const comments = rows.map(row => {
        return {
          id: row.id,
          text: row.text,
          author: row.author,
          created_at: row.formatted_created_at
        };
      });

      res.json({ comments });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
  });

  router.get('/videos', async (req, res) => {
    try {
      const { itemId } = req.query;
      const { rows } = await pool.query('SELECT *, to_char(created_at, \'YYYY-MM-DD HH24:MI:SS\') AS formatted_created_at FROM spots_videos WHERE spot_id = $1 ORDER BY created_at DESC', [itemId]);

      // Map the rows to include the formatted date
      const videos = rows.map(row => {
        return {
          id: row.id,
          filename: row.filename,
          author: row.author,
          created_at: row.formatted_created_at
        };
      });

      res.json({ videos });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
  });
  

  module.exports =  router;
