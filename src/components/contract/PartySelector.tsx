import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, User } from 'lucide-react';

interface ProcessedDocument {
  id: string;
  extracted_data: Record<string, string>;
  document_role: string;
  file_name: string;
}

interface Party {
  id: string;
  role: string;
  documentId: string;
  extractedData: Record<string, string>;
}

interface PartySelectorProps {
  documents: ProcessedDocument[];
  parties: Party[];
  onPartiesChange: (parties: Party[]) => void;
}

const PARTY_ROLES = [
  { value: 'locador', label: 'Locador' },
  { value: 'locadora', label: 'Locadora' },
  { value: 'locatario', label: 'Locatário' },
  { value: 'locataria', label: 'Locatária' },
  { value: 'fiador', label: 'Fiador' },
  { value: 'fiadora', label: 'Fiadora' },
];

export default function PartySelector({ documents, parties, onPartiesChange }: PartySelectorProps) {
  const getDocumentName = (doc: ProcessedDocument): string => {
    if (!doc.extracted_data) return doc.file_name;
    const data = typeof doc.extracted_data === 'string' 
      ? JSON.parse(doc.extracted_data) 
      : doc.extracted_data;
    
    // Check non-prefixed fields first
    if (data.nome_completo) return data.nome_completo;
    if (data.nome) return data.nome;
    
    // Look for prefixed name fields (e.g., locatario_nome, locador_nome)
    const nameKey = Object.keys(data).find(key => key.endsWith('_nome') && data[key]);
    if (nameKey) return data[nameKey];
    
    return doc.file_name;
  };

  const addParty = () => {
    const newParty: Party = {
      id: crypto.randomUUID(),
      role: '',
      documentId: '',
      extractedData: {}
    };
    onPartiesChange([...parties, newParty]);
  };

  const removeParty = (id: string) => {
    onPartiesChange(parties.filter(p => p.id !== id));
  };

  const updateParty = (id: string, field: keyof Party, value: string) => {
    onPartiesChange(parties.map(party => {
      if (party.id !== id) return party;

      if (field === 'documentId') {
        const doc = documents.find(d => d.id === value);
        const extractedData = doc?.extracted_data 
          ? (typeof doc.extracted_data === 'string' ? JSON.parse(doc.extracted_data) : doc.extracted_data)
          : {};
        return { ...party, documentId: value, extractedData };
      }

      return { ...party, [field]: value };
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          Partes do Contrato
        </h3>
        <Button variant="outline" size="sm" onClick={addParty}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Parte
        </Button>
      </div>

      {parties.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma parte adicionada. Clique em "Adicionar Parte" para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {parties.map((party, index) => (
            <div key={party.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/30">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Parte {index + 1}</Badge>
                  {party.role && (
                    <Badge variant="outline" className="capitalize">
                      {PARTY_ROLES.find(r => r.value === party.role)?.label || party.role}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Função no Contrato</Label>
                    <Select
                      value={party.role}
                      onValueChange={(value) => updateParty(party.id, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTY_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Documento (dados extraídos)</Label>
                    <Select
                      value={party.documentId}
                      onValueChange={(value) => updateParty(party.id, 'documentId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {documents.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {getDocumentName(doc)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {party.documentId && Object.keys(party.extractedData).length > 0 && (
                  <div className="mt-2 p-3 bg-background rounded border">
                    <p className="text-sm font-medium mb-2">Dados do documento:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(party.extractedData)
                        .filter(([_, value]) => value)
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => removeParty(party.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
