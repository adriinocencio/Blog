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

app.use(session({
    secret: 'sua_chave_secreta',
    resave: true,
    saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

function verificaAutenticacao(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
}

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

// Rota para a página de admin
app.get('/admin', verificaAutenticacao, (req, res) => {
  // Buscar as postagens do banco de dados (assumindo que você tenha uma tabela 'postagens')
  db.query('SELECT * FROM postagens', (err, result) => {
      if (err) throw err;

      // Passar as postagens para o template 'admin'
      res.render('admin', { postagens: result });
  });
});


app.get('/editar-postagem/:id', verificaAutenticacao, (req, res) => {
    const postId = req.params.id;

    const query = 'SELECT * FROM postagens WHERE id = ?';
    db.query(query, [postId], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            res.render('editar-postagem', { postagem: result[0] });
        } else {
            res.send('Postagem não encontrada.');
        }
    });
});

app.post('/editar-postagem/:id', verificaAutenticacao, (req, res) => {
    const postId = req.params.id;
    const { titulo, conteudo } = req.body;

    const query = 'UPDATE postagens SET titulo = ?, conteudo = ? WHERE id = ?';
    db.query(query, [titulo, conteudo, postId], (err, result) => {
        if (err) throw err;
        console.log('Postagem editada com sucesso.');
        res.redirect('/admin');
    });
});

app.get('/excluir-postagem/:id', verificaAutenticacao, (req, res) => {
    const postId = req.params.id;

    const query = 'DELETE FROM postagens WHERE id = ?';
    db.query(query, [postId], (err, result) => {
        if (err) throw err;
        console.log('Postagem excluída com sucesso.');
        res.redirect('/admin');
    });
});

app.get('/api/postagens', (req, res) => {
    db.query('SELECT * FROM postagens', (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.delete('/api/excluir-postagem/:id', verificaAutenticacao, (req, res) => {
    const postId = req.params.id;

    const query = 'DELETE FROM postagens WHERE id = ?';
    db.query(query, [postId], (err, result) => {
        if (err) throw err;
        console.log('Postagem excluída com sucesso.');
        res.json({ message: 'Postagem excluída com sucesso.' });
    });
});

app.post('/criar-postagem', verificaAutenticacao, (req, res) => {
    const { titulo, conteudo } = req.body;

    const query = 'INSERT INTO postagens (titulo, conteudo) VALUES (?, ?)';
    db.query(query, [titulo, conteudo], (err, result) => {
        if (err) throw err;
        console.log('Postagem criada com sucesso.');
        res.redirect('/admin');
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

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});