/**
 * DOCUMENT MANAGER COMPONENT
 * Features:
 * - Multi-file upload support for contracts, agreements, and images.
 * - Integration with backend storage (Multer/Cloudinary).
 * - Real-time upload progress and status indicators.
 * - File type icons (PDF, Image, Generic).
 */

import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, File, 
  Upload, Trash2, Download, Loader2, CheckCircle 
} from 'lucide-react';
import api from '../utils/api';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

interface Props {
  entityId: string; // The ID of the Deal or Client
  entityType: 'deal' | 'client';
  existingDocs?: Document[];
}

const DocumentManager = ({ entityId, entityType, existingDocs = [] }: Props) => {
  const [docs, setDocs] = useState<Document[]>(existingDocs);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);

    setUploading(true);

    try {
      // Endpoint assumes you have a Multer-powered route on the backend
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocs([...docs, res.data]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="text-blue-500" />;
    return <File className="text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <FileText size={18} className="text-purple-600" /> Documents & Contracts
        </h3>
        <label className="cursor-pointer bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-2">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload New'}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      <div className="divide-y divide-gray-100">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                  {getFileIcon(doc.type)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{doc.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{doc.size} • {doc.type.split('/')[1]}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Download size={16} />
                </a>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-300 mb-3">
              <FileText size={24} />
            </div>
            <p className="text-sm text-gray-400">No documents attached yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;