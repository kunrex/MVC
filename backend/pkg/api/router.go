package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"fmt"
	"github.com/gorilla/mux"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
)

func InitRouter() *mux.Router {
	router := mux.NewRouter()

	router.Use(middleware.CORSMiddleware)
	router.Use(utils.AddJSONHeaders)

	initAuthRoutes(router)
	initUserRoutes(router)

	initAdminRoutes(router)

	initMenuRoute(router)
	initSubordersRoutes(router)
	initSingleOrderRoutes(router)
	initMultipleOrderRoutes(router)

	assetDir := "./assets"
	info, err := os.Stat(assetDir)
	if os.IsNotExist(err) {
		fmt.Println("Assets folder not found!")
	}
	if !info.IsDir() {
		fmt.Println("Assets path is not a directory!")
	} else {
		fmt.Println("Assets contents:")
		filepath.WalkDir(assetDir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			fmt.Println(" -", path)
			return nil
		})
	}

	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets"))))

	return router
}
