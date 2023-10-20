const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');

const router = express.Router();
const pool = require('../database');


router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, username, hashedPassword, "user"]
    );

    const userId = result.rows[0].id;
    const userRole = result.rows[0].role;
    
    // Create a JWT token
    const token = jwt.sign({ userId, userRole }, 'your_secret_key');

    // Set the userId in the session
    //req.session.userId = userId;

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ message: 'Email or username already taken' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const userId = user.id
    const userRole = user.role
    const token = jwt.sign({ userId, userRole }, 'your_secret_key');

    res.status(200).json({ message: 'Login successful', email: user.email, username: user.username, token:token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  //localStorage.removeItem('token');
  res.status(200).json({ message: 'Logout successful' });
});


////////////////////////////////////////////////


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/submit', upload.array('images'), (req, res) => {
  // Get form data
  const { name, location, latitude, longitude, description } = req.body;
  const images = req.files.map(file => file.filename);

  // Insert data into pending_data table
  /*pool.query(
    'INSERT INTO pending_data (name, location, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, location, description, latitude, longitude],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error inserting data into database');
      } else {
        const dataId = result.rows[0].id;

        // Insert images into pending_images table
        const imageValues = images.map(filename => [dataId, filename]);
        for (let i = 0; i < imageValues.length; i++) {
          const dataId = imageValues[i][0];
          const filename = imageValues[i][1];
          pool.query(
            'INSERT INTO pending_images (data_id, filename) VALUES ($1, $2)',
            [dataId, filename],
            (error) => {
              if (error) {
                console.error(error);
                res.status(500).send('Error inserting images into database');
              } else {
                console.log(res.headersSent)
                //res.send('Data and images submitted successfully');
                res.status(200).json({ message: 'Data and images submitted successfully' });
              }
            }
          );
        }
      }
    }
  );
}); */

pool.query(
  'INSERT INTO pending_data (name, location, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id',
  [name, location, description, latitude, longitude],
  (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error inserting data into database');
    } else {
      const dataId = result.rows[0].id;

      const insertImagePromises = images.map(filename => {
        return new Promise((resolve, reject) => {
          pool.query(
            'INSERT INTO pending_images (data_id, filename) VALUES ($1, $2)',
            [dataId, filename],
            (error) => {
              if (error) {
                console.error(error);
                reject('Error inserting images into database');
              } else {
                resolve();
              }
            }
          );
        });
      });

      Promise.all(insertImagePromises)
        .then(() => {
          res.status(200).json({ message: 'Data and images submitted successfully' });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error inserting images into database');
        });
    }
  }
);
});



router.post('/accepted_spots_data', async (req, res) => {
  try {
    const { id, name, location, description, latitude, longitude, images } = req.body;
    console.log(id);
    let imageInsertionsCompleted = 0;
    const totalImageInsertions = images.length;

    // create a new row in the spots_data table
    pool.query(
      `INSERT INTO spots_data (name, location, description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, location, description, latitude, longitude],
      (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error inserting data into database');
        } else {
          const dataId = result.rows[0].id;
          images.forEach(image => {
            pool.query(
              'INSERT INTO spots_images (data_id, filename) VALUES ($1, $2)',
              [dataId, image],
              (error) => {
                if (error) {
                  console.error(error);
                  res.status(500).send('Error inserting images into database');
                } else {
                  imageInsertionsCompleted++;
                  if (imageInsertionsCompleted === totalImageInsertions) {
                    // All image insertions completed
                    res.send('Data and images submitted successfully');
                    pool.query('DELETE FROM pending_images WHERE data_id = $1', [id], (err, result) => {
                      if (err) {
                        console.error('Error deleting row:', err);
                      } else {
                        pool.query('DELETE FROM pending_data WHERE id = $1', [id], (err, result) => {
                          if (err) {
                            console.error('Error deleting row:', err);
                          } else {
                            console.log('Row deleted successfully');
                          }
                        });
                      }
                    });
                  }
                }
              }
            );
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




/* router.post('/accepted_spots_data', async (req, res) => {
  try {
    const { id, name, location, description, latitude, longitude, images } = req.body;
    console.log(id)
    // create a new row in the spots_data table
    pool.query(`INSERT INTO spots_data (name, location, description, latitude, longitude)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, location, description, latitude, longitude],
      (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error inserting data into database');
        } else {
          const dataId = result.rows[0].id;
          images.forEach(image => {
            pool.query(
              'INSERT INTO spots_images (data_id, filename) VALUES ($1, $2)',
              [dataId, image],
              (error) => {
                if (error) {
                  console.error(error);
                  res.status(500).send('Error inserting images into database');
                } else {
                  res.send('Data and images submitted successfully');
                  pool.query('DELETE FROM pending_images WHERE data_id = $1', [id], (err, result) => {
                    if (err) {
                      console.error('Error deleting row:', err);
                    } else {
                      pool.query('DELETE FROM pending_data WHERE id = $1', [id], (err, result) => {
                        if (err) {
                          console.error('Error deleting row:', err);
                        } else {
                          console.log('Row deleted successfully');
                        }
                      });

                      //console.log('Row deleted successfully');
                    }
                  });

                }
              }
            );
          });
          //res.send('Data submitted successfully');
        }
      }
    );

    // return the inserted row as JSON
    //res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}); */

router.post('/declined_spots_data', async (req, res) => {
  try {
    const { id, name, location, description, latitude, longitude, images } = req.body;
    //console.log(id)
    pool.query('DELETE FROM pending_images WHERE data_id = $1', [id], (err, result) => {
      if (err) {
        console.error('Error deleting row:', err);
      } else {
        pool.query('DELETE FROM pending_data WHERE id = $1', [id], (err, result) => {
          if (err) {
            console.error('Error deleting row:', err);
          } else {
            //console.log('Row deleted successfully');
          }
        });

        console.log('Row deleted successfully');
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/deleted_spots_data', async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id)
    pool.query('DELETE FROM spots_images WHERE data_id = $1', [id], (err, result) => {
      if (err) {
        console.error('Error deleting row:', err);
      } else {
        pool.query('DELETE FROM spots_data WHERE id = $1', [id], (err, result) => {
          if (err) {
            console.error('Error deleting row:', err);
          } else {
            //console.log('Row deleted successfully');
            pool.query('DELETE FROM comments WHERE item_id = $1', [id], (err, result) => {
              if (err) {
                console.error('Error deleting row:', err);
              } else {
                //console.log('Row deleted successfully');
                
              }
            });
          }
        });

        console.log('Row deleted successfully');
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/update_spots_data', async (req, res) => {
  try {
    const { id, title, description } = req.body;
    
    pool.query('UPDATE spots_data SET name = $1, description = $2 WHERE id = $3', [title, description, id], (err, result) => {
      if (err) {
        console.error('Error editing row:', err);
      } else {
        console.log('Row edited successfully');
      }
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const uploadMulter = multer();
router.post('/sponsor', uploadMulter.none(), (req, res) => {
  // Get form data
  const { name, skatingduration, age, contact, videourl } = req.body;

  // Insert data into pending_data table
  pool.query(
    'INSERT INTO sponsor_me_data (name, skating_duration, age, contact, video_url) VALUES ($1, $2, $3, $4, $5)',
    [name, skatingduration, age, contact, videourl],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error inserting data into database');
      } else {
        res.send('Data submitted successfully');
      }
    }
  ); 
});


router.post('/deleted_sponsor_data', async (req, res) => {
  try {
    const { id } = req.body;
    //console.log(id)
    pool.query('DELETE FROM sponsor_me_data WHERE id = $1', [id], (err, result) => {
      if (err) {
        console.error('Error deleting row:', err);
      } else {
            console.log('Row deleted successfully');
        }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/comments', async (req, res) => {
  try {
    const { itemId, comment } = req.body;
    
    pool.query(
      'INSERT INTO comments (item_id, author, text, created_at) VALUES ($1, $2, $3, $4)',
      [itemId, comment.author, comment.text, comment.date],
      (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error inserting data into database');
        } else {
          res.send('Data submitted successfully');
        }
      }
    ); 

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const videoStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/videos'); // Set the destination folder for uploaded videos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // Set the maximum allowed file size to 50mb
});

router.post('/videos', videoUpload.single('video'), (req, res) => {
  // Get form data
  const { filename } = req.file;
  const { author, spot_id, date } = req.body;

  // Insert data into pending_data table
  pool.query('INSERT INTO spots_videos (filename, author, spot_id, created_at) VALUES ($1, $2, $3, $4)', [filename, author, spot_id, date], function(error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add video' });
    } else {
      res.status(200).json({ message: 'Video added successfully' });
    }
  }); 
});



module.exports = router;
