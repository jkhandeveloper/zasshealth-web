// Dependency-free preview for the static export. Run npm run build first.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'out');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end('Bad request')}
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden')}
 fs.stat(file,(err,stat)=>{if(!err&&stat.isDirectory())file=path.join(file,'index.html');fs.readFile(file,(error,data)=>{if(error){fs.readFile(path.join(root,'404.html'),(missingError,page)=>{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(missingError?'Not found':page)});return}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data)})});
}).listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log(`Zass Health: http://127.0.0.1:${process.env.PORT||3000}`));
