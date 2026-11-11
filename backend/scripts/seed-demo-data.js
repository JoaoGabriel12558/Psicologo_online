require("dotenv").config();

const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

const connectionOptions = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "atendimento_psicologico"
};

const specialties = [
  "Psicologia Clínica",
  "Terapia Cognitivo-Comportamental",
  "Ansiedade e Estresse",
  "Terapia Familiar",
  "Terapia de Casal",
  "Psicologia Infantil",
  "Neuropsicologia",
  "Psicologia Hospitalar"
];
const firstNames = [
  "Ana", "Beatriz", "Camila", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena",
  "Isabela", "João", "Larissa", "Marina", "Natália", "Otávio", "Paula", "Rafael",
  "Sofia", "Tiago", "Valentina", "Vinícius"
];
const lastNames = [
  "Almeida", "Barbosa", "Campos", "Cardoso", "Carvalho", "Costa", "Dias", "Fernandes",
  "Ferreira", "Gomes", "Lima", "Lopes", "Martins", "Melo", "Mendes", "Nunes",
  "Oliveira", "Pereira", "Ribeiro", "Rocha", "Santos", "Silva", "Souza", "Teixeira"
];
const appointmentTypes = [
  "Psicoterapia individual",
  "Terapia de casal",
  "Terapia familiar",
  "Orientação psicológica",
  "Avaliação psicológica",
  "Acompanhamento infantil"
];

function personName(index) {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const secondLast = lastNames[(index * 7 + 3) % lastNames.length];
  return `${first} ${last} ${secondLast}`;
}

async function insertInBatches(connection, rows, columnsPerRow) {
  const batchSize = 75;
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const valuesSql = batch.map(() => `(${Array(columnsPerRow).fill("?").join(",")})`).join(",");
    const values = batch.flat();
    await connection.execute(
      `INSERT IGNORE INTO usuario
        (nome, email, senha, telefone, idade, ocupacao, crp, especialidade,
         anos_experiencia, descricao_profissional, perfil_id)
       VALUES ${valuesSql}`,
      values
    );
  }
}

async function seed() {
  const connection = await mysql.createConnection(connectionOptions);
  try {
    await connection.beginTransaction();

    const unusableDemoPassword = await bcrypt.hash(randomBytes(40).toString("hex"), 10);
    const psychologists = Array.from({ length: 50 }, (_, index) => {
      const specialty = specialties[index % specialties.length];
      return [
        `Dra. ${personName(index)}`,
        `demo.prof.${String(index + 1).padStart(3, "0")}@portalterapia.local`,
        unusableDemoPassword,
        `(11) 9${String(10000000 + index).slice(-8)}`,
        27 + (index * 7) % 39,
        "Psicólogo(a)",
        `CRP 06/${String(120000 + index).padStart(6, "0")}`,
        specialty,
        1 + (index * 5) % 25,
        `Atendimento online em ${specialty.toLowerCase()}, com abordagem acolhedora e foco nas necessidades de cada pessoa.`,
        2
      ];
    });
    const patients = Array.from({ length: 240 }, (_, index) => [
      personName(index + 31),
      `demo.paciente.${String(index + 1).padStart(3, "0")}@portalterapia.local`,
      unusableDemoPassword,
      `(11) 9${String(20000000 + index).slice(-8)}`,
      18 + (index * 11) % 54,
      "Dado fictício para demonstração",
      null,
      null,
      0,
      null,
      3
    ]);

    await insertInBatches(connection, psychologists, 11);
    await insertInBatches(connection, patients, 11);

    const [professionals] = await connection.execute(
      `SELECT id_usuario FROM usuario
       WHERE perfil_id = 2 AND email LIKE 'demo.prof.%@portalterapia.local'
       ORDER BY email`
    );
    const [patientRows] = await connection.execute(
      `SELECT id_usuario FROM usuario
       WHERE perfil_id = 3 AND email LIKE 'demo.paciente.%@portalterapia.local'
       ORDER BY email`
    );

    if (professionals.length !== 50 || patientRows.length !== 240) {
      throw new Error("Os registros de demonstração não puderam ser identificados com segurança.");
    }

    const today = new Date();
    const appointments = [];
    for (let professionalIndex = 0; professionalIndex < professionals.length; professionalIndex += 1) {
      for (let slot = 0; slot < 25; slot += 1) {
        const dayOffset = 540 - slot * 23;
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const isoDate = date.toISOString().slice(0, 10);
        const future = date > today;
        const status = future
          ? "agendada"
          : ["confirmada", "confirmada", "confirmada", "agendada", "cancelada"][
            (professionalIndex + slot) % 5
          ];
        const patient = patientRows[(professionalIndex * 17 + slot * 13) % patientRows.length];
        const hour = 8 + ((professionalIndex + slot * 3) % 10);
        const minute = [0, 30][(professionalIndex + slot) % 2];
        appointments.push([
          patient.id_usuario,
          professionals[professionalIndex].id_usuario,
          isoDate,
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
          status,
          appointmentTypes[(professionalIndex + slot * 2) % appointmentTypes.length]
        ]);
      }
    }

    for (let start = 0; start < appointments.length; start += 100) {
      const batch = appointments.slice(start, start + 100);
      const valuesSql = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
      await connection.execute(
        `INSERT IGNORE INTO consulta
          (paciente_id, psicologo_id, data_consulta, horario, status, tipo_atendimento)
         VALUES ${valuesSql}`,
        batch.flat()
      );
    }

    await connection.commit();
    const [counts] = await connection.execute(
      `SELECT
         (SELECT COUNT(*) FROM usuario WHERE perfil_id = 2 AND email LIKE 'demo.prof.%@portalterapia.local') AS profissionais,
         (SELECT COUNT(*) FROM usuario WHERE perfil_id = 3 AND email LIKE 'demo.paciente.%@portalterapia.local') AS pacientes,
         (SELECT COUNT(*) FROM consulta c
          INNER JOIN usuario u ON u.id_usuario = c.psicologo_id
          WHERE u.email LIKE 'demo.prof.%@portalterapia.local') AS consultas`
    );
    console.log("Carga fictícia concluída (sem dados reais de pacientes):");
    console.log(`Profissionais: ${counts[0].profissionais}`);
    console.log(`Pacientes: ${counts[0].pacientes}`);
    console.log(`Consultas: ${counts[0].consultas}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  const detail = error?.message || error?.code || String(error || "Erro sem detalhes retornados pelo MySQL.");
  console.error("Não foi possível gerar os dados fictícios:", detail);
  console.error(`Verifique a conexão com MySQL em ${connectionOptions.host}:${connectionOptions.port} e confirme se o banco já foi criado.`);
  process.exit(1);
});
