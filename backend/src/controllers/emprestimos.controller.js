import { ZodError } from "zod";
import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import {
  CriarEmprestimoSchema,
  EmprestimoIdParamsSchema,
  ListarEmprestimosQuerySchema,
} from "../schemas/emprestimos.schema.js";

const libraryManager = createLibraryManager();

function handleZod(res, err) {
  return res.status(400).json({
    message: "Erro de validação",
    code: "VALIDATION_ERROR",
    issues: err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    })),
  });
}

async function criarEmprestimo(req, res) {
  try {
    const body = CriarEmprestimoSchema.parse(req.body);
    const emprestimo = await libraryManager.emprestarLivro(body);
    return res.status(201).json(emprestimo);
  } catch (err) {
    if (err instanceof ZodError) return handleZod(res, err);
    if (err.statusCode)
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });

    console.error(err);
    const error = InternalServerError(
      "Erro ao criar empréstimo",
      "INTERNAL_ERROR",
    );
    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function registrarDevolucao(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const devolucao = await libraryManager.devolverLivro({ emprestimoId });
    return res.status(200).json(devolucao);
  } catch (err) {
    if (err instanceof ZodError) return handleZod(res, err);
    if (err.statusCode)
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });

    console.error(err);
    const error = InternalServerError(
      "Erro ao registrar devolução",
      "INTERNAL_ERROR",
    );
    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function listarEmprestimos(req, res) {
  try {
    const query = ListarEmprestimosQuerySchema.parse(req.query);
    const lista = await libraryManager.listarEmprestimos(query);
    return res.status(200).json(lista);
  } catch (err) {
    if (err instanceof ZodError) return handleZod(res, err);
    if (err.statusCode)
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });

    console.error(err);
    const error = InternalServerError(
      "Erro ao listar empréstimos",
      "INTERNAL_ERROR",
    );
    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

async function obterEmprestimo(req, res) {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const item = await libraryManager.obterEmprestimo({ emprestimoId });
    return res.status(200).json(item);
  } catch (err) {
    if (err instanceof ZodError) return handleZod(res, err);
    if (err.statusCode)
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });

    console.error(err);
    const error = InternalServerError(
      "Erro ao buscar empréstimo",
      "INTERNAL_ERROR",
    );
    return res
      .status(error.statusCode)
      .json({ message: error.message, code: error.code });
  }
}

export default {
  criarEmprestimo,
  registrarDevolucao,
  listarEmprestimos,
  obterEmprestimo,
};
