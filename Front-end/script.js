/* Script do site Aposte para o Bem (APS 2026) */

const $ = (id) => document.getElementById(id);

// Ações que aparecem em acoes.html
const acoes = [
  {
    titulo: "Campanha do alimento",
    categoria: "alimento",
    texto:
      "O interesse da campanha é arrecadar e entregar cestas básicas para as famílias mais necessitadas que não sabem se terão alimentos no final do mês.",
  },
  {
    titulo: "Reforço depois da escola",
    categoria: "educacao",
    texto:
      "Aulas de reforço, alfabetização e oficinas para crianças e adolescentes no contraturno.",
  },
  {
    titulo: "Varal solidário",
    categoria: "acolhimento",
    texto:
      "Cobertor, agasalho e item de higiene entregues nas regiões mais afastadas da cidade.",
  },
  {
    titulo: "Rede de voluntários",
    categoria: "acolhimento",
    texto:
      "Treinamos e organizamos voluntários para ajudar nos asilos e abrigos do bairro.",
  },
  {
    titulo: "Mochila cheia",
    categoria: "educacao",
    texto:
      "Kit escolar para nenhum aluno começar o ano sem caderno, lápis e mochila.",
  },
  {
    titulo: "Acolhimento de famílias",
    categoria: "acolhimento",
    texto: "Atendimento e ajuda imediata para famílias que perderam a casa.",
  },
];

// Nome de cada categoria e a missão correspondente no formulário de doação
const categorias = {
  alimento: "Alimentação",
  educacao: "Educação",
  acolhimento: "Acolhimento",
};

function renderAcoes(lista = acoes) {
  $("acoesGrid").innerHTML = lista
    .map(
      (a) => `
    <article class="acao">
      <span class="acao-cat">${categorias[a.categoria]}</span>
      <h3>${a.titulo}</h3>
      <p>${a.texto}</p>
      <a href="doar.html?missao=${encodeURIComponent(categorias[a.categoria])}" class="link-seta">Apoiar esta missão</a>
    </article>`,
    )
    .join("");
}

// Marca um botão como ativo dentro de um grupo
function ativar(seletor, botao) {
  document
    .querySelectorAll(seletor)
    .forEach((b) => b.classList.toggle("active", b === botao));
}

// Dados salvos no navegador (localStorage)
function ler(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao;
  } catch {
    return padrao;
  }
}
const gravar = (chave, valor) =>
  localStorage.setItem(chave, JSON.stringify(valor));
const getUsuarioLogado = () => ler("sessaoONG_APS", null);

const formatarMoeda = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function escapeHtml(texto) {
  return String(texto ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// Doações
function registrarDoacao(event) {
  event.preventDefault();
  const usuario = getUsuarioLogado();
  const valor = parseFloat($("doacao-valor").value);
  const tipo = $("doacao-tipo").value;
  if (!usuario || !(valor > 0)) return;

  const doacoes = ler("doacoesONG_APS", []);
  doacoes.unshift({
    usuarioEmail: usuario.email,
    valor,
    tipo,
    msg: $("doacao-msg").value.trim(),
    data: new Date().toLocaleDateString("pt-BR"),
  });
  gravar("doacoesONG_APS", doacoes);

  event.target.reset();
  ativar(".valor-btn", null);
  preencherDadosUsuario(usuario);
  renderDoacoes();
  mostrarAgradecimento(usuario.nome, valor, tipo);
}

// Histórico com apenas as doações da conta logada
function renderDoacoes() {
  const usuario = getUsuarioLogado();
  const doacoes = ler("doacoesONG_APS", []).filter(
    (d) => d.usuarioEmail === usuario?.email,
  );
  $("totalDoado").textContent =
    "Total: " +
    formatarMoeda(doacoes.reduce((soma, d) => soma + Number(d.valor || 0), 0));
  $("listaDoacoes").innerHTML = doacoes.length
    ? doacoes
        .map(
          (d) => `
    <div class="doacao-item">
      <div><strong>${escapeHtml(d.tipo)}</strong><span class="doacao-data">${d.data}</span></div>
      <div class="doacao-valor">${formatarMoeda(d.valor)}</div>
    </div>`,
        )
        .join("")
    : '<p class="vazio">Você ainda não fez nenhuma doação.</p>';
}

// Janela de agradecimento depois de doar. Fecha no botão, clicando fora ou com Esc
function mostrarAgradecimento(nome, valor, tipo) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modalAgradecimento";
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
      <button type="button" class="modal-x" aria-label="Fechar">×</button>
      <h3 id="modalTitulo">Muito obrigado, ${escapeHtml(nome.split(" ")[0])}!</h3>
      <p>Sua doação de <strong>${formatarMoeda(valor)}</strong> para <strong>${escapeHtml(tipo)}</strong> foi registrada e entra na próxima entrega.</p>
      <button type="button" class="btn btn-verde btn-full modal-fechar">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("modal-aberto");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.matches(".modal-x, .modal-fechar"))
      fecharAgradecimento();
  });
  overlay.querySelector(".modal-fechar").focus();
  document.addEventListener("keydown", fecharComEsc);
}

function fecharComEsc(e) {
  if (e.key === "Escape") fecharAgradecimento();
}

function fecharAgradecimento() {
  $("modalAgradecimento")?.remove();
  document.body.classList.remove("modal-aberto");
  document.removeEventListener("keydown", fecharComEsc);
}

// Pré-preenche (e trava) nome/e-mail com os dados da conta logada
function preencherDadosUsuario(usuario) {
  $("doacao-nome").value = usuario.nome;
  $("doacao-email").value = usuario.email;
  $("doacao-nome").readOnly = $("doacao-email").readOnly = true;
}

function copiarPix(botao) {
  navigator.clipboard?.writeText($("chavePix").textContent.trim()).then(() => {
    botao.textContent = "Chave copiada";
    setTimeout(() => (botao.textContent = "Copiar chave"), 2000);
  });
}

// Posts do blog
const posts = [
  {
    data: "2026-10-18",
    img: "photo-1593113598332-cd288d649433",
    titulo: "Mutirão de outubro monta 420 cestas em um único sábado",
    resumo:
      "Mais de 60 voluntários se revezaram no galpão do bairro para separar, embalar e entregar cestas básicas a famílias cadastradas.",
  },
  {
    data: "2026-10-02",
    img: "photo-1509062522246-3755977927d7",
    titulo: "Campanha de material escolar para 2027 já está aberta",
    resumo:
      "A meta é garantir mochila, cadernos e estojo completo para 300 estudantes antes do início do ano letivo.",
  },
  {
    data: "2026-09-15",
    img: "photo-1497486751825-1233686d5d80",
    titulo: "Reforço de leitura completa um ano com 85 crianças atendidas",
    resumo:
      "As turmas de sábado atendem crianças do 2º ao 5º ano que ainda leem com dificuldade.",
  },
  {
    data: "2026-07-20",
    img: "photo-1469571486292-0ba58a3f068b",
    titulo: "Campanha do agasalho distribui 1.200 peças no inverno",
    resumo:
      "Cobertores, casacos e meias foram entregues em abrigos e nas regiões mais afastadas da cidade nas semanas mais frias do ano.",
  },
  {
    data: "2026-06-08",
    img: "photo-1559027615-cd4628902d4a",
    titulo: "Como funciona o acolhimento de famílias que perderam a casa",
    resumo:
      "O que nós fazemos desde o primeiro contato até a família ser encaminhada para a assistência social.",
  },
  {
    data: "2026-05-02",
    img: "photo-1532629345422-7515f3d16bb6",
    titulo: "Prestação de contas do primeiro semestre de 2026",
    resumo:
      "De cada R$ 100 recebidos, R$ 78 foram direto para compras das famílias. Aqui está a divisão completa.",
  },
  {
    data: "2026-03-25",
    img: "photo-1488521787991-ed7bbaae773c",
    titulo: "Rede de voluntários ganha novo treinamento para abrigos",
    resumo: "São quatro encontros para quem quer ajudar nos asilos e abrigos.",
  },
  {
    data: "2026-03-12",
    img: "photo-1542810634-71277d95dcbb",
    titulo: "Lançamos a plataforma de doações com histórico na sua conta",
    resumo:
      "Agora cada doação fica registrada com data, valor e destino, e você acompanha tudo pelo seu perfil.",
  },
];

const cardPost = (p) => `
    <article class="post-card">
      <img src="https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=800&q=80" alt="" loading="lazy">
      <div class="post-card-corpo"><h3>${p.titulo}</h3><p>${p.resumo}</p></div>
      <div class="post-card-rodape"><time datetime="${p.data}">${new Date(p.data + "T12:00:00").toLocaleDateString("pt-BR")}</time></div>
    </article>`;

/* Cadastro e login
   Isso é só uma simulação no navegador, serve para o trabalho.
   Num site de verdade precisaria de servidor, banco de dados e
   senha guardada com bcrypt ou argon2. */

async function hashSenha(senha) {
  if (!window.crypto?.subtle) return btoa(unescape(encodeURIComponent(senha))); // alternativa simples (apenas demonstração)
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(senha),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function mostrarMsg(id, texto) {
  $(id).textContent = texto;
  $(id).className = "auth-msg" + (texto ? " erro" : "");
}

function entrarNaConta(nome, email) {
  gravar("sessaoONG_APS", { nome, email });
  location.href = "doar.html";
}

async function cadastrarUsuario(event) {
  event.preventDefault();
  const nome = $("cad-nome").value.trim();
  const email = $("cad-email").value.trim().toLowerCase();
  const senha = $("cad-senha").value;
  const usuarios = ler("usuariosONG_APS", []);

  if (senha.length < 6)
    return mostrarMsg(
      "cadastroMsg",
      "A senha precisa ter pelo menos 6 caracteres.",
    );
  if (senha !== $("cad-senha2").value)
    return mostrarMsg("cadastroMsg", "As senhas não conferem.");
  if (usuarios.some((u) => u.email === email))
    return mostrarMsg(
      "cadastroMsg",
      "Este e-mail já está cadastrado. Tente entrar.",
    );

  usuarios.push({
    nome,
    email,
    senhaHash: await hashSenha(senha),
    criadoEm: new Date().toISOString(),
  });
  gravar("usuariosONG_APS", usuarios);
  entrarNaConta(nome, email);
}

async function entrarUsuario(event) {
  event.preventDefault();
  const email = $("login-email").value.trim().toLowerCase();
  const usuario = ler("usuariosONG_APS", []).find((u) => u.email === email);
  if (
    !usuario ||
    usuario.senhaHash !== (await hashSenha($("login-senha").value))
  ) {
    return mostrarMsg("loginMsg", "E-mail ou senha incorretos.");
  }
  entrarNaConta(usuario.nome, usuario.email);
}

function trocarAbaAuth(aba) {
  $("loginForm").style.display = aba === "login" ? "block" : "none";
  $("cadastroForm").style.display = aba === "cadastro" ? "block" : "none";
  document
    .querySelectorAll("[data-auth]")
    .forEach((b) => b.classList.toggle("active", b.dataset.auth === aba));
  mostrarMsg("loginMsg", "");
  mostrarMsg("cadastroMsg", "");
}

// Cada página só roda a parte que usa
document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogado();

  // Menu do celular
  $("menuBtn")?.addEventListener("click", (e) => {
    const aberto = $("navLinks").classList.toggle("aberto");
    e.currentTarget.setAttribute("aria-expanded", aberto);
    e.currentTarget.textContent = aberto ? "Fechar" : "Menu";
  });

  // Botão "Entrar" da barra de navegação vira o nome quando há sessão
  if (usuario && $("navAuth")) {
    $("navAuth").textContent = usuario.nome.split(" ")[0];
    $("navAuth").title = "Minha conta";
  }

  // acoes.html
  if ($("acoesGrid")) {
    renderAcoes();
    document.querySelectorAll(".filter-tab").forEach((botao) =>
      botao.addEventListener("click", () => {
        ativar(".filter-tab", botao);
        const cat = botao.dataset.categoria;
        renderAcoes(
          cat === "todos" ? acoes : acoes.filter((a) => a.categoria === cat),
        );
      }),
    );
  }

  // doar.html: sem login mostra o convite para entrar; com login, formulário e histórico
  if ($("doacaoForm")) {
    ["doacaoForm", "tituloFormDoacao", "historicoBox"].forEach(
      (id) => ($(id).style.display = usuario ? "block" : "none"),
    );
    $("gateLogin").style.display = usuario ? "none" : "block";
    if (usuario) preencherDadosUsuario(usuario);
    renderDoacoes();

    // Links como doar.html?missao=Educação já chegam com a missão escolhida
    const missao = new URLSearchParams(location.search).get("missao");
    if ([...$("doacao-tipo").options].some((o) => o.value === missao))
      $("doacao-tipo").value = missao;

    $("doacaoForm").addEventListener("submit", registrarDoacao);
    $("copiarPix")?.addEventListener("click", (e) =>
      copiarPix(e.currentTarget),
    );
    document.querySelectorAll(".valor-btn").forEach((botao) =>
      botao.addEventListener("click", () => {
        $("doacao-valor").value = botao.dataset.valor;
        ativar(".valor-btn", botao);
      }),
    );
  }

  // contato.html
  $("contatoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mensagem enviada. Obrigado pelo contato!");
    e.target.reset();
  });

  // Blog: lista (blog.html) e 3 destaques na home
  if ($("blogGrid")) $("blogGrid").innerHTML = posts.map(cardPost).join("");
  if ($("blogDestaques"))
    $("blogDestaques").innerHTML = posts.slice(0, 3).map(cardPost).join("");

  // login.html
  if ($("loginForm")) {
    if (usuario) {
      $("loginForm").style.display = "none";
      document.querySelector(".auth-tabs").style.display = "none";
      $("authLogado").style.display = "block";
      $("authNomeLogado").textContent = "Olá, " + usuario.nome + "!";
      $("authEmailLogado").textContent = usuario.email;
      $("btnSair").addEventListener("click", () => {
        localStorage.removeItem("sessaoONG_APS");
        location.href = "index.html";
      });
    } else {
      $("loginForm").addEventListener("submit", entrarUsuario);
      $("cadastroForm").addEventListener("submit", cadastrarUsuario);
      document
        .querySelectorAll("[data-auth]")
        .forEach((b) =>
          b.addEventListener("click", () => trocarAbaAuth(b.dataset.auth)),
        );
      document.querySelectorAll("[data-auth-link]").forEach((a) =>
        a.addEventListener("click", (e) => {
          e.preventDefault();
          trocarAbaAuth(a.dataset.authLink);
        }),
      );
      if (location.hash === "#cadastro") trocarAbaAuth("cadastro");
    }
  }
});
