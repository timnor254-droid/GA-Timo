const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

// Gör att vi kan läsa form-data (t.ex. från HTML-formulär eller JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurera sessionen
app.use(session({
  secret: 'BYT_UT_DENNA_NYCKEL_TILL_EN_EGEN_HEMLIG_STRÄNG',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // Inloggad i 1 timme
}));

// Dummy-användare för test
const USER = {
  username: 'admin',
  password: 'password123'
};

// Middleware för att skydda sidor
function kräverInloggning(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.status(401).send('Du måste logga in för att se denna sida. <a href="/">Till inloggning</a>');
  }
}

// 1. Startsida med inloggningsformulär
app.get('/', (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/hemlig-sida');
  }

  res.send(`
    <h2>Logga in</h2>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Användarnamn (admin)" required><br><br>
      <input type="password" name="password" placeholder="Lösenord (password123)" required><br><br>
      <button type="submit">Logga in</button>
    </form>
  `);
});

// 2. Inloggnings-route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    req.session.isLoggedIn = true;
    req.session.user = username;
    res.redirect('/hemlig-sida');
  } else {
    res.send('Fel användarnamn eller lösenord! <a href="/">Försök igen</a>');
  }
});

// 3. Skyddad sida (visas bara om du är inloggad)
app.get('/hemlig-sida', kräverInloggning, (req, res) => {
  res.send(`
    <h1>Välkommen ${req.session.user}!</h1>
    <p>Detta är en skyddad sida som bara inloggade kan se.</p>
    <form method="POST" action="/logout">
      <button type="submit">Logga ut</button>
    </form>
  `);
});

// 4. Utloggning
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Servern körs på http://localhost:3000');
});