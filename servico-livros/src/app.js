import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import createLivrosService from "./services/livros.service.js";

export function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get(["/health", "/livros/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "livros-service",
      timestamp: new Date().toISOString(),
    });
  });

  const livroService = createLivrosService(db);

  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const livros = await livroService.buscarLivros();
      return res.status(200).json(livros);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar livros", code: "INTERNAL_ERROR" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const book = await livroService.buscarLivroPorId(Number(id));
      if (!book) {
        return res.status(404).json({ message: "Livro não encontrado", code: "BOOK_NOT_FOUND" });
      }
      return res.status(200).json(book);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar livro", code: "INTERNAL_ERROR" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const livro = await livroService.criarLivro(req.body);
      return res.status(201).json(livro);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }

      if (err.code === "23505") {
        return res.status(409).json({
          message: "Já existe um livro cadastrado com este ISBN.",
          code: "DUPLICATE_ISBN",
        });
      }

      if (err.code === "23502") {
        return res.status(400).json({
          message: "Campos obrigatórios estão faltando.",
          code: "MISSING_FIELDS",
        });
      }

      console.error("Erro ao adicionar livro:", {
        message: err.message,
        code: err.code,
        detail: err.detail,
        body: req.body,
      });

      return res.status(500).json({ message: "Erro ao criar livro", code: "INTERNAL_ERROR" });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const livroAtualizado = await livroService.modificarLivro(id, req.body);
      if (!livroAtualizado) {
        return res.status(404).json({ message: "Livro não encontrado", code: "BOOK_NOT_FOUND" });
      }
      return res.status(200).json(livroAtualizado);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar livro", code: "INTERNAL_ERROR" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const livro = await livroService.removerLivro(Number(id));
      if (!livro) {
        return res.status(404).json({ message: "Livro não encontrado", code: "BOOK_NOT_FOUND" });
      }
      return res.status(200).json(livro);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao remover livro", code: "INTERNAL_ERROR" });
    }
  });

  app.use("/livros", router);
  app.use(errorHandler);

  return app;
}
