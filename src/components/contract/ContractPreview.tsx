import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, X, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ContractPreviewProps {
  content: string;
  title: string;
  onExportPDF: () => void;
  onClose: () => void;
  onEdit?: (newContent: string) => void;
}

export default function ContractPreview({ 
  content, 
  title, 
  onExportPDF, 
  onClose,
  onEdit 
}: ContractPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && onEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {isEditing && (
              <Button variant="default" size="sm" onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-white">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 border rounded font-serif text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontFamily: 'Times New Roman, serif' }}
            />
          ) : (
            <div 
              className="prose prose-sm max-w-none"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                lineHeight: 1.6,
                color: '#000'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
