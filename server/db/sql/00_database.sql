CREATE TABLE users (
  user_id integer NOT NULL AUTO_INCREMENT,
  user_name varchar(255) NOT NULL,
  user_password varchar(64) NOT NULL,
  PRIMARY KEY (user_id)
);

INSERT INTO users (user_id, user_name, user_password) VALUES (0, 'test_user', '6b3a55e0261b0304143f805a24924d0c1c44524821305f31d9277843b8a10f4e')