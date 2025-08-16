CREATE TABLE Orders (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        createdBy BIGINT NOT NULL,
                        payedBy BIGINT DEFAULT NULL,

                        completed BOOLEAN NOT NULL,

                        createdOn DATETIME NOT NULL,
                        completedOn DATETIME DEFAULT NULL,

                        subtotal FLOAT,
                        discount INT,
                        tip INT,
                        total FLOAT,

                        payedOn DATETIME DEFAULT NULL,

                        FOREIGN KEY (createdBy) REFERENCES Users(id),
                        FOREIGN KEY (payedBy) REFERENCES Users(id)
);