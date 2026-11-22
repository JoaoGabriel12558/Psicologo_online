const { query } = require("../config/database");

async function resumo(req, res, next) {
  try {
    const [resultado] = await query(
      `SELECT
        SUM(CASE WHEN perfil_id = 2 THEN 1 ELSE 0 END) AS profissionais,
        SUM(CASE WHEN perfil_id = 3 THEN 1 ELSE 0 END) AS pacientes,
        COUNT(DISTINCT CASE
          WHEN perfil_id = 2 AND especialidade IS NOT NULL AND especialidade <> ''
          THEN especialidade
        END) AS especialidades
       FROM usuario`
    );

    return res.json({
      profissionais: Number(resultado.profissionais || 0),
      pacientes: Number(resultado.pacientes || 0),
      especialidades: Number(resultado.especialidades || 0)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { resumo };

