-- Fase 1: Criar Enums
CREATE TYPE document_role_enum AS ENUM (
  'locador', 'locadora', 'locatario', 'locataria', 'fiador', 'fiadora'
);

CREATE TYPE document_type AS ENUM (
  'documentos_pessoais', 'comprovante_endereco'
);

CREATE TYPE marital_status_enum AS ENUM (
  'solteiro', 'casado', 'divorciado', 'viuvo'
);

-- Fase 1.2: Criar Tabela processed_documents
CREATE TABLE processed_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  document_role document_role_enum,
  document_type document_type NOT NULL DEFAULT 'documentos_pessoais',
  document_gender TEXT,
  marital_status marital_status_enum,
  shared_address BOOLEAN DEFAULT false,
  spouse_document_id UUID REFERENCES processed_documents(id),
  extracted_data JSONB,
  extracted_fields JSONB,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fase 1.3: Criar Tabela contract_templates
CREATE TABLE contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  description TEXT,
  template_variables JSONB,
  tags TEXT[],
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fase 1.4: Criar Tabela contracts
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES contract_templates(id),
  document_id UUID REFERENCES processed_documents(id),
  variables JSONB,
  metadata JSONB,
  status TEXT DEFAULT 'draft',
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fase 1.5: Criar Índices
CREATE INDEX idx_processed_documents_user_id ON processed_documents(user_id);
CREATE INDEX idx_processed_documents_status ON processed_documents(status);
CREATE INDEX idx_contract_templates_user_id ON contract_templates(user_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_template_id ON contracts(template_id);

-- Fase 2: Configurar RLS
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Fase 2.2: Policies para processed_documents
CREATE POLICY "Users can view own documents" ON processed_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON processed_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON processed_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON processed_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Fase 2.3: Policies para contract_templates
CREATE POLICY "Users can view own templates" ON contract_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON contract_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON contract_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON contract_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Fase 2.4: Policies para contracts
CREATE POLICY "Users can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts" ON contracts
  FOR DELETE USING (auth.uid() = user_id);

-- Fase 3: Configurar Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('ocr_documents', 'ocr_documents', false);

-- Fase 3.2: Policies para Storage
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ocr_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ocr_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ocr_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );