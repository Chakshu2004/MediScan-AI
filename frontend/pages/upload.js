/**
 * pages/upload.js — File upload + text paste + trigger analysis
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../utils/AuthContext";
import { uploadReport, triggerAnalysis } from "../utils/api";

const SAMPLE = `COMPLETE BLOOD COUNT (CBC) REPORT
Patient: Sample Patient  |  Date: 26-Mar-2026  |  Lab: MedPath Diagnostics

TEST               RESULT    UNIT       REFERENCE RANGE     FLAG
Haemoglobin        11.2      g/dL       13.0 - 17.0         LOW
RBC Count          3.9       mil/µL     4.5 - 5.5           LOW
WBC Count          11800     /µL        4000 - 11000        HIGH
Platelet Count     180000    /µL        150000 - 400000     NORMAL
MCV                72        fL         80 - 100            LOW
MCH                24.1      pg         27 - 33             LOW
Neutrophils        78        %          40 - 75             HIGH
Lymphocytes        16        %          20 - 45             LOW
Fasting Glucose    92        mg/dL      70 - 100            NORMAL
Total Cholesterol  214       mg/dL      <200                BORDERLINE`;

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router   = useRouter();
  const fileRef  = useRef(null);
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState(null);
  const [rawText, setRawText]     = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleFile = (f) => {
    if (!f) return;
    const maxMB = 10;
    if (f.size > maxMB * 1024 * 1024) {
      toast.error(`File must be under ${maxMB} MB`);
      return;
    }
    setFile(f);
    toast.success(`${f.name} selected`);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async () => {
    if (!file && !rawText.trim()) {
      toast.error("Please upload a file or paste report text");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      if (file)          fd.append("file",     file);
      if (rawText.trim()) fd.append("raw_text", rawText);

      const { data: report } = await uploadReport(fd);
      toast.success("Report uploaded — analysing…");

      const { data: analysis } = await triggerAnalysis(report.id);
      toast.success("Analysis complete!");
      router.push(`/analysis/${report.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) return <Layout><LoadingSpinner /></Layout>;
  if (uploading)   return <Layout><LoadingSpinner message="Analysing your report…" sub="This takes about 10 seconds" /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"40px 32px" }}>

        <h2 style={{ fontFamily:"var(--font-display, 'Fraunces', serif)",
          fontSize:32, fontWeight:400, marginBottom:8 }}>
          Upload Report
        </h2>
        <p style={{ color:"var(--text2)", fontSize:14, marginBottom:36, fontWeight:300 }}>
          Drop a file or paste your report text to begin AI analysis
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={handleDrop}
          onClick={()=>fileRef.current?.click()}
          style={{
            border:`2px dashed ${dragOver?"var(--teal)":"var(--border2)"}`,
            borderRadius:16, padding:"64px 32px", textAlign:"center", cursor:"pointer",
            background:dragOver?"rgba(56,178,172,0.05)":"var(--bg3)",
            transition:"all 0.25s",
          }}
        >
          <div style={{ fontSize:48, marginBottom:20 }}>📂</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>
            Drop your report here
          </div>
          <div style={{ fontSize:13, color:"var(--text3)", marginBottom:20 }}>
            or click to browse files
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            {["pdf","jpg","png","tiff"].map(f=>(
              <span key={f} style={{
                padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:500,
                background:"var(--surface)", border:"1px solid var(--border)",
                color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)",
              }}>.{f}</span>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff"
            style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
        </div>

        {/* File preview */}
        {file && (
          <div style={{
            marginTop:16, padding:"14px 18px", borderRadius:10,
            border:"1px solid var(--border)", background:"var(--surface)",
            display:"flex", alignItems:"center", gap:14,
          }}>
            <span style={{ fontSize:28 }}>📄</span>
            <div>
              <div style={{ fontWeight:500, fontSize:14 }}>{file.name}</div>
              <div style={{ fontSize:12, color:"var(--text3)",
                fontFamily:"var(--font-mono, 'DM Mono', monospace)" }}>
                {(file.size/1024).toFixed(1)} KB
              </div>
            </div>
            <button onClick={(e)=>{e.stopPropagation();setFile(null);}} style={{
              marginLeft:"auto", padding:"4px 10px", borderRadius:6, fontSize:12,
              border:"1px solid var(--border)", background:"transparent",
              color:"var(--text3)", cursor:"pointer", fontFamily:"inherit",
            }}>✕</button>
          </div>
        )}

        {/* Text area */}
        <div style={{ marginTop:28 }}>
          <div style={{ fontSize:13, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase",
            color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)",
            marginBottom:10 }}>
            Or paste report text
          </div>
          <textarea
            value={rawText}
            onChange={e=>setRawText(e.target.value)}
            placeholder="Paste your medical report text here…"
            rows={8}
            style={{
              width:"100%", padding:14, borderRadius:10,
              border:"1px solid var(--border)", background:"var(--surface)",
              color:"var(--text)", fontFamily:"var(--font-mono, 'DM Mono', monospace)",
              fontSize:12, resize:"vertical", outline:"none", lineHeight:1.6,
            }}
            onFocus={e=>e.target.style.borderColor="var(--teal)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
          <button
            onClick={()=>setRawText(SAMPLE)}
            style={{
              marginTop:8, padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:500,
              border:"1px solid var(--border)", background:"var(--surface)",
              color:"var(--text3)", cursor:"pointer", fontFamily:"inherit",
            }}
          >
            Load Sample CBC Report
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!file && !rawText.trim()}
          style={{
            width:"100%", padding:16, borderRadius:12, fontSize:15, fontWeight:600,
            cursor:"pointer", border:"none", marginTop:20,
            background:"linear-gradient(135deg, var(--teal), #2c7a7b)", color:"white",
            fontFamily:"inherit", boxShadow:"0 4px 24px rgba(56,178,172,0.25)",
            opacity: (!file && !rawText.trim()) ? 0.5 : 1,
          }}
        >
          🧠 Analyse with AI
        </button>
      </div>
    </Layout>
  );
}
