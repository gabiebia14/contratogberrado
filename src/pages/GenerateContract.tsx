import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { useOCR } from '@/hooks/useOCR';
import { useContractGeneration } from '@/hooks/useContractGeneration';
import PartySelector from '@/components/contract/PartySelector';
import PropertyDataForm from '@/components/contract/PropertyDataForm';
import ContractPreview from '@/components/contract/ContractPreview';
import { PropertyData, defaultPropertyData } from '@/types/property';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Party {
  id: string;
  role: string;
  documentId: string;
  extractedData: Record<string, string>;
}

export default function GenerateContract() {
  const navigate = useNavigate();
  const { templates, loading: templatesLoading } = useContractTemplates();
  const { processedDocuments, loading: documentsLoading } = useOCR();
  const { generating, generatedContent, generateContract, exportToPDF, setGeneratedContent } = useContractGeneration();

  const [step, setStep] = useState(1);
  const [contractTitle, setContractTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyData>(defaultPropertyData);
  const [showPreview, setShowPreview] = useState(false);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Helper to extract name from document data (handles prefixed and non-prefixed fields)
  const getNameFromExtractedData = (data: Record<string, string>): string | null => {
    if (data.nome_completo) return data.nome_completo;
    if (data.nome) return data.nome;
    
    // Look for prefixed name fields (e.g., locatario_nome, locador_nome)
    const nameKey = Object.keys(data).find(key => key.endsWith('_nome') && data[key]);
    if (nameKey) return data[nameKey];
    
    return null;
  };

  // Filter documents with valid extracted data
  const validDocuments = processedDocuments.filter((doc) => {
    if (!doc.extracted_data) return false;
    try {
      const data = typeof doc.extracted_data === 'string' 
        ? JSON.parse(doc.extracted_data) 
        : doc.extracted_data;
      return getNameFromExtractedData(data) !== null;
    } catch {
      return false;
    }
  });

  const handleNext = () => {
    if (step === 1 && !selectedTemplateId) {
      toast.error('Selecione um modelo de contrato');
      return;
    }
    if (step === 1 && !contractTitle.trim()) {
      toast.error('Informe o título do contrato');
      return;
    }
    if (step === 2 && parties.length === 0) {
      toast.error('Adicione pelo menos uma parte ao contrato');
      return;
    }
    if (step === 2 && parties.some(p => !p.role || !p.documentId)) {
      toast.error('Preencha todos os dados das partes');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    try {
      await generateContract({
        templateId: selectedTemplateId,
        templateContent: selectedTemplate.content,
        parties: parties.map(p => ({
          role: p.role,
          documentId: p.documentId,
          extractedData: p.extractedData
        })),
        propertyData,
        title: contractTitle
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  };

  const handleExportPDF = () => {
    if (generatedContent) {
      exportToPDF(generatedContent, contractTitle);
    }
  };

  const handleEditContent = (newContent: string) => {
    setGeneratedContent(newContent);
  };

  if (templatesLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gerar Contrato</h1>
          <p className="text-muted-foreground">
            Preencha os dados para gerar o contrato com substituição automática
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Template' },
          { num: 2, label: 'Partes' },
          { num: 3, label: 'Imóvel' }
        ].map((s, index) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              step >= s.num 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {s.num}
            </div>
            <span className={`ml-2 text-sm ${step >= s.num ? 'font-medium' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {index < 2 && (
              <div className={`flex-1 h-1 mx-4 rounded ${
                step > s.num ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Template */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Selecione o Modelo</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Contrato</Label>
              <Input
                id="title"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                placeholder="Ex: Contrato de Locação - Apartamento Centro"
              />
            </div>

            <div>
              <Label>Modelo de Contrato</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Preview do modelo:</p>
                <div 
                  className="text-sm text-muted-foreground max-h-40 overflow-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate.content.substring(0, 500) + '...' 
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Select Parties */}
      {step === 2 && (
        <PartySelector
          documents={validDocuments}
          parties={parties}
          onPartiesChange={setParties}
        />
      )}

      {/* Step 3: Property Data */}
      {step === 3 && (
        <PropertyDataForm
          data={propertyData}
          onChange={setPropertyData}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={step === 1 ? () => navigate('/juridico') : handleBack}
        >
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </Button>

        {step < 3 ? (
          <Button onClick={handleNext}>
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Contrato
              </>
            )}
          </Button>
        )}
      </div>

      {/* Contract Preview Modal */}
      {showPreview && generatedContent && (
        <ContractPreview
          content={generatedContent}
          title={contractTitle}
          onExportPDF={handleExportPDF}
          onClose={() => setShowPreview(false)}
          onEdit={handleEditContent}
        />
      )}
    </div>
  );
}
