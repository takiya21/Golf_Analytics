import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ocrService } from '../services/api';
import '../styles/upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    setLoading(true);
    try {
      const response = await ocrService.extractScoreCard(file);
      navigate('/review', { 
        state: { 
          resultId: response.data.resultId,
          ocrData: response.data 
        } 
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('ファイルのアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>📸 スコアカード画像をアップロード</h1>
        
        <div className="upload-area">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file-input"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="file-input" className="file-label">
              {file ? '別の画像を選択' : 'ここにドラッグ&ドロップまたはクリック'}
            </label>
          </div>

          {preview && (
            <div className="preview-section">
              <h3>プレビュー</h3>
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}

          <button 
            onClick={handleUpload} 
            className="btn btn-upload"
            disabled={!file || loading}
          >
            {loading ? '処理中...' : 'OCR解析を開始'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
