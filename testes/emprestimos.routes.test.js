import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import LibraryManager from "../src/core/libraryManager.js";

describe("Rotas de empréstimos", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POST /emprestimos cria empréstimo", async () => {
    vi.spyOn(LibraryManager, "emprestarLivro").mockResolvedValue({
      id: 1,
      usuario_id: 1,
      livro_id: 2,
      status: "ativo",
    });

    const app = createApp();

    const res = await request(app)
      .post("/emprestimos")
      .send({ usuarioId: 1, livroId: 2 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("ativo");
  });

  it("PATCH /emprestimos/:id/devolucao registra devolução", async () => {
    vi.spyOn(LibraryManager, "devolverLivro").mockResolvedValue({
      id: 1,
      status: "devolvido",
    });

    const app = createApp();

    const res = await request(app).patch("/emprestimos/1/devolucao");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("devolvido");
  });

  it("GET /emprestimos lista empréstimos", async () => {
    vi.spyOn(LibraryManager, "listarEmprestimos").mockResolvedValue([
      { id: 1, status: "ativo" },
    ]);

    const app = createApp();

    const res = await request(app).get("/emprestimos");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /emprestimos/:id retorna 404 quando não achar", async () => {
    vi.spyOn(LibraryManager, "obterEmprestimo").mockRejectedValue(
      new Error("Empréstimo não encontrado"),
    );

    const app = createApp();

    const res = await request(app).get("/emprestimos/999");

    expect(res.status).toBe(404);
  });
});
