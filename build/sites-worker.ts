import pages from "../lib/static-pages.json";
import manager from "../lib/image-manager.html?raw";
import {mediaRequest,isOwner} from "../lib/media-server";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url = new URL(request.url);
    if(url.pathname === '/api/media' || url.pathname.startsWith('/api/media/')) {
      return mediaRequest(request,env).catch(()=>Response.json({error:'Unable to complete this action. Please try again.'},{status:500,headers:{'Cache-Control':'no-store'}}));
    }
    if(url.pathname === '/admin' || url.pathname === '/admin/') {
      if(!request.headers.get('oai-authenticated-user-id')) return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin%2F',url),302);
      if(!isOwner(request)) return new Response('This workspace is available only to the portfolio owner.',{status:403,headers:{'Cache-Control':'no-store'}});
      return new Response(manager,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
    }
    const route = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    const page = (pages as Record<string,string>)[route];
    if(page && (request.method==='GET'||request.method==='HEAD')) return new Response(request.method==='HEAD'?null:page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate'}});
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};
