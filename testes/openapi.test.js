import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("OpenAPI", () => {
  it("deve expor /openapi.json com paths de empréstimos", async () => {
    const app = createApp();
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.paths["/emprestimos"]).toBeTruthy();
  });
});
