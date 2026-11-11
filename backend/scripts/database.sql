CREATE DATABASE IF NOT EXISTS atendimento_psicologico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE atendimento_psicologico;

CREATE TABLE IF NOT EXISTS perfil (
  id_perfil INT AUTO_INCREMENT PRIMARY KEY,
  nome_perfil VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  idade INT,
  ocupacao VARCHAR(100),
  crp VARCHAR(20),
  especialidade VARCHAR(100),
  anos_experiencia INT NOT NULL DEFAULT 0,
  descricao_profissional VARCHAR(500),
  perfil_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_perfil
    FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS disponibilidade (
  id_disponibilidade INT AUTO_INCREMENT PRIMARY KEY,
  psicologo_id INT NOT NULL,
  dia_semana INT NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  CONSTRAINT fk_disponibilidade_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES usuario(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consulta (
  id_consulta INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  psicologo_id INT NOT NULL,
  data_consulta DATE NOT NULL,
  horario TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'agendada',
  tipo_atendimento VARCHAR(100) NOT NULL DEFAULT 'Psicoterapia individual',
  link_sala VARCHAR(255),
  observacoes TEXT,
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consulta_paciente
    FOREIGN KEY (paciente_id) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_consulta_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES usuario(id_usuario),
  CONSTRAINT uq_consulta_horario
    UNIQUE (psicologo_id, data_consulta, horario)
);

CREATE TABLE IF NOT EXISTS mensagem (
  id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
  remetente_id INT NOT NULL,
  destinatario_id INT NOT NULL,
  conteudo TEXT NOT NULL,
  data_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lida BOOLEAN NOT NULL DEFAULT 0,
  CONSTRAINT fk_mensagem_remetente
    FOREIGN KEY (remetente_id) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_mensagem_destinatario
    FOREIGN KEY (destinatario_id) REFERENCES usuario(id_usuario)
);

INSERT IGNORE INTO perfil (id_perfil, nome_perfil) VALUES
  (1, 'Administrador'),
  (2, 'Psicologo'),
  (3, 'Paciente');

