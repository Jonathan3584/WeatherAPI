//bcrypt set up for safe password storage
const bcrypt = require('bcryptjs');
//require connection to database
const db = require('../db/setup');

const User = {};

User.create = (user) => {
  //hashing and salting password
  const passwordDigest = bcrypt.hashSync(user.password, 10);
  
  //copied from CHATBOT -- following 18 lines are not app specific
  // return db.oneOrNone(
  //   'INSERT INTO users (email, password_digest, thread_id) VALUES ($1, $2, $3) RETURNING *;',
  //   [user.email, passwordDigest, '']
  // );
// };

// User.findByEmail = (email) => {
//   return db.oneOrNone('SELECT * FROM users WHERE email = $1;', [email]);
// };

// User.findByEmailMiddleware = (req, res, next) => {
//   const email = req.user.email;
//   User
//     .findByEmail(email) // here we're using the nonmiddleware version above, getting back a promise
//     .then((userData) => {
//       res.locals.userData = userData;
//       next();
//     }).catch(err => console.log('ERROR:', err));
};

module.exports = User;
