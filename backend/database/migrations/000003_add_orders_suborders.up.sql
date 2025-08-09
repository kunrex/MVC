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

CREATE TABLE Suborders (
                           id BIGINT PRIMARY KEY AUTO_INCREMENT,

                           foodId BIGINT NOT NULL,
                           orderId BIGINT NOT NULL,
                           authorId BIGINT NOT NULL,

                           quantity INT NOT NULL,

                           instructions VARCHAR(300),

                           status ENUM ('ordered', 'processing', 'completed') NOT NULL,

                           FOREIGN KEY (foodId) REFERENCES Foods(id),
                           FOREIGN KEY (orderId) REFERENCES Orders(id),
                           FOREIGN KEY (authorId) REFERENCES Users(id)
);

CREATE TABLE OrderRelations (
                                userId BIGINT NOT NULL,
                                orderId BIGINT NOT NULL,

                                FOREIGN KEY (userId) REFERENCES Users(id),
                                FOREIGN KEY (orderId) REFERENCES Orders(id)
);