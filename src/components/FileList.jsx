import React, { useState, useEffect } from 'react';
import { Trash2, Download, RefreshCw } from 'lucide-react';
import { getFileList, deleteFile } from '../services/uploadService';
import { auth } from '../services/firebase';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        throw new Error("Please sign in to view your files.");
      }
      const fileList = await getFileList();
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching file list:', error);
      setError(error.message || "Failed to fetch file list. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileName) => {
    try {
      await deleteFile(fileName);
      // After successful deletion, update the file list
      setFiles(files.filter(file => file.name !== fileName));
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(`Failed to delete ${fileName}. Please try again.`);
    }
  };

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchFiles} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          <RefreshCw style={{ marginRight: '8px' }} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {files.map((file) => (
            <li key={file.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ccc' }}>
              <span>{file.name}</span>
              <div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}
                  aria-label="download"
                  onClick={() => handleDownload(file.url)}
                >
                  <Download />
                </button>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="delete"
                  onClick={() => handleDelete(file.name)}
                >
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;