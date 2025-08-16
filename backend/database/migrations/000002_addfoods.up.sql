CREATE TABLE Foods (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,

                       name VARCHAR(100) UNIQUE NOT NULL,
                       description VARCHAR(300) NOT NULL,

                       veg BOOLEAN NOT NULL,
                       cookTime TIME NOT NULL,
                       price INT UNSIGNED NOT NULL,

                       image VARCHAR(100) NOT NULL
);