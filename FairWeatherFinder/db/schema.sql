CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_digest VARCHAR NOT NULL
);
CREATE TABLE profiles (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGSERIAL FOREIGN KEY REFERENCES users(id),
	name VARCHAR NOT NULL,
	hiTemp INT NOT NULL,
	loTemp INT NOT NULL,
	precip INT NOT NULL,
	maxWind INT NOT NULL,
	humidity, INT NOT NULL,
	cloudCover INT NOT NULL
);
-- CREATE TABLE results (
-- 	id BIGSERIAL PRIMARY KEY,
-- 	user_id BIGSERIAL FOREIGN KEY REFERENCES users(id),
-- 	profile_id BIGSERIAL FOREIGN KEY REFERENCES profiles(id),
-- 	zipCode INT NOT NULL,
-- 	days INT NOT NULL,
-- 	daysMet INT NOT NULL,
-- 	avgIcon VARCHAR NOT NULL
-- );