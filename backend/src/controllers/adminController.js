const { query } = require("../config/database");

async function indicadores(req, res, next) {
  try {
    const [totais] = await query(
      `SELECT
        (SELECT COUNT(*) FROM usuario WHERE perfil_id = 2) AS profissionais,
        (SELECT COUNT(*) FROM usuario WHERE perfil_id = 3) AS pacientes,
        (SELECT COUNT(*) FROM consulta) AS consultas,
        SUM(c.status = 'confirmada') AS confirmadas,
        SUM(c.status IN ('agendada', 'pendente')) AS pendentes,
        SUM(c.status = 'cancelada') AS canceladas
       FROM consulta c`
    );
    const porStatus = await query(
      `SELECT status, COUNT(*) AS total FROM consulta GROUP BY status ORDER BY total DESC`
    );
    const porMes = await query(
      `SELECT DATE_FORMAT(data_consulta, '%Y-%m') AS periodo, COUNT(*) AS total
       FROM consulta WHERE data_consulta >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY periodo ORDER BY periodo`
    );
    const porEspecialidade = await query(
      `SELECT COALESCE(especialidade, 'Não informada') AS nome, COUNT(*) AS total
       FROM usuario WHERE perfil_id = 2 GROUP BY especialidade ORDER BY total DESC, nome`
    );
    const porProfissional = await query(
      `SELECT u.nome, COUNT(c.id_consulta) AS total
       FROM usuario u LEFT JOIN consulta c ON c.psicologo_id = u.id_usuario
       WHERE u.perfil_id = 2 GROUP BY u.id_usuario, u.nome ORDER BY total DESC, u.nome LIMIT 8`
    );
    const porTipo = await query(
      `SELECT tipo_atendimento AS nome, COUNT(*) AS total FROM consulta
       WHERE status <> 'cancelada' GROUP BY tipo_atendimento ORDER BY total DESC LIMIT 6`
    );

    return res.json({
      totais: Object.fromEntries(Object.entries(totais).map(([key, value]) => [key, Number(value || 0)])),
      porStatus,
      porMes,
      porEspecialidade,
      porProfissional,
      porTipo
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { indicadores };
