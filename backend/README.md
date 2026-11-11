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

## Endpoints principais

Todas as rotas usam o prefixo `/api`.

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/auth/registro` | Cadastro de paciente ou psicologo |
| POST | `/api/auth/login` | Login com e-mail e senha |
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
| GET | `/api/mensagens` | Lista conversas |
| POST | `/api/mensagens` | Envia mensagem |
| GET | `/api/mensagens/:userId` | Lista conversa com um usuario |

Use o token retornado no login:

```text
Authorization: Bearer SEU_TOKEN
```

Contas administrativas devem ser provisionadas pela equipe responsável e não podem ser abertas pelo cadastro público. Para preparar uma conta, cadastre primeiro um usuário e então atualize seu perfil no MySQL, por exemplo: `UPDATE atendimento_psicologico.usuario SET perfil_id = 1 WHERE email = 'admin@exemplo.com';`. Ao executar `npm run db:setup`, as colunas analíticas novas também são adicionadas a uma instalação existente.

Para preencher os gráficos com dados fictícios, execute `npm run db:seed-demo` depois do setup. A carga inclui 50 profissionais, 240 pacientes e até 1.250 consultas distribuídas em diferentes períodos; ela pode ser repetida sem criar cópias. Nenhum dado real ou observação clínica é inserido.
