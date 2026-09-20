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
 $("transferNote").textContent="Gambar siap diproses. Transfer FTPS masih menunggu recovery dan pengujian mesin lama.";
});

$("analyzeBtn").addEventListener("click",async()=>{
 if(!state.file){alert("Pilih gambar terlebih dahulu.");return}
 const endpoint=window.STOCK_AI_API_URL;
 if(!endpoint){
   alert("DeepSeek sudah menjadi AI engine P2, tetapi endpoint server belum dikonfigurasi. Jangan masukkan API key DeepSeek ke browser/GitHub Pages.");
   return;
 }
 setStatus("ANALYZING");
 $("workflow").textContent="UPLOADED → DEEPSEEK_ANALYSIS → METADATA_READY → READY_FOR_SHUTTERSTOCK → MANUAL_SUBMIT";
 $("analyzeBtn").disabled=true;
 try{
   const form=new FormData(); form.append("image",state.file,state.file.name);
   const response=await fetch(endpoint.replace(/\/$/,"")+"/api/analyze",{method:"POST",body:form});
   const data=await response.json();
   if(!response.ok) throw new Error(data.error||"DeepSeek analysis failed.");
   const m=data.metadata||{};
   $("title").value=m.title||"";
   $("description").value=m.description||"";
   $("keywords").value=Array.isArray(m.keywords)?m.keywords.join(", "):"";
   const notes=[];
   if(m.category_suggestion) notes.push("Kategori saran AI: "+m.category_suggestion);
   if(Array.isArray(m.visible_text)&&m.visible_text.length) notes.push("Teks terlihat: "+m.visible_text.join(", "));
   if(m.brand_or_logo_detected) notes.push("Perhatian: logo/brand terdeteksi.");
   if(m.people_or_property_release_attention) notes.push("Perhatian: periksa kebutuhan release.");
   $("aiNote").textContent=notes.length?notes.join(" · "):"DeepSeek metadata siap. Tetap review sebelum submit.";
   setStatus("METADATA_READY");
 }catch(err){
   setStatus("AI_ERROR");
   alert(err.message||"DeepSeek analysis failed.");
 }finally{
   $("analyzeBtn").disabled=false;
 }
});

document.querySelectorAll(".copy").forEach(btn=>btn.addEventListener("click",async()=>{
 const value=$(btn.dataset.copy).value.trim(); if(!value)return;
 try{await navigator.clipboard.writeText(value);btn.textContent="Copied";setTimeout(()=>btn.textContent=btn.dataset.copy==="keywords"?"Copy All":"Copy",1000)}
 catch{alert("Clipboard tidak tersedia. Pilih teks lalu salin manual.")}
}));

$("openBtn").addEventListener("click",()=>window.open("https://submit.shutterstock.com/","_blank","noopener"));
$("transferBtn").addEventListener("click",()=>alert("Transfer gambar belum diaktifkan. P2 tidak mengklaim FTPS berhasil tanpa backend yang benar-benar terbukti."));
