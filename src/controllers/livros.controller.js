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
      500,
      "INTERNAL_ERROR",
      "Erro ao buscar livros",
    );
    return res.status(error.status).json(error.body);
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
    console.error(err);
    const error = InternalServerError(
      500,
      "INTERNAL_ERROR",
      "Erro ao buscar livros",
    );
    return res.status(error.status).json(error.body);
  }
}

async function adicionarLivro(req, res) {
  try {
    const { titulo, autor } = req.body;

    if (!titulo || !autor) {
      const error = NotFoundError(
        404,
        "REQUIRED_TITLE_AUTHOR",
        "Campos obrigatórios: titulo e autor",
      );
      return res.status(error.status).json(error.body);
    }

    const livro = await livroService.criarLivro(req.body);

    return res.status(201).json(livro);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      500,
      "INTERNAL_ERROR",
      "Erro ao criar livro",
    );
    return res.status(error.status).json(error.body);
  }
}

async function atualizarLivro(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const livroAtualizado = await livroService.modificarLivro(Number(id), data);

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
    console.error(err);
    const error = InternalServerError(
      500,
      "INTERNAL_ERROR",
      "Erro ao criar livro",
    );
    return res.status(error.status).json(error.body);
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
    console.error(err);
    const error = InternalServerError(
      500,
      "INTERNAL_ERROR",
      "Erro ao remover livro",
    );
    return res.status(error.status).json(error.body);
  }
}

export default {
  pegarTodosOsLivros,
  pegarLivroPorId,
  adicionarLivro,
  atualizarLivro,
  deletarLivro,
};
