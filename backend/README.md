# Backend - Plataforma de Atendimento Psicologico Online

API REST em Node.js, Express e MySQL para a Prova de Conceito do Projeto Integrador.

## Requisitos

- Node.js 18+
- MySQL

## Configuracao

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` in `.env` to enable password recovery. Set `APP_URL` to the public address of `web/index.html`; production URLs must use HTTPS. Reset tokens are single-use, expire after one hour and are sent by e-mail.

For a cloud MySQL database, set `DB_SSL=true`. Certificate verification remains enabled. If the provider requires a custom CA certificate, set `DB_SSL_CA_PATH` to its local file path. Keep `DB_SSL=false` for a local MySQL server.

The psychologist confirms an appointment before its participants can request its video room. The current demo uses Jitsi (`JITSI_DOMAIN`) and sends the call to an external provider; do not use this public demo integration for real clinical sessions or sensitive patient data.

## Endpoints principais

Todas as rotas usam o prefixo `/api`.

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/auth/registro` | Cadastro de paciente ou psicologo |
| POST | `/api/auth/login` | Login com e-mail e senha |
| POST | `/api/auth/esqueci-senha` | Solicita link de redefinição por e-mail |
| POST | `/api/auth/redefinir-senha` | Redefine a senha com token de uso único |
| GET | `/api/estatisticas` | Resumo público de profissionais, pacientes e especialidades |
| GET | `/api/admin/indicadores` | Indicadores agregados, somente para administradores autenticados |
| GET | `/api/usuarios/psicologos` | Lista psicologos disponiveis |
| GET | `/api/usuarios/perfil` | Exibe perfil do usuario autenticado |
| PUT | `/api/usuarios/perfil` | Atualiza perfil |
| GET | `/api/disponibilidades/:psicologoId` | Lista horarios de um psicologo |
| POST | `/api/disponibilidades` | Cadastra disponibilidade do psicologo |
| DELETE | `/api/disponibilidades/:id` | Remove disponibilidade |
| POST | `/api/consultas` | Agenda consulta |
| GET | `/api/consultas` | Lista consultas do usuario autenticado |
| PATCH | `/api/consultas/:id/cancelar` | Cancela consulta |
| PATCH | `/api/consultas/:id/confirmar` | Confirma consulta |
| GET | `/api/consultas/:id/sala` | Retorna a sala de vídeo a um dos participantes da consulta confirmada |
| GET | `/api/mensagens` | Lista conversas |
| POST | `/api/mensagens` | Envia mensagem |
| GET | `/api/mensagens/:userId` | Lista conversa com um usuario |

Use o token retornado no login:

```text
Authorization: Bearer SEU_TOKEN
```

Contas administrativas devem ser provisionadas pela equipe responsável e não podem ser abertas pelo cadastro público. Para preparar uma conta, cadastre primeiro um usuário e então atualize seu perfil no MySQL, por exemplo: `UPDATE atendimento_psicologico.usuario SET perfil_id = 1 WHERE email = 'admin@exemplo.com';`. Ao executar `npm run db:setup`, as colunas analíticas novas também são adicionadas a uma instalação existente.

Para preencher os gráficos com dados fictícios, execute `npm run db:seed-demo` depois do setup. A carga inclui 50 profissionais, 240 pacientes e até 1.250 consultas distribuídas em diferentes períodos; ela pode ser repetida sem criar cópias. Nenhum dado real ou observação clínica é inserido.
