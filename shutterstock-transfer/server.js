import http from "node:http";
import { uploadToShutterstock } from "./shutterstock-ftps.js";

const PORT = Number(process.env.PORT || 3000);
const MAX = 50 * 1024 * 1024;

function json(res, code, body) {
  res.writeHead(code, {"content-type":"application/json; charset=utf-8"});
  res.end(JSON.stringify(body));
}

async function readMultipart(req) {
  const type = req.headers["content-type"] || "";
  const m = type.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!m) throw new Error("Content-Type multipart/form-data diperlukan");
  const boundary = Buffer.from("--" + (m[1] || m[2]));
  const chunks=[]; let total=0;
  for await (const c of req) {
    total += c.length;
    if (total > MAX) throw new Error("File melebihi 50 MB");
    chunks.push(c);
  }
  const body=Buffer.concat(chunks);
  const start=body.indexOf(boundary), end=body.lastIndexOf(boundary);
  if(start<0||end<0) throw new Error("Multipart tidak valid");
  const part=body.subarray(start+boundary.length+2,end-2);
  const sep=Buffer.from("\r\n\r\n");
  const p=part.indexOf(sep);
  if(p<0) throw new Error("Field image tidak ditemukan");
  const headers=part.subarray(0,p).toString();
  const data=part.subarray(p+4);
  const fn=(headers.match(/filename="([^"]+)"/i)||[])[1];
  if(!fn) throw new Error("Nama file tidak ditemukan");
  return {filename:fn, data};
}

const server=http.createServer(async(req,res)=>{
  if(req.method==="GET"){
    return json(res,200,{ok:true,service:"IWAN Shutterstock FTPS Transfer",status:"READY"});
  }
  if(req.method!=="POST" || req.url!=="/transfer")
    return json(res,404,{error:"Not found"});
  try{
    const {filename,data}=await readMultipart(req);
    const result=await uploadToShutterstock(data,filename);
    return json(res,200,{
      status:"FILE_TRANSFERRED",
      filename:result.filename,
      bytes:result.bytes,
      next:"OPEN_SHUTTERSTOCK_AND_PASTE_METADATA",
      final_submit:"MANUAL"
    });
  }catch(e){
    return json(res,502,{status:"TRANSFER_FAILED",error:e.message});
  }
});
server.listen(PORT,()=>console.log("Shutterstock FTPS transfer server listening on "+PORT));