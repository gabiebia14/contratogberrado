import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PropertyData } from '@/types/property';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PartyData {
  role: string;
  documentId: string;
  extractedData: Record<string, string>;
}

interface GenerateContractParams {
  templateId: string;
  templateContent: string;
  parties: PartyData[];
  propertyData: PropertyData;
  title: string;
}

export const useContractGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const mapFieldsToVariables = (data: Record<string, string>, role: string): Record<string, string> => {
    const prefix = role.toLowerCase();
    const mapped: Record<string, string> = {};

    // Map common fields
    const fieldMappings: Record<string, string> = {
      'nome_completo': `${prefix}_nome`,
      'nome': `${prefix}_nome`,
      'nacionalidade': `${prefix}_nacionalidade`,
      'estado_civil': `${prefix}_estado_civil`,
      'profissao': `${prefix}_profissao`,
      'rg': `${prefix}_rg`,
      'cpf': `${prefix}_cpf`,
      'endereco': `${prefix}_endereco`,
      'bairro': `${prefix}_bairro`,
      'cep': `${prefix}_cep`,
      'cidade': `${prefix}_cidade`,
      'estado': `${prefix}_estado`,
      'telefone': `${prefix}_telefone`,
      'email': `${prefix}_email`,
    };

    Object.entries(data).forEach(([key, value]) => {
      const mappedKey = fieldMappings[key.toLowerCase()];
      if (mappedKey && value) {
        mapped[mappedKey] = value;
      }
    });

    return mapped;
  };

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    
    // Replace all {{variable}} and {variable} patterns
    Object.entries(variables).forEach(([key, value]) => {
      const patterns = [
        new RegExp(`\\{\\{${key}\\}\\}`, 'gi'),
        new RegExp(`\\{${key}\\}`, 'gi'),
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, value || '____________');
      });
    });

    // Replace remaining unreplaced variables with blank lines
    result = result.replace(/\{\{[^}]+\}\}/g, '____________');
    result = result.replace(/\{[^}]+\}/g, '____________');

    return result;
  };

  const generateContract = async ({
    templateId,
    templateContent,
    parties,
    propertyData,
    title
  }: GenerateContractParams): Promise<string> => {
    setGenerating(true);

    try {
      // Collect all variables
      const allVariables: Record<string, string> = {};

      // Add party data
      parties.forEach(party => {
        const mappedData = mapFieldsToVariables(party.extractedData, party.role);
        Object.assign(allVariables, mappedData);
      });

      // Add property data
      Object.entries(propertyData).forEach(([key, value]) => {
        if (value) {
          allVariables[key] = value;
        }
      });

      // Add current date
      const today = new Date();
      allVariables['data_atual'] = today.toLocaleDateString('pt-BR');
      allVariables['dia'] = String(today.getDate()).padStart(2, '0');
      allVariables['mes'] = today.toLocaleDateString('pt-BR', { month: 'long' });
      allVariables['ano'] = String(today.getFullYear());

      console.log('Variables to replace:', allVariables);

      // Replace variables in template
      const processedContent = replaceVariables(templateContent, allVariables);
      setGeneratedContent(processedContent);

      // Save to database
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          user_id: session.user.id,
          variables: allVariables,
          status: 'draft'
        });

      if (error) throw error;

      toast.success('Contrato gerado com sucesso!');
      return processedContent;
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato');
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const exportToPDF = async (content: string, title: string) => {
    try {
      // Create a temporary div to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 210mm;
        padding: 20mm;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        background: white;
        color: black;
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Handle multiple pages if content is long
      const pageHeight = pdfHeight * (imgWidth / pdfWidth);
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;
      }

      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  return {
    generating,
    generatedContent,
    generateContract,
    exportToPDF,
    setGeneratedContent
  };
};
