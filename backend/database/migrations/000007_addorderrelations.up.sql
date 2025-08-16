CREATE TABLE OrderRelations (
                                userId BIGINT NOT NULL,
                                orderId BIGINT NOT NULL,

                                FOREIGN KEY (userId) REFERENCES Users(id),
                                FOREIGN KEY (orderId) REFERENCES Orders(id)
);