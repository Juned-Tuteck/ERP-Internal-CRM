import React, { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface ComplianceFileUploadProps {
  entityType?: 'customer' | 'associate';  // Type of entity (optional for backward compatibility)
  entityId?: string | null;  // Can be null for queue mode (customerId or associateId)
  documentType: 'PAN' | 'TAN' | 'GST' | 'BANK';
  entityLevel: 'HO' | 'BRANCH';
  branchId?: string | null;  // customerBranchId or associateBranchId
  uploadBy: string;
  onUploadSuccess?: (fileData: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  label?: string;
  // Queue mode props
  onFileSelect?: (file: File | null) => void;  // Callback for queue mode
  queuedFile?: File | null;  // Display queued file
  // Legacy props for backward compatibility
  customerId?: string | null;
  customerBranchId?: string | null;
}

interface UploadedFile {
  id: string;
  original_name: string;
  stored_name: string;
  url: string;
  created_at: string;
  size: number;
}

const ComplianceFileUpload: React.FC<ComplianceFileUploadProps> = ({
  entityType: propEntityType,
  entityId: propEntityId,
  documentType,
  entityLevel,
  branchId: propBranchId,
  uploadBy,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  label,
  onFileSelect,
  queuedFile,
  // Legacy props
  customerId,
  customerBranchId,
}) => {
  // Support backward compatibility: use legacy props if new props not provided
  const entityType = propEntityType || (customerId !== undefined ? 'customer' : 'associate');
  const entityId = propEntityId !== undefined ? propEntityId : customerId;
  const branchId = propBranchId !== undefined ? propBranchId : customerBranchId;

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.dwg', '.xls', '.xlsx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Determine API endpoint based on entity type
  const getApiEndpoint = () => {
    return entityType === 'customer'
      ? 'customer-compliance-file'
      : 'associate-compliance-file';
  };

  // Determine branch ID field name based on entity type
  const getBranchIdFieldName = () => {
    return entityType === 'customer'
      ? 'customer_branch_id'
      : 'associate_branch_id';
  };

  // Fetch existing files for this document type
  useEffect(() => {
    if (entityId) {
      fetchUploadedFiles();
    }
  }, [entityId, documentType, entityLevel, branchId]);

  const fetchUploadedFiles = async () => {
    try {
      const apiEndpoint = getApiEndpoint();
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/${apiEndpoint}/${entityId}/compliance-files`
      );

      if (response.data.success) {
        // Filter files by document type, entity level, and branch ID
        const branchFieldName = getBranchIdFieldName();
        const filtered = response.data.data.filter((file: any) => {
          const matchesType = file.document_type === documentType;
          const matchesLevel = file.entity_level === entityLevel;
          const matchesBranch = entityLevel === 'HO'
            ? true
            : file[branchFieldName] === branchId;

          return matchesType && matchesLevel && matchesBranch;
        });

        setUploadedFiles(filtered);
      }
    } catch (err) {
      console.error('Error fetching uploaded files:', err);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must not exceed 10MB';
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) {
        onUploadError(validationError);
      }
      event.target.value = ''; // Reset input
      return;
    }

    // Queue mode: If entityId is null, store file in queue
    if (!entityId && onFileSelect) {
      onFileSelect(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      event.target.value = ''; // Reset input
      return;
    }

    // Upload mode: If entityId exists, upload immediately
    if (entityId) {
      await uploadFile(file);
    }

    event.target.value = ''; // Reset input
  };

  const uploadFile = async (file: File) => {
    if (!entityId) {
      setError(`${entityType === 'customer' ? 'Customer' : 'Associate'} ID is required for upload`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('entity_level', entityLevel);
      formData.append('upload_by', uploadBy);

      if (entityLevel === 'BRANCH' && branchId) {
        const branchFieldName = getBranchIdFieldName();
        formData.append(branchFieldName, branchId);
      }

      const apiEndpoint = getApiEndpoint();
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/${apiEndpoint}/${entityId}/compliance-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setUploadedFiles(prev => [...prev, response.data.data]);

        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload file';
      setError(errorMessage);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const apiEndpoint = getApiEndpoint();
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/${apiEndpoint}/${entityId}/compliance-files/${fileId}/download`,
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const getDocumentLabel = () => {
    if (label) return label;
    return `${documentType} Document`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          id={`upload-${documentType}-${entityLevel}-${branchId || 'ho'}`}
          className="hidden"
          onChange={handleFileSelect}
          accept={ALLOWED_EXTENSIONS.join(',')}
          disabled={disabled || uploading}
        />

        <label
          htmlFor={`upload-${documentType}-${entityLevel}-${branchId || 'ho'}`}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${disabled || uploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
            }`}
          title={disabled ? 'Complete Step 1 to upload documents' : `Upload ${getDocumentLabel()}`}
        >
          {uploading ? (
            <>
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </>
          )}
        </label>

        {success && (
          <div className="flex items-center text-green-600 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Uploaded successfully
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center text-red-600 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}

      {/* Queued file display (before upload) */}
      {queuedFile && !entityId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 text-xs">
          <div className="flex items-center text-yellow-800">
            <span className="font-medium">Selected:</span>
            <span className="ml-2 truncate">{queuedFile.name}</span>
            <span className="text-yellow-600 ml-2">
              ({(queuedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <div className="text-yellow-700 text-[10px] mt-0.5">
            Will be uploaded after {entityType === 'customer' ? 'customer' : 'associate'} registration
          </div>
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-xs"
            >
              <div className="flex-1 truncate">
                <span className="text-gray-700">{file.original_name}</span>
                <span className="text-gray-500 ml-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(file.id, file.original_name)}
                className="ml-2 text-blue-600 hover:text-blue-800 flex items-center"
                title="Download file"
              >
                <Download className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceFileUpload;
