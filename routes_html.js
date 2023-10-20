const express = require('express');
const spotController = require('./spotController');
const http = require('http');
const jwt = require('jsonwebtoken');


const router = express.Router();


const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader && typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

/* router.get('/submit', checkUserRole, (req, res) => {
  res.sendFile('submit.html', { root: __dirname + "/public"});
});  */

router.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

/*router.get('/token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token)
    jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      } 
      //req.user = user;
      //console.log(user.userRole)
      router.get('/submit', (req, res) => {
       /* if(user.userRole !== 'admin' && user.userRole !== 'user')
          //res.sendFile('submit.html', { root: __dirname + "/public"});
          return res.status(401).json({ message: 'Unauthorized access' });
        else
          {
            res.sendFile('submit.html', { root: __dirname + "/public"});
            //res.status(401).json({ message: 'Unauthorized access' });
            //return;
          } /
          res.sendFile('submit.html', { root: __dirname + "/public"});
      }); 
    }); 
  else {
    res.status(401).json({ message: 'Unauthorized access' });
    return;
  }
  //res.sendFile('submit.html', { root: __dirname + "/public"});
}); */

router.get('/spots', spotController.getAllSpots);

router.get('/pending', (req, res) => {
    const token = req.headers.authorization; // Extract the token from the header
    //const decodedToken = jwt.verify(token, 'your_secret_key');
    //const userId = decodedToken.userId;
    console.log(token)
    // Here, you would perform any necessary checks on the token to ensure it is valid and authorized
    // If the token is valid and authorized, send the "pending.html" file
    res.sendFile('pending.html', { root: __dirname + "/public"});
    // If the token is not present or invalid, return a 401 Unauthorized status
    //res.status(401).send('Unauthorized');
  
});

router.get('/sponsor', (req, res) => {
  res.sendFile('sponsor.html', { root: __dirname + "/public"});
}); 

router.get('/submit', (req, res) => {
     res.sendFile('submit.html', { root: __dirname + "/public"});
 }); 


module.exports = router;
