import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';
import { PropertyData } from '@/types/property';

interface PropertyDataFormProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
}

export default function PropertyDataForm({ data, onChange }: PropertyDataFormProps) {
  const updateField = (field: keyof PropertyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5" />
        Dados do Imóvel
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="endereco_imovel">Endereço Completo</Label>
          <Input
            id="endereco_imovel"
            value={data.endereco_imovel}
            onChange={(e) => updateField('endereco_imovel', e.target.value)}
            placeholder="Rua, número, complemento"
          />
        </div>

        <div>
          <Label htmlFor="bairro_imovel">Bairro</Label>
          <Input
            id="bairro_imovel"
            value={data.bairro_imovel}
            onChange={(e) => updateField('bairro_imovel', e.target.value)}
            placeholder="Bairro"
          />
        </div>

        <div>
          <Label htmlFor="cidade_imovel">Cidade</Label>
          <Input
            id="cidade_imovel"
            value={data.cidade_imovel}
            onChange={(e) => updateField('cidade_imovel', e.target.value)}
            placeholder="Cidade"
          />
        </div>

        <div>
          <Label htmlFor="estado_imovel">Estado</Label>
          <Input
            id="estado_imovel"
            value={data.estado_imovel}
            onChange={(e) => updateField('estado_imovel', e.target.value)}
            placeholder="UF"
          />
        </div>

        <div>
          <Label htmlFor="cep_imovel">CEP</Label>
          <Input
            id="cep_imovel"
            value={data.cep_imovel}
            onChange={(e) => updateField('cep_imovel', e.target.value)}
            placeholder="00000-000"
          />
        </div>

        <div>
          <Label htmlFor="valor_aluguel">Valor do Aluguel (R$)</Label>
          <Input
            id="valor_aluguel"
            value={data.valor_aluguel}
            onChange={(e) => updateField('valor_aluguel', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
          <Input
            id="dia_vencimento"
            type="number"
            min="1"
            max="31"
            value={data.dia_vencimento}
            onChange={(e) => updateField('dia_vencimento', e.target.value)}
            placeholder="10"
          />
        </div>

        <div>
          <Label htmlFor="prazo_contrato">Prazo do Contrato (meses)</Label>
          <Input
            id="prazo_contrato"
            type="number"
            value={data.prazo_contrato}
            onChange={(e) => updateField('prazo_contrato', e.target.value)}
            placeholder="30"
          />
        </div>

        <div>
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={data.data_inicio}
            onChange={(e) => updateField('data_inicio', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="data_fim">Data de Término</Label>
          <Input
            id="data_fim"
            type="date"
            value={data.data_fim}
            onChange={(e) => updateField('data_fim', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="valor_caucao">Valor da Caução (R$)</Label>
          <Input
            id="valor_caucao"
            value={data.valor_caucao}
            onChange={(e) => updateField('valor_caucao', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="observacoes">Observações Adicionais</Label>
          <Textarea
            id="observacoes"
            value={data.observacoes}
            onChange={(e) => updateField('observacoes', e.target.value)}
            placeholder="Informações adicionais sobre o imóvel ou contrato..."
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
}
