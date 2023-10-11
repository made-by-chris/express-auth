import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { engine } from "express-handlebars";

const app = express();
const port = 9001;

// Initialize session
app.use(
  session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: null,
  })
);

app.set("view engine", "handlebars");

//
app.use(express.json());
// form data
app.use(express.urlencoded({ extended: false }));

// Mock database
const users = [];

// Routes
app.get("/", (req, res) => {
  if (req.session.username) {
    res.render("profile", { username: req.session.username });
  } else {
    res.render("login");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.username = username;
    res.redirect("/");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  users.push({ username, password: hashedPassword });
  req.session.username = username;
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
