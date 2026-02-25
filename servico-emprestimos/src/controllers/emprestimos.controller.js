import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import { z } from "zod";

const LibraryManager = createLibraryManager();

const EmprestarBodySchema = z.object({
  usuarioId: z.number().int().positive(),
  livroId: z.number().int().positive(),
});

const EmprestimoIdParamsSchema = z.object({
  emprestimoId: z.coerce.number().int().positive(),
});

const ListarQuerySchema = z.object({
  status: z.enum(["ativo", "devolvido"]).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  livroId: z.coerce.number().int().positive().optional(),
});

async function criarEmprestimo(req, res) {
  try {
    const data = EmprestarBodySchema.parse(req.body);
    const emprestimo = await LibraryManager.emprestarLivro(data);
    return res.status(201).json(emprestimo);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao criar empréstimo", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function devolverLivro(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const devolucao = await LibraryManager.devolverLivro({ emprestimoId });
    return res.status(200).json(devolucao);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao devolver livro", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function listarEmprestimos(req, res) {
  try {
    const filters = ListarQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarEmprestimos(filters);
    return res.status(200).json(lista);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao listar empréstimos", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function obterEmprestimo(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const emprestimo = await LibraryManager.obterEmprestimo({ emprestimoId });
    return res.status(200).json(emprestimo);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao buscar empréstimo", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

export default {
  criarEmprestimo,
  devolverLivro,
  listarEmprestimos,
  obterEmprestimo,
};