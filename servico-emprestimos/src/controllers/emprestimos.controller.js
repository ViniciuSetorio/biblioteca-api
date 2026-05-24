import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import { z } from "zod";

const EmprestarBodySchema = z.object({
  usuarioId: z.number().int().positive(),
  livroId: z.number().int().positive(),
});

const EmprestimoIdParamsSchema = z.object({
  emprestimoId: z.coerce.number().int().positive(),
});

const AtualizarEmprestimoSchema = z.object({
  usuarioId: z.number().int().positive().optional(),
  livroId: z.number().int().positive().optional(),
  status: z.enum(["ativo", "devolvido"]).optional(),
  data_prevista_devolucao: z.string().datetime().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Pelo menos um campo deve ser fornecido para atualização" }
);

const ListarQuerySchema = z.object({
  status: z.enum(["ativo", "devolvido"]).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  livroId: z.coerce.number().int().positive().optional(),
});

function getLibraryManager(req) {
  const db = req.app.locals.db;
  return createLibraryManager(db);
}

async function criarEmprestimo(req, res) {
  try {
    const data = EmprestarBodySchema.parse(req.body);
    const libraryManager = getLibraryManager(req);
    const emprestimo = await libraryManager.emprestarLivro(data);
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
    const libraryManager = getLibraryManager(req);
    const devolucao = await libraryManager.devolverLivro({ emprestimoId });
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
    const libraryManager = getLibraryManager(req);
    const lista = await libraryManager.listarEmprestimos(filters);
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
    const libraryManager = getLibraryManager(req);
    const emprestimo = await libraryManager.obterEmprestimo({ emprestimoId });
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

async function atualizarEmprestimo(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const data = AtualizarEmprestimoSchema.parse(req.body);
    const libraryManager = getLibraryManager(req);
    const emprestimo = await libraryManager.atualizarEmprestimo({ emprestimoId, ...data });
    return res.status(200).json(emprestimo);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", details: err.errors });
    }
    console.error(err);
    const error = InternalServerError("Erro ao atualizar empréstimo", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function deletarEmprestimo(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const libraryManager = getLibraryManager(req);
    await libraryManager.deletarEmprestimo({ emprestimoId });
    return res.status(204).send();
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao deletar empréstimo", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

export default {
  criarEmprestimo,
  devolverLivro,
  listarEmprestimos,
  obterEmprestimo,
  atualizarEmprestimo,
  deletarEmprestimo,
};
