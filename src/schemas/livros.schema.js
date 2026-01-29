import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

export const LivroSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
  }),
  titulo: z.string().openapi({
    example: "Clean Code",
  }),
  autor: z.string().openapi({
    example: "Robert C. Martin",
  }),
  isbn: z.string().nullable().openapi({
    example: "9780132350884",
  }),
  publicado_em: z.string().nullable().openapi({
    example: "2008-08-01",
  }),
  criador_por: z.number().int().openapi({
    example: 1,
  }),
  copias_disponiveis: z.number().int().openapi({
    example: 2,
  }),
  created_at: z.string().openapi({
    example: "2026-01-20T10:30:00.000Z",
  }),
});

export const CriarLivroSchema = z.object({
  titulo: z.string().openapi({
    example: "Domain-Driven Design",
  }),
  autor: z.string().openapi({
    example: "Eric Evans",
  }),
  isbn: z.string().optional().openapi({
    example: "9780321125217",
  }),
  publicado_em: z.string().optional().openapi({
    example: "2003-08-30",
  }),
  criador_por: z.number().int().openapi({
    example: 1,
  }),
  copias_disponiveis: z.number().int().optional().openapi({
    example: 3,
  }),
});

export const AtualizarLivroSchema = z.object({
  titulo: z.string().optional().openapi({
    example: "Domain-Driven Design",
  }),
  autor: z.string().optional().openapi({
    example: "Eric Evans",
  }),
  isbn: z.string().optional().openapi({
    example: "9780321125217",
  }),
  publicado_em: z.string().optional().openapi({
    example: "2003-08-30",
  }),
  criador_por: z.number().int().optional().openapi({
    example: 1,
  }),
  copias_disponiveis: z.number().int().optional().openapi({
    example: 3,
  }),
});

registry.register("Livro", LivroSchema);
registry.register("CriarLivro", CriarLivroSchema);
registry.register("AtualizarLivro", AtualizarLivroSchema);
