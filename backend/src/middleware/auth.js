const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token nao informado." });
  }

  try {
    const token = header.replace("Bearer ", "");
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ erro: "Token invalido ou expirado." });
  }
}

function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil_id)) {
      return res.status(403).json({ erro: "Acesso nao autorizado para este perfil." });
    }

    return next();
  };
}

module.exports = { autenticar, autorizar };

