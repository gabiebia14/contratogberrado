import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, documentCategory, base64Image, maritalStatus, sharedAddress } = await req.json();
    
    console.log('Processing document:', { documentType, documentCategory, maritalStatus, sharedAddress });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Você é um especialista em extração de dados de documentos brasileiros. Extraia as seguintes informações deste documento:

- nome_completo (nome completo da pessoa)
- cpf (CPF no formato XXX.XXX.XXX-XX)
- rg (número do RG)
- data_nascimento (data de nascimento no formato DD/MM/AAAA)
- endereco_completo (endereço completo com rua e número)
- bairro (bairro)
- cep (CEP no formato XXXXX-XXX)
- cidade (cidade)
- estado (estado - sigla de 2 letras)
- telefone (telefone com DDD)
- email (email se disponível)
- profissao (profissão se disponível)
- estado_civil (estado civil se disponível)
- nacionalidade (nacionalidade se disponível)

Tipo de documento: ${documentCategory}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional, sem markdown, sem explicações. Exemplo:
{
  "nome_completo": "João Silva",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "data_nascimento": "01/01/1990",
  "endereco_completo": "Rua das Flores, 123",
  "bairro": "Centro",
  "cep": "12345-678",
  "cidade": "São Paulo",
  "estado": "SP"
}`;

    console.log('Calling Lovable AI with model: google/gemini-2.5-flash');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: base64Image 
                } 
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received:', JSON.stringify(aiData).substring(0, 200));
    
    const extractedText = aiData.choices?.[0]?.message?.content;
    
    if (!extractedText) {
      throw new Error('No content returned from AI');
    }

    // Parse do JSON extraído
    let extractedData;
    try {
      // Remover markdown se presente
      const cleanText = extractedText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      extractedData = JSON.parse(cleanText);
      console.log('Successfully parsed extracted data:', Object.keys(extractedData));
    } catch (e) {
      console.error('Failed to parse JSON:', e, 'Raw text:', extractedText);
      // Tentar extrair JSON do texto
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract valid JSON from AI response');
      }
    }

    // Formatar os dados extraídos de acordo com o tipo de documento
    const formattedData: any = {};
    
    // Mapear campos baseado no documentType (locador, locatario, fiador, etc.)
    const prefix = documentType.replace(/a$/, ''); // Remove 'a' do final se existir
    
    if (extractedData.nome_completo) formattedData[`${prefix}_nome`] = extractedData.nome_completo;
    if (extractedData.cpf) formattedData[`${prefix}_cpf`] = extractedData.cpf;
    if (extractedData.rg) formattedData[`${prefix}_rg`] = extractedData.rg;
    if (extractedData.data_nascimento) formattedData[`${prefix}_data_nascimento`] = extractedData.data_nascimento;
    if (extractedData.endereco_completo) formattedData[`${prefix}_endereco`] = extractedData.endereco_completo;
    if (extractedData.bairro) formattedData[`${prefix}_bairro`] = extractedData.bairro;
    if (extractedData.cep) formattedData[`${prefix}_cep`] = extractedData.cep;
    if (extractedData.cidade) formattedData[`${prefix}_cidade`] = extractedData.cidade;
    if (extractedData.estado) formattedData[`${prefix}_estado`] = extractedData.estado;
    if (extractedData.telefone) formattedData[`${prefix}_telefone`] = extractedData.telefone;
    if (extractedData.email) formattedData[`${prefix}_email`] = extractedData.email;
    if (extractedData.profissao) formattedData[`${prefix}_profissao`] = extractedData.profissao;
    if (extractedData.nacionalidade) formattedData[`${prefix}_nacionalidade`] = extractedData.nacionalidade;
    if (extractedData.estado_civil) formattedData[`${prefix}_estado_civil`] = extractedData.estado_civil;

    console.log('Formatted data:', formattedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: formattedData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing OCR:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'An error occurred while processing the document. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
