// src/config/openapi.js
import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

let registryInstance;

function createRegistry() {
  return new OpenAPIRegistry();
}

function getRegistry() {
  if (!registryInstance) {
    registryInstance = createRegistry();
  }

  return registryInstance;
}

function generateOpenApiDocumentation() {
  const registry = getRegistry();

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Biblioteca API",
      version: "1.0.0",
      description:
        "API para aplicação de gerenciamento de biblioteca. Trabalho para disciplina de Engenharia de Software II.",
    },
  });
}

export { getRegistry, generateOpenApiDocumentation };
