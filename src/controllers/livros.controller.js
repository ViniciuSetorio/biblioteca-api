import getDatabase from "../config/database.js";
import { NotFoundError } from "../utils/httpError.js";
import handlerControllerError from "../utils/handlerControllerError.js";
import createLivrosService from "../services/livros.service.js";

const db = getDatabase();
const livroService = createLivrosService(db);

async function pegarTodosOsLivros(_req, res) {
  try {
    const livros = await livroService.buscarLivros();
    return res.status(200).json(livros);
  } catch (err) {
    return handlerControllerError(res, err, "Erro ao buscar livros");
  }
}

async function pegarLivroPorId(req, res) {
  try {
    const { id } = req.params;
    const book = await livroService.buscarLivroPorId(Number(id));

    if (!book) {
      const error = NotFoundError(
        404,
        "BOOK_NOT_FOUND",
        "Livro não encontrado",
      );
      return res.status(error.status).json(error.body);
    }

    return res.status(200).json(book);
  } catch (err) {
    return handlerControllerError(res, err, "Erro ao buscar livro");
  }
}

async function adicionarLivro(req, res) {
  try {
    const livro = await livroService.criarLivro(req.body);
    return res.status(201).json(livro);
  } catch (err) {
    return handlerControllerError(res, err, "Erro ao criar livro");
  }
}

async function atualizarLivro(req, res) {
  try {
    const { id } = req.params;
    const livroAtualizado = await livroService.modificarLivro(id, req.body);

    if (!livroAtualizado) {
      const error = NotFoundError(
        404,
        "BOOK_NOT_FOUND",
        "Livro não encontrado",
      );
      return res.status(error.status).json(error.body);
    }

    return res.status(200).json(livroAtualizado);
  } catch (err) {
    return handlerControllerError(res, err, "Erro ao atualizar livro");
  }
}

export async function deletarLivro(req, res) {
  try {
    const { id } = req.params;

    const livro = await livroService.removerLivro(Number(id));

    if (!livro) {
      const error = NotFoundError(
        404,
        "BOOK_NOT_FOUND",
        "Livro não encontrado",
      );
      return res.status(error.status).json(error.body);
    }

    return res.status(200).json(livro);
  } catch (err) {
    return handlerControllerError(res, err, "Erro ao remover livro");
  }
}

export default {
  pegarTodosOsLivros,
  pegarLivroPorId,
  adicionarLivro,
  atualizarLivro,
  deletarLivro,
};
