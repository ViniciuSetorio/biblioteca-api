import livroService from "../services/livros.service.js";

async function pegarTodosOsLivros(_req, res) {
  try {
    const livros = await livroService.buscarLivros();
    return res.status(200).json(livros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao buscar livros",
    });
  }
}

async function pegarLivroPorId(req, res) {
  try {
    const { id } = req.params;

    const book = await livroService.buscarLivroPorId(id);

    if (!book) {
      return res.status(404).json({
        message: "Livro não encontrado",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao buscar livro",
    });
  }
}

async function adicionarLivro(req, res) {
  try {
    const { titulo, autor } = req.body;

    if (!titulo || !autor) {
      return res.status(400).json({
        message: "Campos obrigatórios: titulo e autor",
      });
    }

    const livro = await livroService.criarLivro(req.body);

    return res.status(201).json(livro);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao criar livro",
    });
  }
}


async function atualizarLivro(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const livroAtualizado = await livroService.modificarLivro(id, data);

    if (!livroAtualizado) {
      return res.status(404).json({
        message: "Livro não encontrado",
      });
    }

    return res.status(200).json(livroAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao atualizar livro",
    });
  }
}

export async function deletarLivro(req, res) {
  try {
    const { id } = req.params;

    const livro = await livroService.removerLivro(Number(id));

    if (!livro) {
      return res.status(404).json({
        message: "Livro não encontrado",
      });
    }

    return res.status(200).json(livro);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao remover livro",
    });
  }
}

export default {
  pegarTodosOsLivros,
  pegarLivroPorId,
  adicionarLivro,
  atualizarLivro,
  deletarLivro,
};
