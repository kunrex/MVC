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
	Completed  bool      `json:"completed"`
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

func TryFindNonPayedOrder(userId int64) (int64, error) {
	var id int64
	err := database.DB.QueryRow("SELECT id FROM Orders WHERE createdBy = ? AND payedBy IS NULL;", userId).Scan(&id)

	if errors.Is(err, sql.ErrNoRows) {
		res, err := database.DB.Exec(`INSERT INTO Orders (createdBy, completed, createdOn) VALUES (?, ?, ?);`, userId, false, time.Now())
		if err != nil {
			return id, err
		}

		id, err = res.LastInsertId()
		if err != nil {
			return id, err
		}

		_, err = database.DB.Exec("INSERT INTO OrderRelations (userId, orderId) VALUES (?, ?);", userId, id)
		return id, err
	}

	return id, err
}

func GetOrderAuthor(orderId int64) (string, error) {
	var authorName string
	err := database.DB.QueryRow(`SELECT Users.name FROM Orders
                                            INNER JOIN Users ON Users.id = Orders.createdBy
                                            WHERE Orders.id = ?;`, orderId).Scan(&authorName)
	if err != nil {
		return "", err
	}

	return authorName, nil
}

func AddOrderUserRelation(userId int64, orderId int64) error {
	var temp int
	err := database.DB.QueryRow("SELECT 1 FROM OrderRelations WHERE userId = ? AND orderId = ?;", userId, orderId).Scan(&temp)
	if errors.Is(err, sql.ErrNoRows) {
		_, err = database.DB.Exec("INSERT INTO OrderRelations (userId, orderId) VALUES (?, ?);", userId, orderId)
	}

	return err
}

func GetOrderStatus(orderId int64) (bool, bool, error) {
	var payed bool
	var completed bool
	err := database.DB.QueryRow("SELECT completed, payedBy IS NOT NULL FROM Orders WHERE id = ?;", orderId).Scan(&completed, &payed)
	if err != nil {
		return false, false, err
	}

	return completed, payed, nil
}

func GetSuborders(orderId int64) (string, error) {
	rows, err := database.DB.Query(`SELECT Foods.id as foodId, Foods.name, Users.name, Suborders.id, Suborders.quantity, Suborders.instructions, Suborders.status FROM Suborders
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
			&suborder.FoodId,
			&suborder.FoodName,
			&suborder.AuthorName,
			&suborder.Id,
			&suborder.Quantity,
			&suborder.Instructions,
			&suborder.Status)

		suborders = append(suborders, suborder)
	}

	jsonString, err := json.Marshal(suborders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func UpdateSuborder(suborder SuborderExtra, orderId int64) (int64, error) {
	if suborder.Status != "completed" && suborder.Status != "processing" && suborder.Status != "ordered" {
		return 0, errors.New("invalid suborder status")
	}

	res, err := database.DB.Exec(`UPDATE Suborders SET
                     					quantity = ?,
                     					instructions = ?,
                     					status = ?
                     					WHERE id = ? AND orderId = ?;`, suborder.Quantity, suborder.Instructions, suborder.Status, suborder.Id, orderId)

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rowsAffected, err
}

func DeleteSuborder(suborderId int64, orderId int64) (int64, error) {
	res, err := database.DB.Exec(`DELETE FROM Suborders WHERE id = ? AND orderId = ?;`, suborderId, orderId)
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rowsAffected, err
}

func AddSuborders(suborders []Suborder, orderId int64, userId int64) error {
	args := make([]interface{}, len(suborders)*6)
	placeholders := make([]string, len(suborders))
	for i, suborder := range suborders {
		args[i] = suborder.FoodId
		args[i+1] = orderId
		args[i+2] = userId
		args[i+3] = suborder.Quantity
		args[i+4] = suborder.Instructions
		args[i+5] = suborder.Status
		placeholders[i] = "(?, ?, ?, ?, ?, ?)"
	}

	query := fmt.Sprintf("INSERT INTO Suborders (foodId, orderId, authorId, quantity, instructions, status) VALUES %v;", strings.Join(placeholders, ","))
	_, err := database.DB.Exec(query, args...)
	return err
}

func GetIncompleteSuborders() (string, error) {
	rows, err := database.DB.Query(`SELECT Foods.name, Foods.id, Suborders.quantity, Suborders.instructions, Suborders.status FROM Suborders
												INNER JOIN Foods ON Suborders.foodId = Foods.id
												WHERE Suborders.status != ?;`, "completed")

	if err != nil {
		return "", err
	}

	suborders := make([]Suborder, 0)
	for rows.Next() {
		var suborder Suborder
		_ = rows.Scan(
			&suborder.FoodName,
			&suborder.FoodId,
			&suborder.Quantity,
			&suborder.Instructions,
			&suborder.Status)

		suborders = append(suborders, suborder)
	}

	jsonString, err := json.Marshal(suborders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func CompleteOrder(orderId int64) (bool, error) {
	res, err := database.DB.Exec(`UPDATE Orders SET 
                  							completed = ?,
                  							completedOn = ? 
              								WHERE id = ? AND completed = ?;`, true, time.Now(), orderId, false)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	if rowsAffected == 0 {
		return false, nil
	}

	return true, nil
}

func CalculateOrderSubtotal(orderId int64) (int, error) {
	var subtotal int
	err := database.DB.QueryRow(`SELECT IFNULL(SUM(Foods.price * Suborders.quantity), 0) FROM Suborders
	                                              INNER JOIN Foods ON Foods.id = Suborders.foodId
	                                              WHERE Suborders.orderId = ?`, orderId).Scan(&subtotal)
	if err != nil {
		return 0, err
	}

	return subtotal, nil
}

func PayOrder(orderId int64, subtotal float32, tip int, discount int, total float32, userId int64) (bool, error) {
	res, err := database.DB.Exec(`UPDATE Orders SET 
                  							tip = ?, 
                  							total = ?,
                  							discount = ?,
                  							subtotal = ?,
                  							payedBy = ?,
                  							payedOn = ?
              								WHERE id = ? and payedBy = ?;`, tip, total, discount, subtotal, userId, time.Now(), orderId, nil)

	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	if rowsAffected == 0 {
		return false, nil
	}

	return true, nil
}

func GetAllOrders() (string, error) {
	rows, err := database.DB.Query(`SELECT Users.name, Orders.id, Orders.completed, DATE_ADD(Orders.createdOn, INTERVAL 330 MINUTE) FROM Orders
                                                 INNER JOIN Users ON Users.id = Orders.createdBy;`)

	if err != nil {
		return "", err
	}

	orders := make([]Order, 0)
	for rows.Next() {
		var order Order
		_ = rows.Scan(
			&order.AuthorName,
			&order.Id,
			&order.Completed,
			&order.CreatedOn)

		orders = append(orders, order)
	}

	jsonString, err := json.Marshal(orders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}

func GetUserOrders(userId int64) (string, error) {
	rows, err := database.DB.Query(`SELECT Users.name, Orders.id, Orders.completed, DATE_ADD(Orders.createdOn, INTERVAL 330 MINUTE) FROM Orders
                                            INNER JOIN OrderRelations ON OrderRelations.orderId = Orders.Id 
    										INNER JOIN Users ON Users.id = Orders.createdBy
                                            WHERE OrderRelations.userId = ?;`, userId)
	if err != nil {
		return "", err
	}

	orders := make([]Order, 0)
	for rows.Next() {
		var order Order
		_ = rows.Scan(
			&order.AuthorName,
			&order.Id,
			&order.Completed,
			&order.CreatedOn)

		orders = append(orders, order)
	}

	jsonString, err := json.Marshal(orders)
	if err != nil {
		return "", err
	}

	return string(jsonString), nil
}
