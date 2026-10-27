import pages from "../lib/static-pages.json";
import manager from "../lib/image-manager.html?raw";
import {adminPageRequest,mediaRequest,ownerPageGate} from "../lib/media-server";
import {knowledgeRequest} from "../lib/knowledge-server";
import {PROJECT_OPTIONS_HTML} from "../lib/project-registry.ts";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

const managerPage = manager.replace("<!--PROJECT_OPTIONS-->", PROJECT_OPTIONS_HTML);

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url = new URL(request.url);
    // Keep the knowledge API out of static routes so authorization runs on every request.
    if(url.pathname === '/api/knowledge' || url.pathname.startsWith('/api/knowledge/')) {
      return knowledgeRequest(request,env).catch(()=>Response.json({error:'Unable to complete this action. Please try again.'},{status:500,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}}));
    }
    if(url.pathname === '/api/media' || url.pathname.startsWith('/api/media/')) {
      return mediaRequest(request,env).catch(()=>Response.json({error:'Unable to complete this action. Please try again.'},{status:500,headers:{'Cache-Control':'no-store'}}));
    }
    if(url.pathname === '/admin' || url.pathname === '/admin/') {
      return adminPageRequest(request,managerPage);
    }
    if(url.pathname === '/admin/knowledge' || url.pathname === '/admin/knowledge/') {
      if (url.pathname === '/admin/knowledge/') {
        url.pathname = '/admin/knowledge';
        return Response.redirect(url.toString(), 308);
      }
      const gate = ownerPageGate(request, '/admin/knowledge');
      if (gate) return gate;
      return handler.fetch(request, env, ctx).then((response) => {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'private, no-store');
        headers.set('X-Robots-Tag', 'noindex, nofollow');
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      });
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
