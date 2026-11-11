/** Owner-authorized portfolio attachment storage. */
import { PROJECTS } from "./project-registry.ts";

export { PROJECTS } from "./project-registry.ts";
const OWNER_EMAIL = 'diamondbrown79@gmail.com';
const MAX_BYTES = 50 * 1024 * 1024;
type MediaKind = 'image'|'video'|'document';
/**
 * Optional walkthrough placement for an image attachment: the zero-based step it
 * illustrates in the project pop-up, and an optional marker given as percentages of
 * the image. Only images may carry a placement; visitors see it only once published.
 */
type Placement = {step:number; marker?:{x:number; y:number; label:string}};
type RecordData = {id:string; project:string; alt:string; caption:string; published:boolean; contentType:string; kind?:MediaKind; ownerId:string; createdAt:string; placement?:Placement};
const MAX_STEPS = 50;
const MAX_MARKER_LABEL = 80;
/**
 * Reads a placement from form fields or JSON. Returns null for "no placement", the
 * parsed placement, or an error message. A step is an integer 0–49; a marker needs both
 * coordinates (0–100, rounded to 0.1) and a label of at most 80 characters, which
 * defaults to "Highlight" when left blank.
 */
export function readPlacement(raw:{step?:unknown; markerX?:unknown; markerY?:unknown; markerLabel?:unknown}):Placement|null|string{
 const text=(value:unknown)=>value===undefined||value===null?'':String(value).trim();
 if(text(raw.step)==='')return null;
 const step=Number(text(raw.step));
 if(!Number.isInteger(step)||step<0||step>=MAX_STEPS)return 'Choose a valid walkthrough step.';
 const x=text(raw.markerX),y=text(raw.markerY);
 if(x===''&&y==='')return {step};
 if(x===''||y==='')return 'Set both marker positions, or clear both.';
 const mx=Number(x),my=Number(y);
 if(![mx,my].every((value)=>Number.isFinite(value)&&value>=0&&value<=100))return 'Marker positions must be between 0 and 100.';
 const label=text(raw.markerLabel)||'Highlight';
 if(label.length>MAX_MARKER_LABEL)return `Keep the marker label under ${MAX_MARKER_LABEL} characters.`;
 return {step,marker:{x:Math.round(mx*10)/10,y:Math.round(my*10)/10,label}};
}
function owner(request:Request){return !!request.headers.get('oai-authenticated-user-id')&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===OWNER_EMAIL;}
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
function sameOrigin(request:Request){return request.headers.get('Origin')===new URL(request.url).origin;}
export function isOwner(request:Request){return owner(request);}
/** Returns a redirect or denial response when an owner-only route cannot be shown. */
export function ownerPageGate(request: Request, returnTo = '/admin/'): Response | null {
 const url=new URL(request.url);const headers={'Cache-Control':'private, no-store'};
 if(!request.headers.get('oai-authenticated-user-id')){
  const signIn=new URL('/signin-with-chatgpt',url);signIn.searchParams.set('return_to',returnTo);
  return new Response(null,{status:302,headers:{...headers,Location:signIn.toString()}});
 }
 if(!isOwner(request))return new Response('This workspace is available only to the portfolio owner.',{status:403,headers});
 return null;
}
/** Guards the static owner manager and sends sign-in callbacks back to its workspace. */
export function adminPageRequest(request:Request,manager:string,returnTo='/admin/'){
 const gate = ownerPageGate(request, returnTo);
 if (gate) return gate;
 const headers={'Cache-Control':'private, no-store'};
 return new Response(manager,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}});
}
async function records(bucket:R2Bucket,project?:string){const found:RecordData[]=[];let cursor:string|undefined;do{const page=await bucket.list({prefix:'portfolio/records/',cursor});const values=await Promise.all(page.objects.map(async o=>{const value=await bucket.get(o.key);return value?value.json<RecordData>():null;}));found.push(...values.filter((r):r is RecordData=>!!r&&(!project||r.project===project)));cursor=page.truncated?page.cursor:undefined;}while(cursor);return found.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
function detect(bytes:Uint8Array,requested:string):{kind:MediaKind;contentType:string}|null{
 if(bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return {kind:'image',contentType:'image/png'};
 if(bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {kind:'image',contentType:'image/jpeg'};
 if(bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return {kind:'image',contentType:'image/webp'};
 if(bytes.length>12&&String.fromCharCode(...bytes.slice(4,8))==='ftyp')return {kind:'video',contentType:'video/mp4'};
 if(bytes.length>4&&bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3)return {kind:'video',contentType:'video/webm'};
 if(bytes.length>4&&bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46)return {kind:'document',contentType:'application/pdf'};
 return null;
}
export async function mediaRequest(request:Request,env:Cloudflare.Env):Promise<Response>{const bucket=env.BUCKET;if(!bucket)return json({error:'Attachment storage is unavailable.'},503);const url=new URL(request.url);const id=url.pathname.slice('/api/media'.length).replace(/^\//,'');const admin=owner(request);
 if(request.method==='GET'&&!id){if(url.searchParams.get('admin')==='1'&&!admin)return json({error:'Owner sign-in required.'},request.headers.get('oai-authenticated-user-id')?403:401);const project=url.searchParams.get('project')||undefined;if(project&&!PROJECTS.includes(project as typeof PROJECTS[number]))return json({error:'Unknown project.'},400);const all=await records(bucket,project);const visible=url.searchParams.get('admin')==='1'?all:all.filter(r=>r.published);const attachments=visible.map(({ownerId,...record})=>({...record,kind:record.kind||((record.contentType||'').startsWith('image/')?'image':(record.contentType||'').startsWith('video/')?'video':'document'),url:'/api/media/'+record.id}));return json({attachments,images:attachments.filter(r=>r.kind==='image')});}
 if(id&&!/^[a-f0-9-]{36}$/.test(id))return json({error:'Attachment not found.'},404);
 if(request.method==='GET'&&id){const meta=await bucket.get('portfolio/records/'+id+'.json');if(!meta)return json({error:'Attachment not found.'},404);const record=await meta.json<RecordData>();if(!record.published&&!admin)return json({error:'Attachment not found.'},404);const object=await bucket.get('portfolio/images/'+id);if(!object)return json({error:'Attachment not found.'},404);return new Response(object.body,{headers:{'Content-Type':record.contentType,'Content-Disposition':record.kind==='document'?'inline':'inline','Cache-Control':record.published?'public, max-age=60':'private, no-store','X-Content-Type-Options':'nosniff'}});}
 if(!admin)return json({error:'Only the portfolio owner can change attachments.'},request.headers.get('oai-authenticated-user-id')?403:401);if(!sameOrigin(request))return json({error:'Please submit from this website.'},403);
 if(request.method==='POST'&&!id){if(Number(request.headers.get('Content-Length'))>MAX_BYTES+65536)return json({error:'Maximum attachment size is 50 MB.'},413);const form=await request.formData();const file=form.get('file')||form.get('image');const alt=String(form.get('alt')||'').trim();const caption=String(form.get('caption')||'').trim();const project=String(form.get('project')||'');if(!(file instanceof File)||!file.size)return json({error:'Choose an attachment.'},400);if(file.size>MAX_BYTES)return json({error:'Maximum attachment size is 50 MB.'},413);if(!alt||alt.length>500||caption.length>2000)return json({error:'Add alt text or a short description, and keep captions under 2,000 characters.'},400);if(!PROJECTS.includes(project as typeof PROJECTS[number]))return json({error:'Choose a project.'},400);const bytes=new Uint8Array(await file.arrayBuffer());const detected=detect(bytes,file.type);if(!detected)return json({error:'Use PNG, JPEG, WebP, PDF, MP4, or WebM files.'},415);const placement=readPlacement({step:form.get('step')??undefined,markerX:form.get('markerX')??undefined,markerY:form.get('markerY')??undefined,markerLabel:form.get('markerLabel')??undefined});if(typeof placement==='string')return json({error:placement},400);if(placement&&detected.kind!=='image')return json({error:'Only images can be walkthrough steps.'},400);const id=crypto.randomUUID();const record:RecordData={id,project,alt,caption,published:false,...detected,ownerId:request.headers.get('oai-authenticated-user-id')!,createdAt:new Date().toISOString(),...(placement?{placement}:{})};await bucket.put('portfolio/images/'+id,bytes,{httpMetadata:{contentType:detected.contentType}});try{await bucket.put('portfolio/records/'+id+'.json',JSON.stringify(record));}catch(e){await bucket.delete('portfolio/images/'+id);throw e;}return json({attachment:{...record,ownerId:undefined,url:'/api/media/'+id}},201);}
 if(request.method==='PATCH'&&id){const key='portfolio/records/'+id+'.json';const meta=await bucket.get(key);if(!meta)return json({error:'Attachment not found.'},404);const current=await meta.json<RecordData>();const input=await request.json() as Partial<RecordData>;const alt=typeof input.alt==='string'?input.alt.trim():current.alt;const caption=typeof input.caption==='string'?input.caption.trim():current.caption;if(!alt||alt.length>500||caption.length>2000)return json({error:'Check description and caption lengths.'},400);let placement=current.placement;if('placement' in input){const raw=(input as {placement?:unknown}).placement;if(raw===null){placement=undefined;}else if(typeof raw==='object'){const p=raw as {step?:unknown;marker?:{x?:unknown;y?:unknown;label?:unknown}|null};const parsed=readPlacement({step:p.step,markerX:p.marker?.x,markerY:p.marker?.y,markerLabel:p.marker?.label});if(typeof parsed==='string')return json({error:parsed},400);const kind=current.kind||((current.contentType||'').startsWith('image/')?'image':'document');if(parsed&&kind!=='image')return json({error:'Only images can be walkthrough steps.'},400);placement=parsed??undefined;}else return json({error:'Choose a valid walkthrough step.'},400);}const next:RecordData={...current,alt,caption,published:typeof input.published==='boolean'?input.published:current.published,placement};if(!placement)delete next.placement;const result=await bucket.put(key,JSON.stringify(next),{onlyIf:{etagMatches:meta.etag}});return result?json({saved:true,published:next.published}):json({error:'This attachment changed elsewhere. Refresh and try again.'},409);}
 if(request.method==='DELETE'&&id){await bucket.delete(['portfolio/records/'+id+'.json','portfolio/images/'+id]);return json({deleted:true});}return json({error:'Method not allowed.'},405);}
