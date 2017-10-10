//express route setup
const express = require('express');

const app  = express();
const PORT = process.env.PORT || 3000;

//npm library setup
const mustacheExpress = require('mustache-express');
const bodyParser  = require('body-parser');
const morgan = require('morgan');
const pgp = require('pg-promise')();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const axios = require('axios');



//auth and passport setup
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

const auth = require('./services/auth.js');
app.use(auth.passportInstance);
app.use(auth.passportSession);
app.use(cookieParser());

// logger setup.
app.use(morgan('dev'));

//body-parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//method override
app.use(require('express-method-override')('method_override_param_name'));
//views and static assets setup
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

//root route
app.get('/', (req, res) => {
	res.render('index')
});

//controllers setup
app.use('/climate/', require('./controllers/climate'));
app.use('/users/', require('./controllers/users'));

//start app
app.listen(PORT, () => console.log('Server is listening on port', PORT));