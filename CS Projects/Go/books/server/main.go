package main

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "12345678"
	dbname   = "db_1"
)

type Book struct {
	Id          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

type Login struct {
	HashedPassword string
	SessionToken   string
	CSRFToken      string
}

var db *sql.DB

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3001",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlconn)
	CheckError(err)

	defer db.Close()

	//User Table
	createUsersTable(db)

	//Book Tables:
	createBooksTable(db)
	createTagsTable(db)
	createBookTagsTable(db)

	//auto Insert Tags
	insertTags(db)

	// not too sure what this is for atm....
	app.Get("home", home)

	app.Get("/books", func(c *fiber.Ctx) error {
		data := []Book{}
		data, err := getBooks(db, data)

		if err != nil {
			return err
		}

		fmt.Println(123123)
		fmt.Println(data)

		return c.Status(fiber.StatusCreated).JSON(data)
	})

	//User Actions:
	app.Post("/login", login)
	app.Post("/logout", logout)
	app.Post("/create", create)

	app.Listen(":3000")
}

func home(c *fiber.Ctx) error {
	return c.SendString("Welcome to your dashboard!")
}

func create(c *fiber.Ctx) error {
	var formData struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Tags        []string `json:"tags"`
		UserID      int      `json:"userid"`
	}

	if err := c.BodyParser(&formData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON body",
			"error":   err.Error(),
		})
	}

	title := formData.Title
	description := formData.Description

	// not too sure how this is stored...
	tags := formData.Tags
	userid := formData.UserID

	var bookID int

	//insert book into database
	query := (`INSERT INTO books (title, description, user_id) 
				VALUES ($1, $2, $3) RETURNING id`)

	error := db.QueryRow(query, title, description, userid).Scan(&bookID)

	if error != nil {
		c.SendString("Error when inserting user into database")
	}

	//insert into booktags
	for _, tag := range tags {
		//get Tag from Database first
		var tagID int
		tagQuery := (`SELECT id from tags WHERE name = $1`)

		err := db.QueryRow(tagQuery, tag).Scan(&tagID)

		if err != nil {
			fmt.Println(123)
			fmt.Println(err)
		}

		//insert into database
		bookTagQuery := (`INSERT INTO booktags (book_id, tag_id) VALUES ($1, $2)`)

		fmt.Println(bookID)
		fmt.Println(tagID)

		_, error := db.Exec(bookTagQuery, bookID, tagID)

		if error != nil {
			fmt.Println(error)
			c.SendString("There was an error")
		}
	}
	return c.JSON(fiber.Map{
		"message": "Book successfully created!",
	})

}

func login(c *fiber.Ctx) error {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// Parse the JSON body into the struct
	if err := c.BodyParser(&loginData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON body",
			"error":   err.Error(),
		})
	}

	username := loginData.Username
	password := loginData.Password

	var userID int
	//check if user already exists
	query := (`SELECT id FROM USERS
			  WHERE username = ($1)`)

	err := db.QueryRow(query, username).Scan(&userID)

	fmt.Println(err)

	if err == nil {
		/* Case: User exists in database.
		Check if password matches password_hash in database.
		If it does not, return an error message.
		*/
		query_getPassword := (`SELECT password_hash FROM users WHERE username = $1`)

		var passwordHash string
		db.QueryRow(query_getPassword, username).Scan(&passwordHash)

		if !checkPasswordHash(password, passwordHash) {
			return c.SendString("Password is incorrect!")
		} else {

			//Set session token and cookie
			sessionToken := generateToken(32)
			cookie := fiber.Cookie{
				Name:     "session_token",
				Value:    sessionToken,
				Expires:  time.Now().Add(24 * time.Hour),
				HTTPOnly: true,
			}

			c.Cookie(&cookie)

			fmt.Println("Login Successful, welcome existing user!")

			return c.JSON(fiber.Map{
				"message":       "User successfully logged in!",
				"redirect":      "http://localhost:3001/home",
				"session_token": sessionToken,
				"userid":        userID,
			})
		}
	}

	//might not even need the password
	hashedPassword, _ := hashPassword(password)

	//insert user into database
	secondQuery := (`INSERT INTO users (username, password_hash) 
					VALUES ($1, $2) RETURNING id`)

	error := db.QueryRow(secondQuery, username, hashedPassword).Scan(&userID)

	if error != nil {
		c.SendString("Error when inserting user into database")
	}

	//Set session token and cookie
	sessionToken := generateToken(32)

	cookie := fiber.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	fmt.Println("Login Successful! Welcome new user")

	// how to resolve the issue that client and server are running on different ports?!
	return c.JSON(fiber.Map{
		"message":       "User successfully logged in!",
		"redirect":      "http://localhost:3001/home",
		"session_token": sessionToken,
		"userid":        userID,
	})

}

func logout(c *fiber.Ctx) error {
	// Clear the session token cookie
	cookie := fiber.Cookie{
		Name:     "session_token",
		Value:    "",                 // Clear the cookie value
		Expires:  time.Now().Add(-1), // Set the cookie expiration to the past
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message": "User successfully logged out!",
	})
}

func CheckError(err error) {
	if err != nil {
		fmt.Println(err)
	}
}

func createBooksTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS books (
		id SERIAL PRIMARY KEY,
		title VARCHAR(100) NOT NULL,
		description VARCHAR(100) NOT NULL,
		user_id INTEGER,
		FOREIGN KEY (user_id) REFERENCES users(id)
	)`

	_, err := db.Exec(query)
	CheckError(err)
}

func createTagsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS tags (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	)`
	_, err := db.Exec(query)
	CheckError(err)
}

func createBookTagsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS booktags (
		book_id INTEGER,
		tag_id INTEGER,
		FOREIGN KEY (book_id) REFERENCES books(id),
		FOREIGN KEY (tag_id) REFERENCES tags(id),
		PRIMARY KEY (book_id, tag_id)
	)`
	_, err := db.Exec(query)
	CheckError(err)
}

func createUsersTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(100) NOT NULL,
		password_hash VARCHAR(60) NOT NULL
	)`
	_, err := db.Exec(query)
	CheckError(err)
}

func insertTags(db *sql.DB) {
	//hardcoded tags
	tags := []string{"Fiction", "Adventure", "Fantasy"}

	for _, tag := range tags {
		var count int
		checkQuery := `SELECT COUNT(*) FROM tags WHERE name = $1`
		err := db.QueryRow(checkQuery, tag).Scan(&count)
		if err != nil {
			fmt.Println("Error checking for existing tag:", err)
		}

		if count == 0 {
			query := `INSERT INTO tags (name) VALUES ($1)`
			_, err := db.Exec(query, tag)
			if err != nil {
				fmt.Println("There was an error when inserting data")
			}
		}
	}
}

func getBooks(db *sql.DB, data []Book) ([]Book, error) {
	rows, err := db.Query(`SELECT * FROM books`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var id int
		var title string
		var description string
		var userid int

		err := rows.Scan(&id, &title, &description, &userid)
		if err != nil {
			return nil, err
		}

		// LOOK AT JOIN QUERY TO FETCH TAGS ASSOCIATED WITH BOOKS!!!!
		tagQuery := (`SELECT booktags.book_id, tags.name from booktags
					  LEFT JOIN tags On booktags.tag_id = tags.id
					  WHERE booktags.book_id = $1`)

		tagRows, err := db.Query(tagQuery, id)

		if err != nil {
			return nil, err
		}

		var tags []string

		for tagRows.Next() {
			var id int
			var name string
			err := tagRows.Scan(&id, &name)

			if err != nil {
				return nil, err
			}

			tags = append(tags, name)

		}
		data = append(data, Book{id, title, description, tags})

	}
	return data, nil

}
