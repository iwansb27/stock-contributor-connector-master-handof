const $=id=>document.getElementById(id);
const state={jobId:null,file:null};
function newJob(){return "JOB-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase()}
function setStatus(s){$("status").textContent=s}
$("imageInput").addEventListener("change",e=>{
 const file=e.target.files?.[0]; if(!file)return;
 state.file=file; state.jobId=newJob(); $("jobId").textContent=state.jobId; setStatus("UPLOADED");
 const url=URL.createObjectURL(file);
 $("preview").className="preview"; $("preview").innerHTML="";
 const img=document.createElement("img"); img.src=url; img.alt=file.name; $("preview").appendChild(img);
 $("transferNote").textContent="Gambar siap diproses. Transfer FTPS belum tersedia di static-only P2.";
});
$("analyzeBtn").addEventListener("click",()=>{
 if(!state.file){alert("Pilih gambar terlebih dahulu.");return}
 const base=state.file.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
 $("title").value=base||"Stock image";
 $("description").value="Stock image of "+(base||"the submitted subject")+". Review and edit before submitting to Shutterstock.";
 $("keywords").value=[...new Set((base||"stock image").toLowerCase().split(/\s+/).concat(["stock","image","commercial","photography"]))].join(", ");
 setStatus("METADATA_READY");
 $("workflow").textContent="UPLOADED → METADATA_READY → READY_FOR_SHUTTERSTOCK → MANUAL_SUBMIT";
});
document.querySelectorAll(".copy").forEach(btn=>btn.addEventListener("click",async()=>{
 const value=$(btn.dataset.copy).value.trim(); if(!value)return;
 try{await navigator.clipboard.writeText(value);btn.textContent="Copied";setTimeout(()=>btn.textContent=btn.dataset.copy==="keywords"?"Copy All":"Copy",1000)}
 catch{alert("Clipboard tidak tersedia. Pilih teks lalu salin manual.")}
}));
$("openBtn").addEventListener("click",()=>window.open("https://submit.shutterstock.com/","_blank","noopener"));
$("transferBtn").addEventListener("click",()=>alert("Transfer gambar belum diaktifkan. P2 tidak mengklaim FTPS berhasil tanpa backend yang benar-benar terbukti."));
