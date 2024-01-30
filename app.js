// app.js
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'aluno',
    database: 'mydb',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      throw err;
    }
    console.log('Conexão com o banco de dados MySQL estabelecida.');
  });
  
  app.use(
    session({
      secret: 'sua_chave_secreta',
      resave: true,
      saveUninitialized: true,
    })
  );

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');  

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND senha = ?';
  
    db.query(query, [email, senha], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.email = email;
        res.redirect('/admin');
      } else {
        res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
      }
    });
  });

  app.get('/admin', (req, res) => {
    if (req.session.loggedin) {
        // Se o usuário estiver logado, renderize a página admin
        res.render('admin');
    } else {
        // Se o usuário não estiver logado, redirecione para a página de login
        res.redirect('/login');
    }
});

  
  app.get('/teste', (req, res) => {
    db.query('SELECT * FROM postg', (err, result) => {
      if (err) throw err;
      res.render('padm', { postg: result });
    });
  });
  
  app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/sobre', (req, res) => {
    res.render('sobre');
});

app.get('/contato', (req, res) => {
    res.render('contato');
});

app.get('/postagens', (req, res) => {
    res.render('postagens');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});