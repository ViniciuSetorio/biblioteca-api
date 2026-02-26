import createUsuariosService from "../services/usuarios.service.js";
import getDatabase from "../config/database.js";
import { InternalServerError, NotFoundError } from "../utils/httpError.js";

const db = getDatabase();
const usuariosService = createUsuariosService(db);

async function pegarTodosOsUsuarios(_req, res) {
  try {
    const usuarios = await usuariosService.buscarUsuarios();
    return res.status(200).json(usuarios);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao buscar usuários", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
}

async function pegarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.buscarUsuarioPorId(Number(id));

    if (!usuario) {
      const error = NotFoundError("Usuário não encontrado", "USER_NOT_FOUND");
      return res.status(error.statusCode).json({ message: error.message, code: error.code });
    }

    return res.status(200).json(usuario);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao buscar usuário", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
}

async function adicionarUsuario(req, res) {
  try {
    const usuario = await usuariosService.criarUsuario(req.body);
    return res.status(201).json(usuario);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao criar usuário", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.modificarUsuario(Number(id), req.body);
    return res.status(200).json(usuario);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao atualizar usuário", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
}

async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.removerUsuario(Number(id));
    return res.status(200).json(usuario);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao remover usuário", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
}

export default {
  pegarTodosOsUsuarios,
  pegarUsuarioPorId,
  adicionarUsuario,
  atualizarUsuario,
  deletarUsuario,
};