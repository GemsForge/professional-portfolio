import test from 'node:test';
import assert from 'node:assert/strict';
import {mediaRequest} from '../lib/media-server.ts';
import {PROJECTS} from '../lib/project-registry.ts';
import {MAX_ATTACHMENT_BYTES,createAttachmentPasteHandler} from '../public/assets/attachment-paste.js';
class Bucket {
 data=new Map(); version=0;
 async put(key,value,options={}){const old=this.data.get(key);if(options.onlyIf&&old?.etag!==options.onlyIf.etagMatches)return null;const bytes=typeof value==='string'?new TextEncoder().encode(value):value;const etag=String(++this.version);this.data.set(key,{bytes,etag});return {etag};}
 async get(key){const item=this.data.get(key);return item?{etag:item.etag,body:item.bytes,json:async()=>JSON.parse(new TextDecoder().decode(item.bytes))}:null;}
 async list({prefix}){return {objects:[...this.data.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key})),truncated:false};}
 async delete(keys){for(const k of Array.isArray(keys)?keys:[keys])this.data.delete(k);}
}
const site='https://www.gemsforge.com';
test('attachment project registry keeps the full project list independent of profile cards',()=>{
 assert.deepEqual(PROJECTS,['hair-log','75-hard-automation','auralogbook','apple-ecosystem','dynamic-folder-structures','notion-api-shortcuts']);
});
const headers={'oai-authenticated-user-id':'owner-site-id','oai-authenticated-user-email':'diamondbrown79@gmail.com',Origin:site};
function req(path,method='GET',body,extra=headers){return new Request(site+path,{method,headers:extra,...(body?{body}:{})});}
function upload(alt='Screenshot showing the folder loop'){const f=new FormData();f.set('project','dynamic-folder-structures');f.set('alt',alt);f.set('caption','Sample project');f.set('image',new File([new Uint8Array([137,80,78,71,13,10,26,10,0])],'test.png',{type:'image/png'}));return f;}
test('anonymous and another signed-in user cannot write or inspect drafts',async()=>{const env={BUCKET:new Bucket()};assert.equal((await mediaRequest(req('/api/media','POST',upload(),{}),env)).status,401);assert.equal((await mediaRequest(req('/api/media?admin=1','GET',null,{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.com'}),env)).status,403);assert.equal((await mediaRequest(req('/api/media','POST',upload(),{...headers,Origin:'https://elsewhere.example'}),env)).status,403);});
test('draft persists, stays private, publishes, updates, unpublishes, and deletes',async()=>{const env={BUCKET:new Bucket()};const response=await mediaRequest(req('/api/media','POST',upload()),env);assert.equal(response.status,201);const {attachment:image}=await response.json();assert.equal(image.published,false);assert.equal((await (await mediaRequest(req('/api/media','GET',null,{}),env)).json()).images.length,0);assert.equal((await mediaRequest(req('/api/media/'+image.id,'GET',null,{}),env)).status,404);assert.equal((await (await mediaRequest(req('/api/media?admin=1'),env)).json()).images.length,1);let response2=await mediaRequest(req('/api/media/'+image.id,'PATCH',JSON.stringify({published:true,caption:'Published proof'})),env);assert.equal(response2.status,200);const pub=await (await mediaRequest(req('/api/media','GET',null,{}),env)).json();assert.equal(pub.images[0].caption,'Published proof');assert.equal(pub.images[0].ownerId,undefined);assert.equal((await mediaRequest(req('/api/media/'+image.id,'GET',null,{}),env)).status,200);await mediaRequest(req('/api/media/'+image.id,'PATCH',JSON.stringify({published:false})),env);assert.equal((await mediaRequest(req('/api/media/'+image.id,'GET',null,{}),env)).status,404);await mediaRequest(req('/api/media/'+image.id,'DELETE'),env);assert.equal(env.BUCKET.data.size,0);});
test('missing alternative text and disguised non-image files are rejected',async()=>{const env={BUCKET:new Bucket()};assert.equal((await mediaRequest(req('/api/media','POST',upload('')),env)).status,400);const form=upload();form.set('image',new File(['<svg></svg>'],'fake.png',{type:'image/png'}));assert.equal((await mediaRequest(req('/api/media','POST',form),env)).status,415);assert.equal(env.BUCKET.data.size,0);});

test('paste selects one supported image, PDF, or video through the existing upload flow',()=>{
 for(const type of ['image/png','image/jpeg','image/webp','application/pdf','video/mp4','video/webm']){
  const file={name:`attachment.${type.split('/')[1]}`,type,size:12};let selected;let rejected;let prevented=false;
  createAttachmentPasteHandler({onFile:value=>selected=value,onReject:value=>rejected=value})({clipboardData:{files:[file]},preventDefault(){prevented=true}});
  assert.equal(selected,file);assert.equal(rejected,undefined);assert.equal(prevented,true);
 }
});

test('paste rejects unsupported, oversized, and ambiguous multiple files without selecting anything',()=>{
 for(const [files,message] of [
  [[{name:'archive.zip',type:'application/zip',size:1}],'file type is not supported'],
  [[{name:'empty.png',type:'image/png',size:0}],'attachment is empty'],
  [[{name:'large.png',type:'image/png',size:MAX_ATTACHMENT_BYTES+1}],'larger than 50 MB'],
  [[{name:'one.png',type:'image/png',size:1},{name:'two.pdf',type:'application/pdf',size:1}],'one attachment at a time'],
 ]){
  let selected;let rejected='';let prevented=false;
  createAttachmentPasteHandler({onFile:value=>selected=value,onReject:value=>rejected=value})({clipboardData:{files},preventDefault(){prevented=true}});
  assert.equal(selected,undefined);assert.match(rejected,new RegExp(message));assert.equal(prevented,true);
 }
});

test('ordinary text paste is not intercepted, and unreadable file items get an actionable error',()=>{
 let rejected='';let prevented=false;
 const handler=createAttachmentPasteHandler({onFile(){},onReject:value=>rejected=value});
 handler({clipboardData:{files:[],items:[{kind:'string'}]},preventDefault(){prevented=true}});
 assert.equal(prevented,false);assert.equal(rejected,'');
 handler({clipboardData:{files:[],items:[{kind:'file',getAsFile:()=>null}]},preventDefault(){prevented=true}});
 assert.equal(prevented,true);assert.match(rejected,/could not be read/i);
});
