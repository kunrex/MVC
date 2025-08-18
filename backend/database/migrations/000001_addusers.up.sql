CREATE TABLE Users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,

                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,

                       pwdHash CHAR(60) NOT NULL,

                       auth TINYINT UNSIGNED NOT NULL
);