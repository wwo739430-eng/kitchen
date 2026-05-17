// frontend/src/pages/ScanReceipt.tsx
import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { ingredientAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ScanReceipt() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setStreamActive(true); }
    } catch (e) {
      console.error('摄像头无法访问', e);
      setStreamActive(false);
    }
  }
  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
  }

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/png');
    setCapturedImage(dataUrl);
    runOcrClientOrFallback(dataUrl);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); setCapturedImage(url);
    await runOcrClientOrFallback(url, f);
  }

  // Use high-level Tesseract.recognize to avoid explicit loadLanguage/initialize issues.
  async function runOcrClientOrFallback(src: string, fileBlob?: File) {
    setLoading(true); setOcrText(''); setLines([]); setProgress(null);

    // CLIENT OCR: try Tesseract.recognize (simpler, avoids explicit initialize)
    try {
      const options = {
        logger: (m: any) => {
          if (m && m.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100));
          }
          console.debug('tesslog', m);
        },
        corePath: 'https://unpkg.com/tesseract.js-core@2.1.0/tesseract-core.wasm.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0'
      };

      // Note: pass 'eng' for english; add 'chi_sim' if you have it available and want Chinese recognition.
      const { data: { text } } = await Tesseract.recognize(src, 'eng', options);

      setOcrText(text || '');
      const detected = (text || '').split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 1);
      setLines(detected);
      setLoading(false);
      setProgress(null);
      return;
    } catch (clientErr) {
      console.warn('Client OCR failed or resource unavailable, falling back to server OCR', clientErr);
      // continue to server fallback
    }

    // SERVER OCR fallback: POST image to /api/ocr
    try {
      let imageData: string | Blob;
      if (fileBlob) {
        imageData = fileBlob;
      } else {
        imageData = src;
      }
      // 使用 Tesseract.js 本地 OCR 识别
      const ocrResult = await Tesseract.recognize(imageData, 'chi_sim+eng');
      const text = ocrResult.data.text || '';
      setOcrText(text);
      const detected = String(text).split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 1);
      setLines(detected);
    } catch (serverErr) {
      console.error('Server OCR failed', serverErr);
      setOcrText('识别失败，请上传清晰图片或稍后重试。');
      setLines([]);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  async function addLineAsIngredient(line: string) {
    const qtyMatch = line.match(/(\d+\s*[一二两kg克斤盒包个杯]+)/) || line.match(/(\d+)/);
    const quantity = qtyMatch ? qtyMatch[0] : '';
    const name = line.replace(/[\d\.\s一二两kg克斤盒包个杯]+/g, '').trim() || line;
    try {
      await ingredientAPI.add({ name, quantity, storage_location: 'pantry' } as any);
      alert(`已添加：${name} ${quantity}`);
    } catch (err) {
      console.error('添加失败', err);
      alert('添加失败，请稍后重试');
    }
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">扫描小票入库</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">返回</button>
            <button onClick={() => { setCapturedImage(null); setOcrText(''); setLines([]); startCamera(); }} className="px-3 py-1 border rounded">重试</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            {streamActive ? <video ref={videoRef} className="w-full rounded" /> : <div className="h-64 bg-gray-100 rounded flex items-center justify-center">摄像头不可用或被拒绝</div>}
            <div className="flex gap-2 mt-3">
              <button onClick={takePhoto} className="px-4 py-2 bg-primary text-white rounded" disabled={!streamActive}>拍照识别</button>
              <label className="px-4 py-2 bg-gray-100 rounded cursor-pointer">
                上传图片
                <input onChange={onUpload} type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {capturedImage && <img src={capturedImage} alt="captured" className="mt-4 w-full rounded" />}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">识别文本 {loading && (progress !== null ? `(识别中 ${progress}%)` : '(识别中)')}</h3>
            <div className="mb-3 whitespace-pre-wrap text-sm text-gray-700">{ocrText || '在此显示识别结果'}</div>
            <div className="space-y-2">
              {lines.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="text-sm">{l}</div>
                  <div className="flex gap-2">
                    <button onClick={() => addLineAsIngredient(l)} className="px-3 py-1 bg-primary text-white rounded">添加</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}