import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/server/admin-auth";

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "segredo-de-teste-nao-use-em-producao";
});

// Testa o middleware direto (não uma rota específica) de propósito: rotas
// como app/api/admin/orders/route.ts não têm autenticação nenhuma dentro
// delas mesmas — dependem inteiramente do proxy.ts pra recusar quem não tem
// sessão de admin. Um teste chamando o handler da rota direto nunca pegaria
// isso, porque o middleware não roda nesse caminho; só testando o proxy em
// si é que essa proteção fica coberta de verdade. Foi exatamente essa
// dependência silenciosa que quebrou o painel de disputas numa rodada
// anterior da auditoria (ver histórico do projeto).
function makeRequest(pathname: string, cookie?: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`), {
    headers: cookie ? { cookie: `${ADMIN_SESSION_COOKIE}=${cookie}` } : {},
  });
}

describe("proxy — protege /admin/** e /api/admin/**", () => {
  it("recusa /api/admin/orders sem cookie nenhum (401 JSON, não redireciona)", async () => {
    const res = await proxy(makeRequest("/api/admin/orders"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("recusa /api/admin/orders com um token inválido", async () => {
    const res = await proxy(makeRequest("/api/admin/orders", "token-forjado-qualquer"));
    expect(res.status).toBe(401);
  });

  it("deixa passar /api/admin/orders com uma sessão de admin válida", async () => {
    const token = await createAdminSessionToken();
    const res = await proxy(makeRequest("/api/admin/orders", token));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("deixa passar /api/admin/orders/algum-id com sessão válida (rota dinâmica)", async () => {
    const token = await createAdminSessionToken();
    const res = await proxy(makeRequest("/api/admin/orders/algum-id", token));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redireciona /admin/disputes (página, não API) sem sessão pro login", async () => {
    const res = await proxy(makeRequest("/admin/disputes"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("/admin/login e /api/admin/login sempre passam, mesmo sem sessão (senão ninguém consegue logar)", async () => {
    const pageRes = await proxy(makeRequest("/admin/login"));
    expect(pageRes.headers.get("x-middleware-next")).toBe("1");
    const apiRes = await proxy(makeRequest("/api/admin/login"));
    expect(apiRes.headers.get("x-middleware-next")).toBe("1");
  });
});
