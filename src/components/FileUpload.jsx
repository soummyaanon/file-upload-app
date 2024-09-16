import React, { useState, useRef } from 'react';
import { CloudUpload, Link, Chrome } from 'lucide-react';
import { uploadFile, uploadFromUrl } from '../services/uploadService';
import { auth } from '../services/firebase';

const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleUpload = async (uploadFunc, data) => {
    if (!auth.currentUser) {
      setError("Please sign in to upload files.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const fileInfo = await uploadFunc(data, setProgress);
      onFileUploaded(fileInfo);
      setProgress(0);
      setFile(null);
      setUrl('');
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const handleLocalUpload = () => {
    if (file) {
      handleUpload(uploadFile, file);
    } else {
      setError("Please select a file first.");
    }
  };

  const handleUrlUpload = () => handleUpload(uploadFromUrl, url);

  const handleGoogleDriveUpload = () => {
    // Implement Google Drive integration
    console.log("Google Drive upload not implemented yet");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ padding: '16px' }}>
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      <div style={{ marginBottom: '16px' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={triggerFileInput}
          style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <CloudUpload style={{ marginRight: '8px' }} />
          Select Local File
        </button>
        {file && <span style={{ marginLeft: '16px' }}>{file.name}</span>}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <button
          style={{ padding: '8px 16px', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleLocalUpload}
          disabled={!file || uploading}
        >
          Upload Local File
        </button>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#f50057', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleGoogleDriveUpload}
          disabled={uploading}
        >
          <Chrome style={{ marginRight: '8px' }} />
          Upload from Google Drive
        </button>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <input
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          type="text"
          placeholder="File URL"
          value={url}
          onChange={handleUrlChange}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleUrlUpload}
          disabled={!url || uploading}
        >
          <Link style={{ marginRight: '8px' }} />
          Upload from URL
        </button>
      </div>
      {uploading && (
        <div style={{ marginBottom: '16px' }}>
          <progress value={progress} max="100" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;