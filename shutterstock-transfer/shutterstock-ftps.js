import net from "node:net";
import tls from "node:tls";

const HOST=process.env.SHUTTERSTOCK_FTPS_HOST||"ftps.shutterstock.com";
const PORT=Number(process.env.SHUTTERSTOCK_FTPS_PORT||21);
const TIMEOUT=30000;

function reply(socket){
  return new Promise((resolve,reject)=>{
    let buf="";
    const onData=d=>{
      buf+=d.toString();
      const lines=buf.split("\r\n");
      for(let i=0;i<lines.length-1;i++){
        const line=lines[i];
        if(/^\d{3} /.test(line)){
          socket.off("data",onData); resolve({code:Number(line.slice(0,3)),text:line});
          return;
        }
      }
    };
    socket.on("data",onData); socket.once("error",reject);
  });
}
function cmd(socket,s){
  socket.write(s+"\r\n");
  return reply(socket);
}
function connect(){
  return new Promise((resolve,reject)=>{
    const s=net.createConnection({host:HOST,port:PORT});
    s.setTimeout(TIMEOUT);
    s.once("connect",async()=>{
      try{ const r=await reply(s); if(r.code!==220) throw Error(r.text); resolve(s); }
      catch(e){s.destroy();reject(e);}
    });
    s.once("timeout",()=>{s.destroy();reject(Error("FTPS timeout"));});
    s.once("error",reject);
  });
}
function tlsWrap(socket){
  return new Promise((resolve,reject)=>{
    const t=tls.connect({socket,host:HOST,servername:HOST,rejectUnauthorized:true},()=>{
      t.setTimeout(TIMEOUT); resolve(t);
    });
    t.once("error",reject); t.once("timeout",()=>{t.destroy();reject(Error("TLS timeout"));});
  });
}
async function passive(control){
  let r=await cmd(control,"EPSV");
  if(r.code===229){
    const m=r.text.match(/\(\|\|\|(\d+)\|/);
    if(!m) throw Error("EPSV response invalid");
    return {host:HOST,port:Number(m[1])};
  }
  r=await cmd(control,"PASV");
  if(r.code!==227) throw Error("Passive mode failed: "+r.text);
  const m=r.text.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if(!m) throw Error("PASV response invalid");
  return {host:m.slice(1,5).join("."),port:Number(m[5])*256+Number(m[6])};
}
export async function uploadToShutterstock(buffer,filename){
  if(!/^[A-Za-z0-9_]+\.[A-Za-z0-9]+$/.test(filename)) throw Error("Nama file tidak aman");
  const user=process.env.SHUTTERSTOCK_FTPS_USERNAME;
  const pass=process.env.SHUTTERSTOCK_FTPS_PASSWORD;
  if(!user||!pass) throw Error("FTPS credentials belum dikonfigurasi di server");
  let c;
  try{
    c=await connect();
    let r=await cmd(c,"AUTH TLS"); if(r.code!==234) throw Error(r.text);
    c=await tlsWrap(c);
    r=await cmd(c,"PBSZ 0"); if(r.code!==200) throw Error(r.text);
    r=await cmd(c,"PROT P"); if(r.code!==200) throw Error(r.text);
    r=await cmd(c,"USER "+user); if(r.code!==331&&r.code!==230) throw Error(r.text);
    if(r.code!==230){r=await cmd(c,"PASS "+pass); if(r.code!==230) throw Error(r.text);}
    r=await cmd(c,"TYPE I"); if(r.code!==200) throw Error(r.text);
    const data=await passive(c);
    const d=await new Promise((resolve,reject)=>{
      const s=tls.connect({host:data.host,port:data.port,servername:HOST,rejectUnauthorized:true},()=>resolve(s));
      s.once("error",reject); s.setTimeout(TIMEOUT,()=>{s.destroy();reject(Error("Data TLS timeout"));});
    });
    r=await cmd(c,"STOR "+filename);
    if(r.code!==150&&r.code!==125){d.destroy();throw Error(r.text);}
    await new Promise((resolve,reject)=>{d.once("close",resolve);d.once("error",reject);d.end(buffer);});
    r=await reply(c);
    if(r.code!==226&&r.code!==250) throw Error("Transfer completion not confirmed: "+r.text);
    await cmd(c,"QUIT").catch(()=>{});
    return {status:"FILE_TRANSFERRED",filename,bytes:buffer.length};
  }finally{try{c?.destroy()}catch{}}
}