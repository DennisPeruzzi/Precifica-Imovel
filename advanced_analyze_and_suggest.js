// advanced_analyze_and_suggest.js
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!FUNCTION_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_FUNCTION_URL and SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

// 1️⃣ Chama a Edge Function Supabase
async function callAnalyze(format = 'json') {
  const url = new URL(FUNCTION_URL);
  if (format === 'csv') url.searchParams.set('format', 'csv');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Accept: format === 'csv' ? 'text/csv' : 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Function returned ${res.status}: ${body}`);
  }

  if (format === 'csv') return await res.text();
  return await res.json();
}

// 2️⃣ Chama OpenAI para gerar resumo e ações SQL
async function summarizeWithOpenAI(analysisJson) {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set — skipping summarization');
    return null;
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  const prompt = `
Você é um especialista em PostgreSQL e Supabase.
Analise o seguinte JSON de análise do banco. Forneça:

1) Um resumo da saúde do banco (3 frases).
2) Até 3 recomendações prioritárias para otimização e correção.
3) Sugestões de SQL concretas para cada problema detectado (ex: criar índice, ajustar função ou trigger).  
4) Avisos de segurança, RLS ou triggers potencialmente problemáticas.

JSON do banco:
${JSON.stringify(analysisJson)}
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 700,
  });

  return response.choices?.[0]?.message?.content ?? null;
}

// 3️⃣ Função principal
async function main() {
  try {
    console.log('📊 Chamando Edge Function analyze_db...');
    const analysis = await callAnalyze('json');
    console.log('✅ Análise recebida');

    // Top 5 tabelas por tamanho
    const sizes = analysis.table_sizes || [];
    console.log('\n--- Top 5 tabelas por tamanho ---');
    sizes.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ${r.schema}.${r.table} — ${r.total_size} (${r.total_size_bytes} bytes)`);
    });

    // Top 5 tabelas por seq_scan
    const seq = analysis.seqscan_heavy || [];
    console.log('\n--- Top 5 tabelas por seq_scan ---');
    seq.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ${r.schema}.${r.table} — seq_scan=${r.seq_scan}, idx_scan=${r.idx_scan}, n_live_tup=${r.n_live_tup}`);
    });

    // Resumo OpenAI
    if (OPENAI_API_KEY) {
      console.log('\n🤖 Solicitando resumo e recomendações ao OpenAI...');
      const summary = await summarizeWithOpenAI(analysis);
      console.log('\n--- OpenAI Summary & SQL Suggestions ---\n', summary);
    } else {
      console.log('\n⚠️ OPENAI_API_KEY não definido; resumo AI ignorado.');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message || err);
    process.exit(1);
  }
}

main();