import React, { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface ComplianceFileUploadForCompetitorProps {
    competitorId: string | null;
    documentType: 'PAN' | 'TAN' | 'GST' | 'BANK';
    entityLevel: 'HO' | 'BRANCH';
    competitorBranchId?: string | null;
    uploadBy: string;
    onUploadSuccess?: (fileData: any) => void;
    onUploadError?: (error: string) => void;
    disabled?: boolean;
    label?: string;
    onFileSelect?: (file: File | null) => void;
    queuedFile?: File | null;
}

interface UploadedFile {
    id: string;
    original_name: string;
    stored_name: string;
    url: string;
    created_at: string;
    size: number;
}

const ComplianceFileUploadForCompetitor: React.FC<ComplianceFileUploadForCompetitorProps> = ({
    competitorId,
    documentType,
    entityLevel,
    competitorBranchId = null,
    uploadBy,
    onUploadSuccess,
    onUploadError,
    disabled = false,
    label,
    onFileSelect,
    queuedFile,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.dwg', '.xls', '.xlsx'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    useEffect(() => {
        if (competitorId) {
            fetchUploadedFiles();
        }
    }, [competitorId, documentType, entityLevel, competitorBranchId]);

    const fetchUploadedFiles = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files`
            );

            if (response.data.success) {
                const filtered = response.data.data.filter((file: any) => {
                    const matchesType = file.document_type === documentType;
                    const matchesLevel = file.entity_level === entityLevel;
                    const matchesBranch = entityLevel === 'HO' ? true : file.competitor_branch_id === competitorBranchId;
                    return matchesType && matchesLevel && matchesBranch;
                });
                setUploadedFiles(filtered);
            }
        } catch (err) {
            console.error('Error fetching uploaded files:', err);
        }
    };

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must not exceed 10MB';
        }
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

        setError(null);
        setSuccess(false);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            if (onUploadError) onUploadError(validationError);
            event.target.value = '';
            return;
        }

        if (!competitorId && onFileSelect) {
            onFileSelect(file);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            event.target.value = '';
            return;
        }

        if (competitorId) {
            await uploadFile(file);
        }
        event.target.value = '';
    };

    const uploadFile = async (file: File) => {
        if (!competitorId) {
            setError('Competitor ID is required for upload');
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

            if (entityLevel === 'BRANCH' && competitorBranchId) {
                formData.append('competitor_branch_id', competitorBranchId);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                setSuccess(true);
                setUploadedFiles(prev => [...prev, response.data.data]);
                if (onUploadSuccess) onUploadSuccess(response.data.data);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to upload file';
            setError(errorMessage);
            if (onUploadError) onUploadError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId: string, fileName: string) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files/${fileId}/download`,
                { responseType: 'blob' }
            );

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
                    id={`upload-${documentType}-${entityLevel}-${competitorBranchId || 'ho'}`}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    disabled={disabled || uploading}
                />
                <label
                    htmlFor={`upload-${documentType}-${entityLevel}-${competitorBranchId || 'ho'}`}
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

            {error && (
                <div className="flex items-center text-red-600 text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    {error}
                </div>
            )}

            {queuedFile && !competitorId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 text-xs">
                    <div className="flex items-center text-yellow-800">
                        <span className="font-medium">Selected:</span>
                        <span className="ml-2 truncate">{queuedFile.name}</span>
                        <span className="text-yellow-600 ml-2">({(queuedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <div className="text-yellow-700 text-[10px] mt-0.5">
                        Will be uploaded after competitor registration
                    </div>
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="space-y-1">
                    {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-xs">
                            <div className="flex-1 truncate">
                                <span className="text-gray-700">{file.original_name}</span>
                                <span className="text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
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

export default ComplianceFileUploadForCompetitor;
