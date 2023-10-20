const express = require('express');
const app = express();
const routes = require('./routes_html');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');


app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit to 50mb
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

app.use('/', routes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
