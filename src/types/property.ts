export interface PropertyData {
  endereco_imovel: string;
  bairro_imovel: string;
  cidade_imovel: string;
  estado_imovel: string;
  cep_imovel: string;
  valor_aluguel: string;
  dia_vencimento: string;
  prazo_contrato: string;
  data_inicio: string;
  data_fim: string;
  valor_caucao: string;
  observacoes: string;
}

export const defaultPropertyData: PropertyData = {
  endereco_imovel: '',
  bairro_imovel: '',
  cidade_imovel: '',
  estado_imovel: '',
  cep_imovel: '',
  valor_aluguel: '',
  dia_vencimento: '',
  prazo_contrato: '',
  data_inicio: '',
  data_fim: '',
  valor_caucao: '',
  observacoes: ''
};
