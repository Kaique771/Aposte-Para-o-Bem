const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Conecta o servidor diretamente à sua pasta Site2
app.use(express.static(path.join(__dirname, '../Site2')));

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

// --- ROTA 1: CADASTRO (login.html) ---
app.post('/api/usuarios', async (req, res) => {
    try {
        const nome = String(req.body.nome || '').trim();
        const email = normalizarEmail(req.body.email);
        const senhaHash = String(req.body.senhaHash || '').trim();

        if (!nome || !email || !senhaHash) {
            return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
        }
        const existe = await db.buscarUsuarioPorEmail(email);
        if (existe) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado. Tente entrar.' });
        }
        const usuario = await db.criarUsuario({ nome, email, senhaHash });
        res.status(201).json({
            mensagem: 'Cadastro feito!',
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
    }
});

// --- ROTA 2: LOGIN (login.html) ---
app.post('/api/login', async (req, res) => {
    try {
        const email = normalizarEmail(req.body.email);
        const senhaHash = String(req.body.senhaHash || '').trim();

        if (!email || !senhaHash) {
            return res.status(400).json({ erro: 'Informe e-mail e senha.' });
        }
        const usuario = await db.buscarUsuarioPorEmail(email);

        if (!usuario || usuario.senhaHash !== senhaHash) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }
        res.json({
            mensagem: 'Bem-vindo!',
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno no login.' });
    }
});

// --- ROTA 3: LISTAR DOAÇÕES DO USUÁRIO (doar.html) ---
app.get('/api/doacoes', async (req, res) => {
    try {
        const email = normalizarEmail(req.query.email);
        if (!email) return res.json([]);
        const lista = await db.listarDoacoesPorUsuario(email);
        res.json(lista);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar histórico de doações.' });
    }
});

// --- ROTA 4: REGISTRAR DOAÇÃO (doar.html) ---
app.post('/api/doacoes', async (req, res) => {
    try {
        const usuarioEmail = normalizarEmail(req.body.usuarioEmail);
        const valor = Number(req.body.valor);
        const tipo = String(req.body.tipo || 'Geral').trim();
        const msg = String(req.body.msg || '').trim();

        if (!usuarioEmail || !(valor > 0)) {
            return res.status(400).json({ erro: 'Informe um valor válido para doar.' });
        }

        // Garante integridade referencial antes de chamar o banco
        const usuarioExiste = await db.buscarUsuarioPorEmail(usuarioEmail);
        if (!usuarioExiste) {
            return res.status(404).json({ erro: 'Usuário não encontrado. Faça login novamente.' });
        }

        const doacao = await db.criarDoacao({ usuarioEmail, valor, tipo, msg });
        res.status(201).json({ mensagem: 'Doação registrada!', doacao });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar doação.' });
    }
});

// --- ROTA 5: CONTATO (contato.html) ---
app.post('/api/contato', async (req, res) => {
    try {
        const nome = String(req.body.nome || '').trim();
        const email = normalizarEmail(req.body.email);
        const mensagem = String(req.body.mensagem || '').trim();

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ erro: 'Preencha todos os campos.' });
        }
        await db.criarContato({ nome, email, mensagem });
        res.status(201).json({ mensagem: 'Mensagem enviada. Obrigado pelo contato!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
    }
});

// Liga o servidor
app.listen(3000, () => {
    console.log('✅ Backend rodando! Acesse seu site em: http://localhost:3000/index.html');
});