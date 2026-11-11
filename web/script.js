const psychologists = [
  {
    id: 1,
    nome: "Dra. Marina Lopes",
    email: "marina@portalterapia.com",
    crp: "CRP 06/123456",
    especialidade: "Terapia Cognitivo-Comportamental",
    anosExperiencia: 8,
    descricao: "Atendimento para ansiedade, estresse e organizacao emocional.",
    tipoAtendimento: "Psicoterapia individual",
    horarios: ["09:00", "10:30", "14:00"]
  },
  {
    id: 2,
    nome: "Dr. Rafael Nunes",
    email: "rafael@portalterapia.com",
    crp: "CRP 06/654321",
    especialidade: "Ansiedade e Estresse",
    anosExperiencia: 6,
    descricao: "Acolhimento para adultos em rotina de estudo, trabalho e mudancas.",
    tipoAtendimento: "Orientação psicológica",
    horarios: ["10:30", "16:00"]
  },
  {
    id: 3,
    nome: "Dra. Beatriz Campos",
    email: "beatriz@portalterapia.com",
    crp: "CRP 06/889900",
    especialidade: "Psicologia Clínica",
    anosExperiencia: 11,
    descricao: "Acompanhamento psicologico com foco em desenvolvimento pessoal.",
    tipoAtendimento: "Psicoterapia individual",
    horarios: ["09:00", "14:00", "16:00"]
  }
];

const state = {
  user: JSON.parse(localStorage.getItem("apo:user")) || null,
  token: localStorage.getItem("apo:token") || "",
  users: JSON.parse(localStorage.getItem("apo:users")) || [],
  appointments: JSON.parse(localStorage.getItem("apo:appointments")) || Array.from({ length: 30 }, (_, index) => {
    const psychologist = psychologists[index % psychologists.length];
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (index % 6));
    date.setDate(1 + ((index * 7) % 26));
    return {
      id: index + 1,
      psicologo: psychologist.nome,
      psicologoId: psychologist.id,
      psicologoEmail: psychologist.email,
      paciente: `Paciente ${index + 1}`,
      pacienteEmail: "",
      data: date.toISOString().slice(0, 10),
      horario: "14:00",
      status: ["confirmada", "agendada", "cancelada", "confirmada", "confirmada"][index % 5],
      tipoAtendimento: ["Psicoterapia individual", "Terapia de casal", "Orientação psicológica"][index % 3]
    };
  }),
  messages: JSON.parse(localStorage.getItem("apo:messages")) || [
    {
      id: 1,
      remetente: "Dra. Marina Lopes",
      texto: "Sua consulta está confirmada. Enviarei o link da sala no horário combinado.",
      data: "2026-05-14"
    }
  ]
};

const defaultApiUrl = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://localhost:3000/api"
  : "https://pscicologo-online.onrender.com/api";
const API_BASE_URL = (window.PORTAL_TERAPIA_API_URL || defaultApiUrl).replace(/\/$/, "");

function save() {
  localStorage.setItem("apo:user", JSON.stringify(state.user));
  localStorage.setItem("apo:token", state.token || "");
  localStorage.setItem("apo:users", JSON.stringify(state.users));
  localStorage.setItem("apo:appointments", JSON.stringify(state.appointments));
  localStorage.setItem("apo:messages", JSON.stringify(state.messages));
}

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.erro || "Erro ao comunicar com a API.");
  }

  return data;
}

function perfilId(perfil) {
  return {
    Administrador: 1,
    Psicólogo: 2,
    Paciente: 3
  }[perfil] || 3;
}

function perfilNome(perfil_id) {
  return {
    1: "Administrador",
    2: "Psicólogo",
    3: "Paciente"
  }[Number(perfil_id)] || "Paciente";
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  const agora = new Date();
  let idade = agora.getFullYear() - nascimento.getFullYear();
  const mes = agora.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && agora.getDate() < nascimento.getDate())) {
    idade -= 1;
  }
  return idade;
}

function normalizeUser(usuario) {
  return {
    id: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    perfil: perfilNome(usuario.perfil_id),
    perfil_id: Number(usuario.perfil_id),
    crp: usuario.crp,
    especialidade: usuario.especialidade,
    anosExperiencia: Number(usuario.anos_experiencia || 0),
    descricao: usuario.descricao_profissional || ""
  };
}

function formatCount(value, suffix = "") {
  const number = Number(value || 0);
  return `${number.toLocaleString("pt-BR")}${suffix}`;
}

function setStats({ profissionais, pacientes, especialidades }, source = "api") {
  $("#professionalsCount").textContent = formatCount(profissionais);
  $("#patientsCount").textContent = formatCount(pacientes);
  $("#specialtiesCount").textContent = formatCount(especialidades);

  document.querySelector(".stats-band").dataset.source = source;
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/estatisticas`);
    if (!response.ok) throw new Error("API indisponivel");

    const stats = await response.json();
    setStats(stats, "api");
  } catch (error) {
    setStats({
      profissionais: psychologists.length,
      pacientes: state.appointments.length,
      especialidades: new Set(psychologists.map((item) => item.especialidade)).size
    }, "demo");
  }
}

async function loadPsychologists() {
  try {
    const data = await apiRequest("/usuarios/psicologos");
    if (!data.length) return;

    psychologists.splice(0, psychologists.length, ...data.map((item) => ({
      id: item.id_usuario,
      nome: item.nome,
      email: item.email,
      crp: item.crp || "CRP não informado",
      especialidade: item.especialidade || "Psicologia Clínica",
      anosExperiencia: Number(item.anos_experiencia || 0),
      descricao: item.descricao_profissional || "Profissional cadastrado no Portal Terapia.",
      consultasRealizadas: Number(item.consultas_realizadas || 0),
      tipoPrincipal: item.tipo_principal || "Sem dados ainda",
      percentualTipoPrincipal: Number(item.percentual_tipo_principal || 0),
      horarios: ["09:00", "10:30", "14:00", "16:00"]
    })));
  } catch (error) {
    // Mantém os profissionais de demonstração quando a API não está disponível.
  }
}

function getProfessionalInsights(item) {
  if (Number.isFinite(Number(item.consultasRealizadas))) {
    return {
      consultations: Number(item.consultasRealizadas),
      type: item.tipoPrincipal || "Histórico em formação",
      percentage: Number(item.percentualTipoPrincipal || 0)
    };
  }

  const appointments = state.appointments.filter((appointment) => (
    appointment.psicologoId === item.id || appointment.psicologo === item.nome
  ) && appointment.status !== "cancelada");
  const byType = appointments.reduce((counts, appointment) => {
    const type = appointment.tipoAtendimento || item.tipoAtendimento || "Psicoterapia individual";
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const [type, count] = Object.entries(byType).sort((a, b) => b[1] - a[1])[0] || [];
  return {
    consultations: appointments.length,
    type: type || "Histórico em formação",
    percentage: appointments.length ? Math.round(count / appointments.length * 100) : 0
  };
}

function initials(name) {
  return String(name || "P").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function renderPsychologists() {
  const term = $("#searchInput").value.toLowerCase().trim();
  const specialty = $("#specialtyFilter").value;
  const minExperience = Number($("#experienceFilter").value || 0);
  const sortBy = $("#sortProfessionals").value;
  const grid = $("#psychologistGrid");

  const filtered = psychologists.map((item) => ({ item, insights: getProfessionalInsights(item) })).filter(({ item }) => {
    const matchesTerm = `${item.nome} ${item.especialidade}`.toLowerCase().includes(term);
    const matchesSpecialty = !specialty || item.especialidade === specialty;
    const matchesExperience = Number(item.anosExperiencia || 0) >= minExperience;
    return matchesTerm && matchesSpecialty && matchesExperience;
  });

  filtered.sort((a, b) => {
    if (sortBy === "experiencia") return Number(b.item.anosExperiencia || 0) - Number(a.item.anosExperiencia || 0);
    if (sortBy === "nome") return a.item.nome.localeCompare(b.item.nome, "pt-BR");
    return b.insights.consultations - a.insights.consultations;
  });

  const count = filtered.length;
  $("#catalogCount").textContent = formatCount(psychologists.length);
  $("#catalogResultLabel").textContent = `${count} ${count === 1 ? "perfil encontrado" : "perfis encontrados"}`;
  if (!count) {
    grid.innerHTML = '<div class="catalog-empty"><strong>Nenhum perfil encontrado</strong><span>Tente remover um filtro ou buscar outra especialidade.</span></div>';
    return;
  }

  grid.innerHTML = filtered.map(({ item, insights }) => `
    <article class="professional-card">
      <div class="professional-card-banner">
        <div class="professional-avatar" aria-hidden="true">${escapeHtml(initials(item.nome))}</div>
        <span class="professional-kind">Psicologia online</span>
      </div>
      <div class="professional-card-body">
        <div class="professional-profile-head">
          <div class="professional-name-group">
            <h3>${escapeHtml(item.nome)}</h3>
            <p class="professional-crp">${escapeHtml(item.crp || "CRP não informado")}</p>
          </div>
          <div class="experience-badge"><strong>${escapeHtml(item.anosExperiencia || 0)}</strong><span>anos de<br>experiência</span></div>
        </div>
        <span class="professional-specialty">${escapeHtml(item.especialidade)}</span>
        <p class="professional-bio">${escapeHtml(item.descricao || "Perfil profissional cadastrado na plataforma.")}</p>
        <div class="professional-stats-row">
          <div class="professional-stat"><strong>${formatCount(insights.consultations)}</strong><span>consultas na plataforma</span></div>
          <span class="stat-divider" aria-hidden="true"></span>
          <div class="professional-stat dominant-stat"><span>Tipo mais frequente</span><strong>${escapeHtml(insights.type)}</strong></div>
        </div>
        <div class="professional-share" aria-label="${escapeHtml(insights.percentage)}% das consultas são do tipo ${escapeHtml(insights.type)}">
          <div class="professional-share-label"><span>Participação desse tipo</span><strong>${escapeHtml(insights.percentage)}%</strong></div>
          <div class="professional-share-track"><span style="width:${Math.max(0, Math.min(100, insights.percentage))}%"></span></div>
        </div>
        <button class="primary-button professional-book-button" type="button" data-book="${escapeHtml(item.id)}">Agendar com profissional <span aria-hidden="true">→</span></button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.user) {
        $("#loginMessage").textContent = "Faça login ou cadastre-se para agendar uma consulta.";
        location.hash = "loginForm";
        return;
      }

      if (state.user.perfil !== "Paciente") {
        $("#scheduleMessage").textContent = "Apenas pacientes podem criar novos agendamentos.";
        location.hash = "agenda";
        return;
      }

      $("#schedulePsychologist").value = button.dataset.book;
      location.hash = "agendamento";
    });
  });
}

function refreshSpecialtyFilter() {
  const filter = $("#specialtyFilter");
  const selected = filter.value;
  const specialtiesInCatalog = [...new Set(psychologists.map((item) => item.especialidade))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  filter.innerHTML = `<option value="">Todas as especialidades</option>${specialtiesInCatalog
    .map((specialty) => `<option value="${escapeHtml(specialty)}">${escapeHtml(specialty)}</option>`).join("")}`;
  if (specialtiesInCatalog.includes(selected)) filter.value = selected;
}

function renderSelects() {
  const options = psychologists.map((item) => (
    `<option value="${item.id}">${item.nome} - ${item.especialidade}</option>`
  )).join("");

  $("#schedulePsychologist").innerHTML = options;
  $("#messageRecipient").innerHTML = options;
}

function renderAppointments() {
  const list = $("#appointmentsList");

  if (!state.user) {
    list.innerHTML = `<div class="appointment-row"><span>Faça login para visualizar suas consultas agendadas.</span></div>`;
    return;
  }

  const appointments = getVisibleAppointments();

  if (!appointments.length) {
    list.innerHTML = `<div class="appointment-row"><span>Nenhuma consulta agendada para este perfil.</span></div>`;
    return;
  }

  list.innerHTML = appointments.map((item) => `
    <article class="appointment-row">
      <div>
        <strong>${item.data} às ${item.horario}</strong><br>
        <span>${item.paciente} com ${item.psicologo}</span>
      </div>
      <div class="appointment-actions">
        <span class="status ${item.status}">${item.status}</span>
        <button class="secondary-button compact-button" type="button" ${item.status === "cancelada" ? "disabled" : ""}>Acessar consulta</button>
      </div>
    </article>
  `).join("");
}

async function loadAppointments() {
  if (!state.user || !state.token) {
    renderAppointments();
    return;
  }

  try {
    const data = await apiRequest("/consultas");
    state.appointments = data.map((item) => ({
      id: item.id_consulta,
      psicologo: item.psicologo_nome,
      psicologoId: item.psicologo_id,
      paciente: item.paciente_nome,
      pacienteEmail: state.user.perfil === "Paciente" ? state.user.email : "",
      data: String(item.data_consulta).slice(0, 10),
      horario: String(item.horario).slice(0, 5),
      status: item.status,
      tipoAtendimento: item.tipo_atendimento || "Psicoterapia individual"
    }));
    save();
  } catch (error) {
    // Se a API cair, mantém a agenda local já carregada.
  }

  renderAppointments();
}

function getVisibleAppointments() {
  const user = state.user;
  if (!user) return [];

  if (user.perfil === "Administrador") {
    return state.appointments;
  }

  if (user.perfil === "Psicólogo") {
    return state.appointments.filter((item) => (
      item.psicologoEmail === user.email ||
      item.psicologo === user.nome ||
      item.psicologoId === user.psicologoId
    ));
  }

  return state.appointments.filter((item) => (
    item.pacienteEmail === user.email ||
    item.paciente === user.nome
  ));
}

function renderMessages() {
  const list = $("#messagesList");

  list.innerHTML = state.messages.map((item) => `
    <article class="message-row">
      <strong>${item.remetente}</strong>
      <span>${item.texto}</span>
      <small>${item.data}</small>
    </article>
  `).join("");
}

function renderAuthArea() {
  const authArea = $("#authArea");
  if (!authArea) return;

  if (!state.user) {
    $("#adminNavLink").hidden = true;
    $("#painelAdmin").hidden = true;
    authArea.innerHTML = `
      <a class="secondary-button compact-button" href="#loginForm">Login</a>
      <a class="primary-button compact-button" href="#registerForm">Cadastre-se</a>
    `;
    return;
  }

  const isAdmin = state.user.perfil === "Administrador";
  $("#adminNavLink").hidden = !isAdmin;
  $("#painelAdmin").hidden = !isAdmin;
  if (isAdmin) loadAdminDashboard();

  authArea.innerHTML = `
    <span class="user-chip">${state.user.nome}</span>
    <button class="ghost-button compact-button" id="logoutButton" type="button">Sair</button>
  `;

  $("#logoutButton").addEventListener("click", () => {
    state.user = null;
    state.token = "";
    save();
    renderAuthArea();
    renderScheduleAccess();
    renderAppointments();
    $("#adminNavLink").hidden = true;
    $("#painelAdmin").hidden = true;
    $("#loginMessage").textContent = "Sessão encerrada.";
  });
}

function chartRows(items, totalKey = "total") {
  if (!items.length) return '<p class="empty-chart">Sem dados para este período.</p>';
  const max = Math.max(1, ...items.map((item) => Number(item[totalKey] || 0)));
  return items.map((item) => {
    const value = Number(item[totalKey] || 0);
    const label = item.nome || item.name || item.label || item.status || item.periodo || "Sem identificação";
    return `<div class="horizontal-row"><div class="horizontal-label"><span>${escapeHtml(label)}</span><strong>${value}</strong></div><div class="horizontal-track"><span style="width:${Math.max(value ? 5 : 0, value / max * 100)}%"></span></div></div>`;
  }).join("");
}

function localDashboardData() {
  const appointments = state.appointments;
  const countBy = (key) => Object.entries(appointments.reduce((counts, item) => {
    const label = item[key] || "Não informado";
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {})).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
  const monthCounts = {};
  appointments.forEach((item) => {
    const month = String(item.data || today()).slice(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const statuses = countBy("status");
  return {
    totais: {
      profissionais: psychologists.length,
      pacientes: new Set(appointments.map((item) => item.paciente)).size,
      consultas: appointments.length,
      confirmadas: appointments.filter((item) => item.status === "confirmada").length,
      pendentes: appointments.filter((item) => ["agendada", "pendente"].includes(item.status)).length,
      canceladas: appointments.filter((item) => item.status === "cancelada").length
    },
    porStatus: statuses,
    porMes: Object.entries(monthCounts).sort(([a], [b]) => a.localeCompare(b)).map(([periodo, total]) => ({ periodo, total })),
    porEspecialidade: Object.entries(psychologists.reduce((counts, item) => {
      counts[item.especialidade] = (counts[item.especialidade] || 0) + 1;
      return counts;
    }, {})).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total),
    porProfissional: countBy("psicologo"),
    porTipo: countBy("tipoAtendimento")
  };
}

function drawMonthly(items) {
  const months = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - offset));
    return date.toISOString().slice(0, 7);
  });
  const values = months.map((periodo) => ({ periodo, total: Number(items.find((item) => item.periodo === periodo)?.total || 0) }));
  const max = Math.max(1, ...values.map((item) => item.total));
  $("#monthlyChart").innerHTML = values.map((item) => {
    const [, month] = item.periodo.split("-");
    const label = new Date(`${item.periodo}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "short" });
    return `<div class="month-column"><strong>${item.total}</strong><span class="month-bar" style="height:${Math.max(4, item.total / max * 100)}%" title="${item.total} consultas"></span><small>${label}</small></div>`;
  }).join("");
}

function renderAdminDashboard(data, source) {
  const totals = data.totais;
  const metrics = [
    ["Profissionais", totals.profissionais, "psychologists"],
    ["Pacientes", totals.pacientes, "patients"],
    ["Consultas", totals.consultas, "calendar"],
    ["Confirmadas", totals.confirmadas, "check"],
    ["Pendentes", totals.pendentes, "clock"],
    ["Canceladas", totals.canceladas, "cancel"]
  ];
  $("#adminMetrics").innerHTML = metrics.map(([label, value, icon], index) => `<article class="metric-card metric-${icon}"><span class="metric-index">0${index + 1}</span><span class="metric-label">${label}</span><strong>${formatCount(value)}</strong></article>`).join("");
  drawMonthly(data.porMes || []);
  $("#statusChart").innerHTML = chartRows(data.porStatus || []);
  $("#specialtyChart").innerHTML = chartRows(data.porEspecialidade || []);
  $("#typeChart").innerHTML = chartRows(data.porTipo || []);
  $("#professionalChart").innerHTML = chartRows(data.porProfissional || []);
  $("#dashboardSource").textContent = source;
}

async function loadAdminDashboard() {
  if (state.user?.perfil !== "Administrador") return;
  const message = $("#dashboardMessage");
  try {
    if (!state.token) throw new Error("demo");
    const data = await apiRequest("/admin/indicadores");
    renderAdminDashboard(data, "Dados atualizados da plataforma");
    message.textContent = "";
  } catch (error) {
    renderAdminDashboard(localDashboardData(), "Demonstração local");
    message.textContent = error.message === "demo"
      ? "Exibindo dados fictícios para demonstração. Conecte a API para consultar o banco de dados."
      : "Não foi possível atualizar os indicadores da API. Exibindo os dados locais disponíveis.";
  }
}

function renderScheduleAccess() {
  const heroButton = $("#heroScheduleButton");
  const scheduleForm = $("#scheduleForm");
  const scheduleMessage = $("#scheduleMessage");

  if (heroButton) {
    heroButton.textContent = state.user
      ? state.user.perfil === "Paciente" ? "Agendar consulta" : "Ver agenda"
      : "Entrar para agendar";
    heroButton.href = state.user
      ? state.user.perfil === "Paciente" ? "#agendamento" : "#agenda"
      : "#loginForm";
  }

  if (scheduleForm) {
    const canSchedule = state.user?.perfil === "Paciente";
    scheduleForm.classList.toggle("is-locked", !canSchedule);
    scheduleForm.querySelectorAll("input, select, textarea, button").forEach((field) => {
      field.disabled = !canSchedule;
    });
  }

  if (scheduleMessage && !state.user) {
    scheduleMessage.textContent = "Faça login ou cadastre-se para liberar o agendamento.";
  } else if (scheduleMessage && state.user?.perfil !== "Paciente") {
    scheduleMessage.textContent = "Este perfil pode visualizar agenda, mas não criar consulta como paciente.";
  } else if (scheduleMessage && state.user?.perfil === "Paciente" && (
    scheduleMessage.textContent.includes("liberar") ||
    scheduleMessage.textContent.includes("perfil")
  )) {
    scheduleMessage.textContent = "";
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toggleProfessionalFields() {
  const isPsychologist = $("#profileSelect").value === "Psicólogo";
  const fields = $("#professionalFields");
  fields.hidden = !isPsychologist;
  fields.querySelectorAll("input").forEach((input) => {
    input.required = isPsychologist;
  });
}

function initForms() {
  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    const senha = String(data.get("senha"));

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      });

      state.token = response.token;
      state.user = normalizeUser(response.usuario);
      save();
      renderAuthArea();
      renderScheduleAccess();
      await loadAppointments();
      $("#loginMessage").textContent = `Sessão iniciada como ${state.user.nome}.`;
    } catch (error) {
      const registeredUser = state.users.find((item) => item.email === email && item.senha === senha);

      if (!registeredUser) {
        $("#loginMessage").textContent = error.message || "E-mail ou senha inválidos.";
        return;
      }

      state.user = {
        nome: registeredUser.nome,
        email,
        perfil: registeredUser.perfil,
        dataNascimento: registeredUser.dataNascimento,
        crp: registeredUser.crp,
        especialidade: registeredUser.especialidade
      };
      state.token = "";
      save();
      renderAuthArea();
      renderScheduleAccess();
      renderAppointments();
      $("#loginMessage").textContent = `Sessão iniciada como ${state.user.nome}.`;
    }
  });

  $("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    const senha = String(data.get("senha"));
    const confirmarSenha = String(data.get("confirmarSenha"));
    const perfil = data.get("perfil");

    if (senha !== confirmarSenha) {
      $("#registerMessage").textContent = "As senhas não conferem.";
      return;
    }

    if (state.users.some((item) => item.email === email)) {
      $("#registerMessage").textContent = "Este e-mail já está cadastrado.";
      return;
    }

    if (perfil === "Psicólogo" && (!data.get("crp") || !data.get("especialidade") || !data.get("documentoProfissional"))) {
      $("#registerMessage").textContent = "Informe CRP, especialidade e identificação profissional.";
      return;
    }

    const newUser = {
      nome: data.get("nome"),
      email,
      telefone: data.get("telefone"),
      dataNascimento: data.get("dataNascimento"),
      senha,
      perfil,
      crp: data.get("crp") || "",
      especialidade: data.get("especialidade") || "",
      anosExperiencia: Number(data.get("anosExperiencia") || 0),
      descricao: data.get("descricaoProfissional") || "",
      documentoProfissional: data.get("documentoProfissional") || ""
    };

    try {
      await apiRequest("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nome: newUser.nome,
          email: newUser.email,
          senha: newUser.senha,
          perfil_id: perfilId(newUser.perfil),
          telefone: newUser.telefone,
          idade: calcularIdade(newUser.dataNascimento),
          crp: newUser.crp,
          especialidade: newUser.especialidade,
          anos_experiencia: newUser.anosExperiencia,
          descricao_profissional: newUser.descricao
        })
      });

      const login = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: newUser.email, senha: newUser.senha })
      });

      state.token = login.token;
      state.user = normalizeUser(login.usuario);
      $("#registerMessage").textContent = "Cadastro criado no banco de dados.";
    } catch (error) {
      state.users.push(newUser);
      state.user = {
        ...newUser,
        senha: undefined
      };
      state.token = "";
      $("#registerMessage").textContent = "Cadastro salvo no protótipo local.";
    }

    save();
    await loadPsychologists();
    refreshSpecialtyFilter();
    renderSelects();
    renderPsychologists();
    renderAuthArea();
    renderScheduleAccess();
    await loadAppointments();
  });

  $("#scheduleForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.user) {
      $("#scheduleMessage").textContent = "Faça login ou cadastre-se para agendar uma consulta.";
      location.hash = "loginForm";
      return;
    }

    if (state.user.perfil !== "Paciente") {
      $("#scheduleMessage").textContent = "Apenas pacientes podem criar novos agendamentos.";
      return;
    }

    const data = new FormData(event.currentTarget);
    const selected = psychologists.find((item) => String(item.id) === data.get("psicologo"));

    try {
      if (!state.token) throw new Error("Sem token da API.");

      await apiRequest("/consultas", {
        method: "POST",
        body: JSON.stringify({
          psicologo_id: Number(selected.id),
          data_consulta: data.get("data"),
          horario: data.get("horario"),
          observacoes: data.get("observacoes"),
          tipo_atendimento: data.get("tipoAtendimento")
        })
      });

      await loadAppointments();
    } catch (error) {
      state.appointments.unshift({
        id: Date.now(),
        psicologo: selected.nome,
        psicologoId: selected.id,
        psicologoEmail: selected.email,
        paciente: state.user?.nome || "Paciente",
        pacienteEmail: state.user?.email || "",
        data: data.get("data"),
        horario: data.get("horario"),
        status: "agendada",
        tipoAtendimento: data.get("tipoAtendimento")
      });
    }

    save();
    renderAppointments();
    $("#scheduleMessage").textContent = "Consulta agendada com sucesso.";
  });

  $("#messageForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = psychologists.find((item) => String(item.id) === data.get("destinatario"));

    state.messages.unshift({
      id: Date.now(),
      remetente: state.user?.nome || "Paciente",
      texto: data.get("conteudo"),
      data: today(),
      destinatario: selected.nome
    });

    save();
    renderMessages();
    event.currentTarget.reset();
  });

  $("#searchInput").addEventListener("input", renderPsychologists);
  $("#specialtyFilter").addEventListener("change", renderPsychologists);
  $("#experienceFilter").addEventListener("change", renderPsychologists);
  $("#sortProfessionals").addEventListener("change", renderPsychologists);
  $("#profileSelect").addEventListener("change", toggleProfessionalFields);

  document.querySelectorAll("[data-requires-auth='true']").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (state.user) return;
      event.preventDefault();
      $("#loginMessage").textContent = "Faça login ou cadastre-se para acessar o agendamento.";
      location.hash = "loginForm";
    });
  });
}

async function init() {
  const birthDateInput = document.querySelector("input[name='dataNascimento']");
  const scheduleDateInput = document.querySelector("input[name='data']");

  if (birthDateInput) {
    birthDateInput.min = "1900-01-01";
    birthDateInput.max = today();
  }

  if (scheduleDateInput) {
    scheduleDateInput.min = today();
    scheduleDateInput.value = today();
  }

  await loadPsychologists();
  refreshSpecialtyFilter();
  renderSelects();
  renderPsychologists();
  await loadAppointments();
  renderMessages();
  renderAuthArea();
  renderScheduleAccess();
  loadStats();
  initForms();
  toggleProfessionalFields();
}

init();
