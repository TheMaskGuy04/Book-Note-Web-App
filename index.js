import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";
import expressSession from "express-session";
// const pgSession = require('connect-pg-simple')(expressSession);
// import pgSession from "connect-pg-simple";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookNote",
  password: "user123",
  port: 5432,
});

db.connect();

// app.use(
//   expressSession({
//     store: new pgSession({
//       pool: db, // Connection pool
//       tableName: "user_sessions", // Use another table-name than the default "session" one
//       // Insert connect-pg-simple options here
//     }),
//     // secret: process.env.FOO_COOKIE_SECRET,
//     // OR
//     secret: "some secret",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
//     // Insert express-session options here
//   })
// );

let user_id = 0;
const URL = "https://covers.openlibrary.org/b/isbn/";

app.get("/", async (req, res) => {
  // const request = await axios.get("https://covers.openlibrary.org/b/isbn/0806541229-M.jpg", { responseType: 'arraybuffer' });

  // const result = request.data;
  // console.log(result);
  // // console.log('Image data length:', result.length);

  // res.render("index.ejs",
  // {
  //     img: result,
  // });

  res.render("login.ejs", { logIn: 1, register: 0 });
});

app.post("/logIn", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email + " " + password);

  try {
    const loginQuery = await db.query(
      "SELECT id FROM users WHERE username = $1 and password = $2",
      [email, password]
    );

    const result = loginQuery.rows;

    console.log(result);
    if (result.length == 0) {
      console.log("Wrong Credentials!");

      res.render("login.ejs", {
        logIn: 1,
        register: 0,
        error: "Wrong Credentials! Try Again",
      });
    } else {
      console.log("Successfully logged in!");

      user_id = result[0].id;

      res.redirect("/loggedIn");
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/registerPage", (req, res) => {
  res.render("login.ejs", { logIn: 0, register: 1 });
});

app.get("/logInPage", (req, res) => {
  res.render("login.ejs", { logIn: 1, register: 0 });
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email + " " + password);

  try {
    const loginQuery = await db.query(
      "SELECT id FROM users WHERE username = $1 and password = $2",
      [email, password]
    );

    const result = loginQuery.rows;

    console.log(result);
    if (result.length == 0) {
      const registrationQuery = await db.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [email, password]
      );

      console.log("You are registered");

      res.render("login.ejs", { logIn: 1, register: 0 });
    } else {
      console.log("Alreday anothers has registeres with these credentials :(");

      const id = result[0].id;

      console.log(result);

      res.render("login.ejs", {
        logIn: 0,
        register: 1,
        error: "Email or Password already taken! Try Again",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/loggedIn", async (req, res) => {
  console.log("user_id = " + user_id);
  const userId = user_id;
  console.log("userId = " + userId);

  try {
    const getBooksQuery = await db.query(
      "SELECT * FROM bookreview WHERE user_id = $1",
      [user_id]
    );

    const result = getBooksQuery.rows;

    // console.log(result);
    res.render("index.ejs", { result: result, user_id: user_id, seeNotes: 0 });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/newBook", async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const isbn = req.body.isbn;
  const date = req.body.date;
  const summary = req.body.summary;
  const notes = req.body.notes;
  const recommend = req.body.recommend;
  const imglink = URL + isbn + "-M.jpg";
  console.log(user_id);

  try {
    const insertQuery = await db.query(
      "INSERT INTO bookreview (title, author, date_read, recommend, isbn, summary, notes,user_id, imglink) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      [title, author, date, recommend, isbn, summary, notes, user_id, imglink]
    );

    const id = insertQuery.rows;

    console.log(id);

    res.redirect("/loggedIn");
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/notes", async (req, res) => {
  const id = req.body.id;

  console.log(id);

  try {
    const getNotesQuery = await db.query(
      "SELECT * FROM bookreview WHERE id = $1",
      [id]
    );

    const result = getNotesQuery.rows;

    res.render("index.ejs", { result: result, user_id: user_id, seeNotes: 1 });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/home", (req, res) => {
  console.log("user_id = " + user_id);

  res.redirect("/loggedIn");
});

app.get("/about", (req, res) => {
  console.log("user_id = " + user_id);

  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  console.log("user_id = " + user_id);

  res.render("contact.ejs");
});

app.get("/logout", (req, res) => {
  console.log("Before user_id = " + user_id);

  user_id = 0;
  console.log("After user_id = " + user_id);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Listening to Port ${port}`);
});

{
  /* <img class="bookImg" src="data:image/jpg;base64,<%= Buffer.from(result[i].imglink).toString('base64') %>" alt="Book Cover" ></img> */
}
