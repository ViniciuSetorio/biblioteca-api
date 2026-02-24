import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

export const UsuarioSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
  }),
  nome: z.string().openapi({
    example: "Ana Silva",
  }),
  email: z.string().openapi({
    example: "ana@biblioteca.com",
  }),
  cargo: z.enum(["bibliotecario", "membro"]).openapi({
    example: "bibliotecario",
  }),
  created_at: z.string().openapi({
    example: "2024-01-10T12:00:00.000Z",
  }),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    example: 1,
  }),
});

export const UsuarioCreateSchema = z.object({
  nome: z.string().min(1).openapi({ example: "João Silva" }),
  email: z.string().openapi({ example: "joao@email.com" }),
  cargo: z.enum(["bibliotecario", "membro"]).openapi({
    example: "membro",
  }),
});

export const UsuarioUpdateSchema = z.object({
  nome: z.string().min(1).optional().openapi({ example: "Matheus Carvalho" }),
  email: z.string().optional().openapi({ example: "matheus@email.com" }),
  cargo: z
    .enum(["bibliotecario", "membro"])
    .optional()
    .openapi({ example: "membro" }),
});

registry.register("Usuário", UsuarioSchema);
registry.register("ParâmetroId", IdParamSchema);
registry.register("CriarUsuário", UsuarioCreateSchema);
registry.register("AtualizarUsuário", UsuarioUpdateSchema);
