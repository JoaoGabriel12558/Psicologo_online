const { query } = require("../config/database");

async function listarPsicologos(req, res, next) {
  try {
    const psicologos = await query(
      `WITH consultas_por_tipo AS (
         SELECT psicologo_id, tipo_atendimento, COUNT(*) AS total_tipo
         FROM consulta
         WHERE status <> 'cancelada'
         GROUP BY psicologo_id, tipo_atendimento
       ),
       tipos_ranqueados AS (
         SELECT psicologo_id, tipo_atendimento, total_tipo,
                SUM(total_tipo) OVER (PARTITION BY psicologo_id) AS total_ativas,
                ROW_NUMBER() OVER (
                  PARTITION BY psicologo_id
                  ORDER BY total_tipo DESC, tipo_atendimento
                ) AS posicao
         FROM consultas_por_tipo
       ),
       consultas_por_profissional AS (
         SELECT psicologo_id, SUM(total_tipo) AS total
         FROM consultas_por_tipo
         GROUP BY psicologo_id
       )
       SELECT u.id_usuario, u.nome, u.crp, u.especialidade,
              u.anos_experiencia, u.descricao_profissional,
              COALESCE(cp.total, 0) AS consultas_realizadas,
              tr.tipo_atendimento AS tipo_principal,
              COALESCE(ROUND(100 * tr.total_tipo / NULLIF(tr.total_ativas, 0), 0), 0) AS percentual_tipo_principal
       FROM usuario u
       LEFT JOIN consultas_por_profissional cp ON cp.psicologo_id = u.id_usuario
       LEFT JOIN tipos_ranqueados tr ON tr.psicologo_id = u.id_usuario AND tr.posicao = 1
       WHERE u.perfil_id = 2
       ORDER BY u.nome`
    );

    return res.json(psicologos);
  } catch (error) {
    return next(error);
  }
}

async function obterPerfil(req, res, next) {
  try {
    const usuarios = await query(
      `SELECT id_usuario, nome, email, telefone, idade, ocupacao, crp, especialidade, anos_experiencia, descricao_profissional, perfil_id
       FROM usuario
       WHERE id_usuario = :id`,
      { id: req.usuario.id_usuario }
    );

    return res.json(usuarios[0]);
  } catch (error) {
    return next(error);
  }
}

async function atualizarPerfil(req, res, next) {
  try {
    const { nome, telefone, idade, ocupacao, crp, especialidade, anos_experiencia, descricao_profissional } = req.body;

    await query(
      `UPDATE usuario
       SET nome = COALESCE(:nome, nome),
           telefone = COALESCE(:telefone, telefone),
           idade = COALESCE(:idade, idade),
           ocupacao = COALESCE(:ocupacao, ocupacao),
           crp = COALESCE(:crp, crp),
           especialidade = COALESCE(:especialidade, especialidade),
           anos_experiencia = COALESCE(:anos_experiencia, anos_experiencia),
           descricao_profissional = COALESCE(:descricao_profissional, descricao_profissional)
       WHERE id_usuario = :id`,
      {
        id: req.usuario.id_usuario,
        nome: nome || null,
        telefone: telefone || null,
        idade: idade || null,
        ocupacao: ocupacao || null,
        crp: crp || null,
        especialidade: especialidade || null,
        anos_experiencia: Number.isFinite(Number(anos_experiencia)) ? Number(anos_experiencia) : null,
        descricao_profissional: descricao_profissional || null
      }
    );

    return res.json({ mensagem: "Perfil atualizado com sucesso." });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarPsicologos, obterPerfil, atualizarPerfil };

