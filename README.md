<div align="center">

<img src="web/assets/layout/psicologia-online.png" alt="Ilustração do Portal Terapia: atendimento psicológico online" width="820">

<h1>🪷 Portal Terapia</h1>

<h3>Plataforma de Atendimento Psicológico Online</h3>

<p><strong>Projeto Integrador • Prova de Conceito acadêmica</strong></p>

<p>
  <a href="https://senacsp.blackboard.com/webapps/blackboard/execute/courseMain?course_id=_317889_1" title="STADCAS5DA_2603-2603-686302 2603-PROJETO INTEGRADOR: ANÁLISE DE SOLUÇÕES INTEGRADAS PARA ORGANIZAÇÕES"><strong>PROJETO INTEGRADOR: ANÁLISE DE SOLUÇÕES INTEGRADAS PARA ORGANIZAÇÕES</strong></a><br>
  Centro Universitário Senac — Santo Amaro
</p>

<p>
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-087985?style=for-the-badge" alt="Frontend: HTML, CSS e JavaScript">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-176B61?style=for-the-badge" alt="Backend: Node.js e Express">
  <img src="https://img.shields.io/badge/Banco-MySQL-17617A?style=for-the-badge" alt="Banco de dados: MySQL">
  <img src="https://img.shields.io/badge/Status-PoC%20acad%C3%AAmica-657C6D?style=for-the-badge" alt="Status: prova de conceito acadêmica">
</p>

<p>
  Uma experiência digital para aproximar pacientes e psicólogos, organizar consultas e dar visibilidade a dados agregados da plataforma.
</p>

</div>

---

## 🧭 Navegação

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#painéis-visuais-e-análise-dos-profissionais">Painéis</a> ·
  <a href="#videochamada">Videochamada</a> ·
  <a href="#recuperação-de-senha">Recuperação de senha</a> ·
  <a href="#como-usar-o-projeto">Como abrir</a> ·
  <a href="#executar-localmente">Execução local</a>
</p>

> **Em resumo:** catálogo analítico de profissionais, dashboard administrativo, agendamento de consultas, recuperação de senha por e-mail e acesso demonstrativo a videochamadas Jitsi.

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
## Sobre o projeto

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
- Recuperação de senha por e-mail com token de uso único e expiração.
- Videochamada de demonstração após confirmação da consulta.
- Agendamento de consultas.
- Visualização de consultas por perfil:
  - paciente visualiza apenas seus próprios agendamentos;
  - psicólogo visualiza apenas suas consultas;
  - administrador visualiza a agenda geral.
- Cancelamento e confirmação de consultas.
- Cadastro de disponibilidade do psicólogo.
- Troca de mensagens entre usuários.
- Interface responsiva para desktop e dispositivos móveis.

## Funcionalidades em detalhe

### Painéis visuais e análise dos profissionais

O projeto apresenta duas formas de visualizar os dados da plataforma:

- **Catálogo analítico de psicólogos:** reúne os perfis profissionais e permite buscar por nome ou especialidade, filtrar por área e experiência e ordenar os resultados. Os cartões mostram apresentação, experiência, volume de consultas e tipo de atendimento mais frequente. O catálogo apresenta até 10 profissionais por página.
- **Dashboard administrativo:** apresenta cartões com totais de profissionais, pacientes e consultas, além de gráficos de consultas por mês, situação dos agendamentos, especialidades, tipos de atendimento e volume por profissional. O acesso aos indicadores da API exige autenticação e perfil de administrador.
- **Modo de demonstração:** pode ser aberto com `web/index.html?demo=1`. Usa dados fictícios locais para visualizar o catálogo e os gráficos sem conectar a API. Esse snapshot é estático e não representa dados atualizados em tempo real.
- **Modo integrado:** com API e MySQL em execução, as estatísticas e os indicadores são carregados do banco. A carga de demonstração pode ser criada com `npm run db:seed-demo`; ela não usa dados clínicos reais.

Os painéis exibem dados agregados e não mostram observações clínicas. Os dados de demonstração servem apenas para apresentação acadêmica.

### Videochamada

1. O paciente agenda uma consulta e aguarda a confirmação do psicólogo.
2. Ao confirmar, o backend cria um identificador aleatório para a sala Jitsi e guarda o link na consulta.
3. Depois de entrar na conta, o paciente ou o psicólogo participante pode selecionar **Acessar consulta** na agenda.
4. A API só entrega o link se o usuário estiver vinculado à consulta e ela estiver confirmada. A interface abre a sala em uma janela dentro do site.

O endpoint da sala é `GET /api/consultas/:id/sala`; a confirmação é feita por `PATCH /api/consultas/:id/confirmar`. O domínio é configurado por `JITSI_DOMAIN` e, por padrão, usa `meet.jit.si`. Áudio e vídeo são fornecidos pelo Jitsi, um serviço externo; o projeto não hospeda servidor de mídia próprio. O acesso depende de conexão com a internet e das permissões de câmera e microfone do navegador.

Esta integração é uma prova de conceito acadêmica. Não use a demonstração para transmitir dados clínicos reais ou informações sensíveis.

### Recuperação de senha

Na tela de login, **Esqueci minha senha** inicia o envio de um link ao e-mail cadastrado. O usuário abre o link e define uma senha nova com pelo menos oito caracteres. A API oferece os endpoints `POST /api/auth/esqueci-senha` e `POST /api/auth/redefinir-senha`.

O token é aleatório, válido por uma hora e de uso único. O banco armazena somente seu hash SHA-256; após a redefinição, o hash e o prazo são removidos. A senha nova é armazenada com bcrypt, custo 10. A resposta inicial não revela se o e-mail existe, reduzindo a enumeração de contas. Se o envio falhar após a geração do token, a API remove o token pendente.

Para demonstrar a entrega do e-mail, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` e `APP_URL` em `backend/.env`. A configuração de produção deve usar `APP_URL` com HTTPS. Sem credenciais SMTP válidas, não é possível demonstrar o envio real do link.

> Não coloque credenciais SMTP, senha de banco ou outros segredos no README ou no GitHub. Use `backend/.env` local e mantenha esse arquivo fora do repositório.

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

Esta versão do projeto é uma prova de conceito acadêmica executada localmente. O GitHub armazena o código e os materiais da entrega, mas não executa a aplicação nem hospeda sua API ou o banco de dados.

Para uma visualização rápida, baixe o ZIP, extraia a pasta e abra `web/index.html` no navegador. Para usar os recursos integrados, execute também a API e o MySQL conforme as instruções abaixo. Uma publicação pública exigiria hospedar separadamente o frontend, a API e o banco; isso não está configurado neste repositório.

## Executar Localmente

### Frontend

Para visualizar o site sem instalar ferramentas de desenvolvimento:

1. Abra o repositório no GitHub e selecione **Code → Download ZIP**.
2. Extraia o arquivo ZIP no computador.
3. Abra a pasta extraída, entre em `web` e abra `index.html` no navegador.

O arquivo de entrada do site é:

```text
web/index.html
```

O catálogo e os painéis de demonstração usam dados fictícios no modo local. Para abrir diretamente o painel de demonstração, use `web/index.html?demo=1` no navegador. Abrir o HTML não inicia a API nem o MySQL; login, agenda integrada, recuperação de senha por e-mail e videochamada dependem do backend configurado e em execução.

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
| `POST` | `/api/auth/esqueci-senha` | Envia link de recuperação de senha por e-mail |
| `POST` | `/api/auth/redefinir-senha` | Redefine senha com token válido |
| `GET` | `/api/usuarios/psicologos` | Lista psicólogos cadastrados |
| `GET` | `/api/usuarios/perfil` | Retorna perfil do usuário autenticado |
| `PUT` | `/api/usuarios/perfil` | Atualiza perfil |
| `GET` | `/api/disponibilidades/:psicologoId` | Lista disponibilidade de um psicólogo |
| `POST` | `/api/disponibilidades` | Cadastra disponibilidade |
| `POST` | `/api/consultas` | Agenda uma consulta |
| `GET` | `/api/consultas` | Lista consultas do usuário autenticado |
| `PATCH` | `/api/consultas/:id/cancelar` | Cancela uma consulta |
| `PATCH` | `/api/consultas/:id/confirmar` | Confirma uma consulta |
| `GET` | `/api/consultas/:id/sala` | Entrega a sala de vídeo somente a um participante autenticado |
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
- catálogo analítico de psicólogos e dashboard administrativo;
- recuperação de senha e videochamada de demonstração;
- protótipo web alinhado ao layout visual do Portal Terapia.

## Próximas Melhorias

- Automatizar testes de integração do frontend, API e banco.
- Preparar hospedagem pública da API e do banco, se necessária para uma etapa futura.
- Avaliar um provedor privado de videochamada antes de qualquer uso com dados reais.
- Executar testes de usabilidade e revisar a configuração de privacidade da PoC.

## Autor

Projeto desenvolvido para o Projeto Integrador do curso de Desenvolvimento de Sistemas Orientado a Dispositivos Móveis e Baseados na Web.
