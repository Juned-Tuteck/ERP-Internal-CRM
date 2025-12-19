import React, { useState, useRef } from 'react';
import { Upload, File, X, Download, Check, AlertCircle } from 'lucide-react';

interface ComplianceFile {
  id: string;
  original_name: string;
  size: number;
  created_at: string;
  url: string;
}

interface ComplianceFileUploadProps {
  documentType: 'PAN' | 'TAN' | 'GST' | 'BANK';
  entityLevel: 'HO' | 'BRANCH';
  customerId?: string;
  customerBranchId?: string;
  uploadedFiles: ComplianceFile[];
  onUploadSuccess: (file: ComplianceFile) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  uploadBy: string;
}

const ComplianceFileUpload: React.FC<ComplianceFileUploadProps> = ({
  documentType,
  entityLevel,
  customerId,
  customerBranchId,
  uploadedFiles,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  uploadBy,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      onUploadError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      onUploadError('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
      return;
    }

    if (!customerId) {
      onUploadError('Customer ID is required for upload');
      return;
    }

    // Upload file
    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('entity_level', entityLevel);
      formData.append('upload_by', uploadBy);

      if (entityLevel === 'BRANCH' && customerBranchId) {
        formData.append('customer_branch_id', customerBranchId);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customer/${customerId}/compliance-files`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      setUploadSuccess(true);
      onUploadSuccess(result.data);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Hide success message after 2 seconds
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (error: any) {
      onUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/customer/${customerId}/compliance-files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
            disabled || uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              Upload {documentType}
            </>
          )}
        </button>

        {uploadSuccess && (
          <span className="inline-flex items-center text-xs text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Uploaded!
          </span>
        )}
      </div>

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate" title={file.original_name}>
                  {file.original_name}
                </span>
                <span className="text-gray-500 text-xs flex-shrink-0">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(file.id, file.original_name)}
                className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceFileUpload;
