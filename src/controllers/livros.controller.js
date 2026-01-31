import getDatabase from "../config/database.js";
import { InternalServerError, NotFoundError } from "../utils/httpError.js";
import createLivrosService from "../services/livros.service.js";

const db = getDatabase();
const livroService = createLivrosService(db);

async function pegarTodosOsLivros(_req, res) {
  try {
    const livros = await livroService.buscarLivros();
    return res.status(200).json(livros);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      "Erro ao buscar livros",
      "INTERNAL_ERROR",
    );

    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function pegarLivroPorId(req, res) {
  try {
    const { id } = req.params;
    const book = await livroService.buscarLivroPorId(Number(id));

    if (!book) {
      const error = NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
      return res
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
    }

    return res.status(200).json(book);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao buscar livro", "INTERNAL_ERROR");

    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function adicionarLivro(req, res) {
  try {
    const livro = await livroService.criarLivro(req.body);
    return res.status(201).json(livro);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao criar livros", "INTERNAL_ERROR");

    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function atualizarLivro(req, res) {
  try {
    const { id } = req.params;
    const livroAtualizado = await livroService.modificarLivro(id, req.body);

    if (!livroAtualizado) {
      const error = NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
      return res
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
    }

    return res.status(200).json(livroAtualizado);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      "Erro ao atualizar livro",
      "INTERNAL_ERROR",
    );

    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

export async function deletarLivro(req, res) {
  try {
    const { id } = req.params;

    const livro = await livroService.removerLivro(Number(id));

    if (!livro) {
      const error = NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
      return res
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
    }

    return res.status(200).json(livro);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      "Erro ao remover livro",
      "INTERNAL_ERROR",
    );

    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

export default {
  pegarTodosOsLivros,
  pegarLivroPorId,
  adicionarLivro,
  atualizarLivro,
  deletarLivro,
};
