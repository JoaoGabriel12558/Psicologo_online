const { query } = require("../config/database");

async function agendar(req, res, next) {
  try {
    const { psicologo_id, data_consulta, horario, observacoes, tipo_atendimento } = req.body;

    if (!psicologo_id || !data_consulta || !horario) {
      return res.status(400).json({ erro: "Psicologo, data e horario sao obrigatorios." });
    }

    const ocupadas = await query(
      `SELECT id_consulta
       FROM consulta
       WHERE psicologo_id = :psicologo_id
         AND data_consulta = :data_consulta
         AND horario = :horario
         AND status <> 'cancelada'`,
      { psicologo_id, data_consulta, horario }
    );

    if (ocupadas.length) {
      return res.status(409).json({ erro: "Horario indisponivel." });
    }

    const resultado = await query(
      `INSERT INTO consulta
        (paciente_id, psicologo_id, data_consulta, horario, status, observacoes, tipo_atendimento)
       VALUES
        (:paciente_id, :psicologo_id, :data_consulta, :horario, 'agendada', :observacoes, :tipo_atendimento)`,
      {
        paciente_id: req.usuario.id_usuario,
        psicologo_id,
        data_consulta,
        horario,
        observacoes: observacoes || null,
        tipo_atendimento: tipo_atendimento || "Psicoterapia individual"
      }
    );

    return res.status(201).json({ id_consulta: resultado.insertId, status: "agendada" });
  } catch (error) {
    return next(error);
  }
}

async function listar(req, res, next) {
  try {
    let filtro = "WHERE c.paciente_id = :usuario_id";
    const params = { usuario_id: req.usuario.id_usuario };

    if (req.usuario.perfil_id === 1) {
      filtro = "";
      delete params.usuario_id;
    }

    if (req.usuario.perfil_id === 2) {
      filtro = "WHERE c.psicologo_id = :usuario_id";
    }

    const consultas = await query(
      `SELECT c.*, p.nome AS paciente_nome, ps.nome AS psicologo_nome
       FROM consulta c
       INNER JOIN usuario p ON p.id_usuario = c.paciente_id
       INNER JOIN usuario ps ON ps.id_usuario = c.psicologo_id
       ${filtro}
       ORDER BY c.data_consulta DESC, c.horario DESC`,
      params
    );

    return res.json(consultas);
  } catch (error) {
    return next(error);
  }
}

async function cancelar(req, res, next) {
  try {
    await query(
      `UPDATE consulta
       SET status = 'cancelada'
       WHERE id_consulta = :id
         AND (paciente_id = :usuario_id OR psicologo_id = :usuario_id)`,
      { id: req.params.id, usuario_id: req.usuario.id_usuario }
    );

    return res.json({ mensagem: "Consulta cancelada." });
  } catch (error) {
    return next(error);
  }
}

async function confirmar(req, res, next) {
  try {
    const { link_sala } = req.body;

    await query(
      `UPDATE consulta
       SET status = 'confirmada',
           link_sala = COALESCE(:link_sala, link_sala)
       WHERE id_consulta = :id
         AND psicologo_id = :psicologo_id`,
      {
        id: req.params.id,
        psicologo_id: req.usuario.id_usuario,
        link_sala: link_sala || null
      }
    );

    return res.json({ mensagem: "Consulta confirmada." });
  } catch (error) {
    return next(error);
  }
}

module.exports = { agendar, listar, cancelar, confirmar };
