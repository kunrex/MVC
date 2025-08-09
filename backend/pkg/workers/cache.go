package workers

import (
	"MVC/pkg/database/models"
	"log"
	"os"
	"time"
)

func InitOrderSessionClearanceWorker(quit chan os.Signal) {
	ticker := time.NewTicker(10 * time.Minute)

	log.Printf("starting order session clearance worker")
	go func() {
		for {
			select {
			case <-ticker.C:
				models.ClearExpiredOrderSessions()
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}
