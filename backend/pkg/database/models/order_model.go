package models

import (
	"MVC/pkg/database"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Order struct {
	Id         int64     `json:"id"`
	CreatedOn  time.Time `json:"createdOn"`
	AuthorName string    `json:"authorName"`
	Status     string    `json:"status"`
}

type Suborder struct {
	FoodId   int64  `json:"foodId"`
	FoodName string `json:"foodName"`

	Status string `json:"status"`

	Quantity     int    `json:"quantity"`
	Instructions string `json:"instructions"`
}

type SuborderExtra struct {
	Id         int64  `json:"id"`
	AuthorName string `json:"authorName"`

	Suborder
}

// cache this, since 2 requests will use this data and the sql querries are expensice
func GetSuborderAuthor(id int64) (string, error) {
	var authorName string
	err := database.DB.QueryRow(`SELECT Users.name AS authorName FROM Orders
                                            INNER JOIN Users ON Users.id = Orders.createdBy
                                            WHERE Orders.id = ?;`, id).Scan(&authorName)

	if err != nil {
		return "", err
	}

	return authorName, nil
}

func AddOrderUserRelation(userId int64, orderId int64) error {
	err := database.DB.QueryRow("SELECT 1 FROM ${orderRelations} WHERE userId = ? AND orderId = ?;", userId, orderId).Scan()
	if errors.Is(err, sql.ErrNoRows) {
		_, err = database.DB.Exec("INSERT INTO ${orderRelations} (userId, orderId) VALUES (?, ?);", userId, orderId)
	}

	return err
}

func GetOrderStatus(orderId int64) (bool, bool, error) {
	var payed bool
	var completed bool
	err := database.DB.QueryRow("SELECT completed, payedBy IS NOT NULL AS isPayed FROM ORDERS WHERE id = ?;", orderId).Scan(&completed, &payed)

	if err != nil {
		return false, false, err
	}
	return completed, payed, nil
}

func GetSuborders(orderId int64) (string, error) {
	rows, err := database.DB.Query(`SELECT Suborders.id, Suborders.quantity, Suborders.instructions, Suborders.status, Foods.name, Users.name AS authorName FROM Suborders
												INNER JOIN Foods ON Suborders.foodId = Foods.id
												INNER JOIN Users ON Suborders.authorId = Users.id
												WHERE Suborders.orderId = ?;`, orderId)

	if err != nil {
		return "", err
	}

	suborders := make([]SuborderExtra, 0)
	for rows.Next() {
		var suborder SuborderExtra

		_ = rows.Scan(
			&suborder.Id,
			&suborder.Quantity,
			&suborder.Instructions,
			&suborder.Status,
			&suborder.FoodName,
			&suborder.AuthorName)

		suborders = append(suborders, suborder)
	}

	jsonString, err := json.Marshal(suborders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func UpdateSuborder(suborder SuborderExtra, orderId int64) error {
	_, err := database.DB.Exec(`UPDATE Suborders SET
                     					quantity = ?,
                     					instructions = ?,
                     					status = ?
                     					WHERE id = ? AND orderId = ?;`, suborder.Quantity, suborder.Instructions, suborder.Status, suborder.Id, orderId)
	return err
}

func DeleteSuborder(suborderId int64, orderId int64) error {
	_, err := database.DB.Exec(`DELETE FROM Suborders WHERE suborderId = ? AND orderId = ?;`, suborderId, orderId)
	return err
}

func AddSuborders(suborders []Suborder, orderId int64, userId int64) error {
	args := make([]interface{}, 0)
	placeholders := make([]string, 0)
	for _, suborder := range suborders {
		args = append(args, suborder.FoodId, orderId, userId, suborder.Quantity, suborder.Instructions, suborder.Status)
		placeholders = append(placeholders, "(?, ?, ?, ?, ?, ?)")
	}

	query := fmt.Sprintf("INSERT INTO Suborders (foodId, orderId, authorId, quantity, instructions, status) VALUES %v;", strings.Join(placeholders, ","))
	_, err := database.DB.Exec(query, args...)
	return err
}

func GetIncompleteSuborders() (string, error) {
	rows, err := database.DB.Query(`SELECT Suborders.quantity, Suborders.instructions, Suborders.status, Foods.name, Foods.id as foodId FROM Suborders
												INNER JOIN Foods ON Suborders.foodId = Foods.id
												WHERE Suborders.status != ?;`, "completed")

	if err != nil {
		return "", err
	}

	suborders := make([]Suborder, 0)
	for rows.Next() {
		var suborder Suborder

		_ = rows.Scan(
			&suborder.Quantity,
			&suborder.Instructions,
			&suborder.Status,
			&suborder.FoodName,
			&suborder.FoodId)

		suborders = append(suborders, suborder)
	}

	jsonString, err := json.Marshal(suborders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func CompleteOrder(orderId int64) bool {
	_, err := database.DB.Exec(`UPDATE Orders SET 
                  							completed = ?,
                  							completedOn = ? 
              								WHERE id = ?;`, true, time.Now(), orderId)
	return err == nil
}

func PayOrder(orderId int64, subtotal float32, tip int, discount int, total float32, userId int64) error {
	_, err := database.DB.Exec(`UPDATE Orders SET 
                  							tip = ?, 
                  							total = ?,
                  							discount = ?,
                  							subtotal = ?,
                  							payedBy = ? 
              								WHERE id = ?;`, tip, total, discount, subtotal, userId, orderId)
	return err
}

func GetAllOrders() (string, error) {
	rows, err := database.DB.Query(`SELECT Orders.id, DATE_ADD(Orders.createdOn, INTERVAL 330 MINUTE) AS createdOn, Users.name AS authorName, Orders.status FROM Orders
                                                 INNER JOIN Users ON Users.id = Orders.createdBy;`)

	if err != nil {
		return "", err
	}

	orders := make([]Order, 0)
	for rows.Next() {
		var order Order

		_ = rows.Scan(
			&order.Id,
			&order.CreatedOn,
			&order.AuthorName,
			&order.Status)

		orders = append(orders, order)
	}

	jsonString, err := json.Marshal(orders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func GetUserOrders(userId int64) (string, error) {
	rows, err := database.DB.Query(`SELECT Orders.id, DATE_ADD(Orders.createdOn, INTERVAL 330 MINUTE) AS createdOn, Users.name AS authorName, Orders.status FROM Orders
                                            INNER JOIN OrderRelations ON OrderRelations.userId = Orders.Id 
                                            INNER JOIN Users ON Users.id = Orders.createdBy
                                            WHERE OrderRelations.userId = ?;`, userId)

	if err != nil {
		return "", err
	}

	orders := make([]Order, 0)
	for rows.Next() {
		var order Order

		_ = rows.Scan(
			&order.Id,
			&order.CreatedOn,
			&order.AuthorName,
			&order.Status)

		orders = append(orders, order)
	}

	jsonString, err := json.Marshal(orders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}
