CREATE TABLE FoodTagRelations (
                                  foodId BIGINT NOT NULL,
                                  tagId BIGINT NOT NULL,

                                  FOREIGN KEY (foodId) REFERENCES Foods(id),
                                  FOREIGN KEY (tagId) REFERENCES FoodTags(id)
);