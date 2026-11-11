import pages from "../lib/static-pages.json";
import { LEGACY_REDIRECTS } from "../scripts/site-metadata.mjs";
import manager from "../lib/image-manager.html?raw";
import {adminPageRequest,mediaRequest,ownerPageGate} from "../lib/media-server";
import {knowledgeRequest,publicKnowledgeRequest} from "../lib/knowledge-server";
import {PROJECT_OPTIONS_HTML} from "../lib/project-registry.ts";
import walkthroughSteps from "../lib/walkthrough-steps.json";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

// Step titles come from the build; "<" is escaped so the JSON cannot close its script tag.
const WALKTHROUGH_STEPS_JSON = JSON.stringify(walkthroughSteps).replace(/</g, "\\u003c");
const managerPage = manager
  .replace("<!--PROJECT_OPTIONS-->", PROJECT_OPTIONS_HTML)
  .replace("<!--WALKTHROUGH_STEPS-->", `<script id="walkthrough-steps" type="application/json">${WALKTHROUGH_STEPS_JSON}</script>`);

/** Prevents owner-only HTML from being cached or indexed after the identity gate. */
function privateOwnerPage(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url = new URL(request.url);
    // Public Wiki reads share a read-only endpoint; uploads and mutations stay on the owner API.
    if(url.pathname === '/api/public/knowledge' || url.pathname.startsWith('/api/public/knowledge/')) {
      return publicKnowledgeRequest(request,env).catch(()=>Response.json({error:'Unable to complete this action. Please try again.'},{status:500,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}}));
    }
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
    // Keep the legacy handbook tool URL owner-gated while reusing the current directory page.
    if(url.pathname === '/admin/handbooks' || url.pathname === '/admin/handbooks/') {
      if (url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
        return Response.redirect(url.toString(), 308);
      }
      const gate = ownerPageGate(request, '/admin/handbooks');
      if (gate) return gate;
      return handler.fetch(request, env, ctx).then(privateOwnerPage);
    }
    if(url.pathname === '/admin/knowledge' || url.pathname === '/admin/knowledge/') {
      if (url.pathname === '/admin/knowledge/') {
        url.pathname = '/admin/knowledge';
        return Response.redirect(url.toString(), 308);
      }
      const gate = ownerPageGate(request, '/admin/knowledge');
      if (gate) return gate;
      return handler.fetch(request, env, ctx).then(privateOwnerPage);
    }
    // Apply the same owner-only cache and identity gate to each module route.
    if (url.pathname.startsWith('/admin/knowledge/')) {
      if (url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
        return Response.redirect(url.toString(), 308);
      }
      const gate = ownerPageGate(request, url.pathname);
      if (gate) return gate;
      return handler.fetch(request, env, ctx).then(privateOwnerPage);
    }
    // Wiki documents are public; owner-only upload and management routes remain under /admin/knowledge/.
    if(url.pathname.startsWith('/knowledge/') && url.pathname !== '/knowledge/') {
      if (url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
        return Response.redirect(url.toString(), 308);
      }
      return handler.fetch(request, env, ctx);
    }
    const route = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    // Retired public routes keep inbound links working via a permanent redirect.
    const legacyTarget = (LEGACY_REDIRECTS as Record<string,string>)[route];
    if (legacyTarget) return Response.redirect(new URL(legacyTarget, url).toString(), 301);
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
