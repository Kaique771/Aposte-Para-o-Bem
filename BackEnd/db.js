// CAMADA DE DADOS TEMPORÁRIA (para a Alana e Gabrielly substituírem depois)
// Instruções para Alana e Gabrielly:
// 1. Mantenham os nomes das funções, os parâmetros e as chaves dos objetos retornados exatamente iguais.
// 2. No banco SQL, salvem datas como TIMESTAMP/DATETIME, mas retornem o campo "data" das doações
//    formatado em "DD/MM/AAAA" (pt-BR), pois o frontend exibe esse valor direto na tela.

const usuarios = [];
const doacoes = [];
const contatos = [];

let nextUsuarioId = 1;
let nextDoacaoId = 1;
let nextContatoId = 1;

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

module.exports = {
    // Usado pelo login.html (Deve retornar { id, nome, email, senhaHash, criadoEm } ou undefined/null)
    buscarUsuarioPorEmail: async (email) => {
        const emailLimpo = normalizarEmail(email);
        return usuarios.find(u => u.email === emailLimpo);
    },

    // Usado pelo login.html (Deve inserir na tabela usuarios e retornar o objeto criado com id)
    criarUsuario: async ({ nome, email, senhaHash }) => {
        const novo = {
            id: nextUsuarioId++,
            nome,
            email: normalizarEmail(email),
            senhaHash,
            criadoEm: new Date().toISOString()
        };
        usuarios.push(novo);
        return novo;
    },

    // Usado pelo doar.html (Deve retornar array de { id, usuarioEmail, valor, tipo, msg, data }, mais recente primeiro)
    listarDoacoesPorUsuario: async (usuarioEmail) => {
        const emailLimpo = normalizarEmail(usuarioEmail);
        return doacoes.filter(d => d.usuarioEmail === emailLimpo);
    },

    // Usado pelo doar.html (Deve inserir na tabela doacoes e retornar o registro criado)
    criarDoacao: async ({ usuarioEmail, valor, tipo, msg }) => {
        const nova = {
            id: nextDoacaoId++,
            usuarioEmail: normalizarEmail(usuarioEmail),
            valor: Number(valor),
            tipo: tipo || 'Geral',
            msg: msg || '',
            data: new Date().toLocaleDateString('pt-BR')
        };
        doacoes.unshift(nova); // No SQL: ORDER BY data_criacao DESC
        return nova;
    },

    // Usado pelo contato.html (Deve inserir na tabela contatos e retornar o registro criado)
    criarContato: async ({ nome, email, mensagem }) => {
        const novo = {
            id: nextContatoId++,
            nome,
            email: normalizarEmail(email),
            mensagem,
            data: new Date().toISOString()
        };
        contatos.push(novo);
        return novo;
    }
};