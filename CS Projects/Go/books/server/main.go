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
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Author   string `json:"author"`
	Quantity int    `json:"quantity"`
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
		AllowOrigins: "http://localhost:3001",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlconn)
	CheckError(err)

	defer db.Close()

	createBooksTable(db)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Ok")
	})

	app.Get("home", home)

	app.Post("/api", func(c *fiber.Ctx) error {
		book := &Book{}

		err := c.BodyParser(book)
		if err != nil {
			return err
		}

		insertBook(db, *book)

		return c.Status(fiber.StatusCreated).JSON(book)

	})

	app.Get("/books", func(c *fiber.Ctx) error {
		data := []Book{}
		data, err := getBooks(db, data)

		if err != nil {
			return err
		}

		return c.Status(fiber.StatusCreated).JSON(data)
	})

	createUsersTable(db)

	app.Post("/login", login)

	app.Listen(":3000")
}

func home(c *fiber.Ctx) error {
	return c.SendString("Welcome to your dashboard!")
}

func login(c *fiber.Ctx) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	//check if user already exists
	query := (`SELECT 1 FROM USERS
			  WHERE username = $1`)

	var exists bool
	err := db.QueryRow(query, username).Scan(&exists)

	if err != sql.ErrNoRows {
		/* Case: User exists in database.
		Check if password matches password_hash in database.
		If it does not, return an error message.
		*/
		query_getPassword := (`SELECT password_hash FROM users WHERE username = $1`)

		var passwordHash string
		newerr := db.QueryRow(query_getPassword, username).Scan(&passwordHash)

		fmt.Println(newerr)

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

			return c.JSON(fiber.Map{
				"message":       "User successfully logged in!",
				"redirect":      "http://localhost:3001/home",
				"session_token": sessionToken,
			})
		}
	}

	//might not even need the password
	hashedPassword, _ := hashPassword(password)

	//insert user into database
	secondQuery := (`INSERT INTO users (username, password_hash) 
					VALUES ($1, $2)`)

	error := db.QueryRow(secondQuery, username, hashedPassword)

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

	// how to resolve the issue that client and server are running on different ports?!
	return c.JSON(fiber.Map{
		"message":       "User successfully logged in!",
		"redirect":      "http://localhost:3001/home",
		"session_token": sessionToken,
	})

}

func CheckError(err error) {
	if err != nil {
		panic(err)
	}
}

func createBooksTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS books (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		author VARCHAR(100) NOT NULL,
		quantity INTEGER
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

func insertBook(db *sql.DB, book Book) int {
	query := `INSERT INTO books (name, author, quantity)
		VALUES ($1, $2, $3) RETURNING id`

	var pk int
	err := db.QueryRow(query, book.Name, book.Author, book.Quantity).Scan(&pk)
	CheckError(err)

	return pk
}

func getBooks(db *sql.DB, data []Book) ([]Book, error) {
	rows, err := db.Query(`SELECT * FROM books`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var id int
		var name string
		var author string
		var quantity int

		err := rows.Scan(&id, &name, &author, &quantity)
		if err != nil {
			return nil, err
		}
		data = append(data, Book{id, name, author, quantity})

	}
	fmt.Println(data)
	return data, nil

}
