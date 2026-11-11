# Portal Terapia - Plataforma de Atendimento Psicológico Online

Projeto Integrador desenvolvido como uma Prova de Conceito (PoC) para uma plataforma web de atendimento psicológico online. A solução conecta pacientes e psicólogos em um ambiente simples, organizado e responsivo, com cadastro, autenticação, agenda de consultas, disponibilidade de profissionais e troca de mensagens.
---

## 1. 👥 Integrantes do Grupo

| Nome | Função Principal |
| :--- | :--- |
| **Adeilson Barbosa de Lima Junior** | Análise e Modelagem |
| **Ailene dos Santos Bezerra** | Prototipação de Interfaces |
| **João Gabriel Felipe da Costa Melo** | Documentação Técnica |
| **Lucas Costa Silva** | Modelagem Relacional (SQL) |
| **Pedro Kenzo Rodrigues Tanaka** | Revisão e Integração |
| **Waltecio Allysson Dias de Oliveira** | Validação de Requisitos |

---
## Visão Geral

O Portal Terapia foi pensado para facilitar o acesso ao atendimento psicológico remoto. Pacientes podem encontrar profissionais, realizar cadastro, fazer login e agendar consultas. Psicólogos podem acompanhar seus atendimentos e gerenciar sua disponibilidade. Administradores têm uma visão mais ampla da operação da plataforma.

O projeto está dividido em duas partes principais:

- **Frontend:** site web navegável feito com HTML, CSS e JavaScript.
- **Backend:** API REST em Node.js, Express e MySQL, com autenticação JWT e senhas criptografadas.

## Funcionalidades

- Cadastro de pacientes, psicólogos e administradores.
- Login com e-mail e senha.
- Autenticação com JWT.
- Armazenamento seguro de senhas com bcryptjs.
- Listagem de psicólogos cadastrados.
- Indicadores dinâmicos de profissionais, pacientes e especialidades.
- Catálogo analítico de psicólogos com experiência, volume de consultas e tipo de atendimento mais frequente.
- Dashboard administrativo com consultas por mês, status, especialidade, tipo e profissional.
- Indicadores consolidados protegidos por autenticação e perfil de administrador.
- Agendamento de consultas.
- Visualização de consultas por perfil:
  - paciente visualiza apenas seus próprios agendamentos;
  - psicólogo visualiza apenas suas consultas;
  - administrador visualiza a agenda geral.
- Cancelamento e confirmação de consultas.
- Cadastro de disponibilidade do psicólogo.
- Troca de mensagens entre usuários.
- Interface responsiva para desktop e dispositivos móveis.

## Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- CORS
- dotenv

### Ferramentas

- Git e GitHub
- MySQL Workbench
- Visual Studio Code
- Figma como referência visual

## Estrutura do Projeto

```text
atendimento pscicologico/
├── backend/              # API REST com Node.js, Express e MySQL
│   ├── scripts/          # Scripts SQL e configuração inicial do banco
│   └── src/              # Código-fonte da API
├── web/                  # Site frontend do Portal Terapia
│   └── assets/           # Imagens e recursos visuais
├── docs/                 # Documentação final e arquivos de apoio
├── scripts/              # Scripts auxiliares do projeto
├── entrega/              # Arquivos originais usados como base da entrega
├── .gitignore
└── README.md
```

## Como Usar o Projeto

O projeto pode ser usado de duas formas:

- **Localmente, para desenvolvimento e apresentação técnica:** o frontend, a API e o MySQL rodam no computador.
- **Publicado na web, para acesso como um site comum:** o frontend fica hospedado online, a API fica em um servidor Node.js e o banco MySQL fica em nuvem.

O GitHub é usado para versionar e armazenar o código e os materiais da entrega. Esta versão é uma prova de conceito acadêmica executada localmente; não inclui hospedagem de API nem banco de dados em nuvem.

## Executar Localmente

### Frontend

O frontend pode ser aberto diretamente no navegador:

```text
web/index.html
```

Para usar os dados reais do banco, mantenha o backend rodando em:

```text
http://localhost:3000
```

Quando a API está disponível, o site busca estatísticas, usuários e consultas no MySQL. Caso a API esteja desligada, o frontend ainda funciona como protótipo navegável usando dados locais de demonstração.

O catálogo apresenta informações profissionais e indicadores agregados. Para visualizar o painel de demonstração, abra `web/index.html?demo=1` ou use o link **Painel de demonstração**. Essa visualização usa um snapshot fictício da base de demonstração e não é atualizada em tempo real. Ao executar a API local, o catálogo e o dashboard administrativo passam a consultar o MySQL; o endpoint `GET /api/admin/indicadores` exige JWT e perfil de administrador.

Contas administrativas não podem ser criadas pelo formulário público de cadastro. Para preparar uma conta administrativa para a apresentação, cadastre primeiro um usuário e, no MySQL, altere seu perfil: `UPDATE atendimento_psicologico.usuario SET perfil_id = 1 WHERE email = 'admin@exemplo.com';` (use o e-mail cadastrado).

### Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de ambiente a partir do exemplo:

```bash
copy .env.example .env
```

Configure o arquivo `backend/.env` com os dados do seu MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=atendimento_psicologico

JWT_SECRET=seu_segredo_jwt_muito_seguro_aqui
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

Crie o banco e as tabelas:

```bash
npm run db:setup
```

O comando também aplica as novas colunas de experiência, apresentação profissional e tipo de atendimento a bancos já existentes.

Para popular o banco com uma massa fictícia para análise, execute no backend:

```bash
npm run db:seed-demo
```

Isso cria 50 profissionais, 240 pacientes e até 1.250 consultas distribuídas ao longo de aproximadamente 18 meses. O comando pode ser repetido sem duplicar os registros de demonstração. Os pacientes usam contas fictícias sem senha conhecida e não contêm observações clínicas.

Inicie a API:

```bash
npm run dev
```

Ou, sem o nodemon:

```bash
npm start
```

Servidor padrão:

```text
http://localhost:3000
```

## Hospedagem e escopo

O repositório GitHub guarda o código-fonte e os materiais de apoio. O frontend, a API e o MySQL são executados localmente para demonstração. Esta entrega não configura publicação pública nem conexão a um banco em nuvem. O workflow do GitHub Pages foi removido e a publicação anterior foi retirada. Para conectar uma API em outra hospedagem, configure `window.PORTAL_TERAPIA_API_URL` antes de carregar `web/script.js`; sem essa variável, o frontend usa a API local em `http://localhost:3000/api` quando executado no computador.

## Banco de Dados

O projeto usa banco de dados relacional MySQL.

Principais entidades:

- `perfil`
- `usuario`
- `disponibilidade`
- `consulta`
- `mensagem`

O script de criação fica em:

```text
backend/scripts/database.sql
```

## Endpoints Principais

Todas as rotas da API usam o prefixo `/api`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/estatisticas` | Retorna total de profissionais, pacientes e especialidades |
| `GET` | `/api/admin/indicadores` | Retorna dados agregados do dashboard para administradores autenticados |
| `POST` | `/api/auth/registro` | Cadastra usuário |
| `POST` | `/api/auth/login` | Realiza login |
| `GET` | `/api/usuarios/psicologos` | Lista psicólogos cadastrados |
| `GET` | `/api/usuarios/perfil` | Retorna perfil do usuário autenticado |
| `PUT` | `/api/usuarios/perfil` | Atualiza perfil |
| `GET` | `/api/disponibilidades/:psicologoId` | Lista disponibilidade de um psicólogo |
| `POST` | `/api/disponibilidades` | Cadastra disponibilidade |
| `POST` | `/api/consultas` | Agenda uma consulta |
| `GET` | `/api/consultas` | Lista consultas do usuário autenticado |
| `PATCH` | `/api/consultas/:id/cancelar` | Cancela uma consulta |
| `PATCH` | `/api/consultas/:id/confirmar` | Confirma uma consulta |
| `GET` | `/api/mensagens` | Lista conversas |
| `POST` | `/api/mensagens` | Envia mensagem |

Rotas protegidas exigem token JWT no cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

## Contas de Teste

Após configurar o banco com os dados de exemplo, é possível testar os perfis abaixo:

| Perfil | E-mail | Senha |
|---|---|---|
| Paciente | `ana@email.com` | `123456` |
| Psicóloga | `marina@portalterapia.com` | `123456` |
| Psicólogo | `rafael@portalterapia.com` | `123456` |
| Psicóloga | `beatriz@portalterapia.com` | `123456` |
| Administrador | `admin@portalterapia.com` | `123456` |

## Requisitos do Projeto

### Requisitos Funcionais

- Cadastro de pacientes e psicólogos.
- Login e logout de usuários.
- Atualização de perfil.
- Definição de horários disponíveis.
- Listagem de psicólogos.
- Agendamento, visualização, confirmação e cancelamento de consultas.
- Troca de mensagens entre usuários.

### Requisitos Não Funcionais

- Interface responsiva.
- Senhas criptografadas.
- Autenticação com JWT.
- Banco de dados MySQL.
- Compatibilidade com navegadores modernos.
- Código versionado com Git.

## Documento Final

A documentação final do Projeto Integrador fica na pasta:

```text
docs/
```

Essa pasta concentra os materiais de entrega, diagramas e arquivos de apoio usados para a versão final em PDF.

## Segurança

O arquivo `backend/.env` contém dados sensíveis e não deve ser enviado para o GitHub. O repositório inclui apenas o modelo:

```text
backend/.env.example
```

## Status da PoC

A Prova de Conceito contempla as principais funcionalidades propostas:

- cadastro e autenticação;
- integração com MySQL;
- agenda de consultas;
- perfis de paciente, psicólogo e administrador;
- disponibilidade dos profissionais;
- estatísticas reais carregadas do banco;
- protótipo web alinhado ao layout visual do Portal Terapia.

## Próximas Melhorias

- Publicar o frontend em uma plataforma web.
- Hospedar a API em ambiente online.
- Usar um banco MySQL em nuvem.
- Implementar videochamada.
- Adicionar recuperação de senha.
- Criar painel administrativo completo.
- Adicionar testes automatizados.

## Autor

Projeto desenvolvido para o Projeto Integrador do curso de Desenvolvimento de Sistemas Orientado a Dispositivos Móveis e Baseados na Web.
