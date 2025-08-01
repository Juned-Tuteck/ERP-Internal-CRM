import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface QuotationStep5Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onAddComment?: (comment: string) => Promise<void>;
}

const QuotationStep5: React.FC<QuotationStep5Props> = ({ formData, setFormData, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const addComment = async () => {
    if (newComment.trim()) {
      if (onAddComment) {
        setIsAddingComment(true);
        try {
          await onAddComment(newComment);
          setNewComment('');
        } catch (error) {
          console.error('Error adding comment:', error);
        } finally {
          setIsAddingComment(false);
        }
      } else {
        // Fallback for local comment addition (when not connected to API)
        const comment = {
          id: Date.now().toString(),
          text: newComment,
          author: 'Current User',
          timestamp: new Date().toISOString()
        };
        
        setFormData({
          ...formData,
          comments: [...formData.comments, comment]
        });
        
        setNewComment('');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Comments</h3>
        <p className="text-sm text-gray-600">Internal communication regarding this quotation.</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex space-x-2 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Enter comments, notes, or internal communication about this quotation..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addComment}
            disabled={!newComment.trim() || isAddingComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAddingComment ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </button>
        </div>

        {formData.comments.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {formData.comments.map((comment: any) => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No comments yet. Add the first comment above.</p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Comment Visibility</h4>
        <p className="text-xs text-blue-700">
          These comments are for internal use only and will not be visible to customers. Use this space for team communication, approval notes, and special instructions.
        </p>
      </div>
    </div>
  );
};

export default QuotationStep5;