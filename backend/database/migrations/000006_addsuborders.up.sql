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