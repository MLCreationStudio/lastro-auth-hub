import type { ExtractionResult, Topico } from './topicos';

export async function extrairDadosTopico(
  topico: Topico,
  resposta: string,
): Promise<ExtractionResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('VITE_ANTHROPIC_API_KEY não configurada');
    return { suficiente: true, pergunta_complementar: null };
  }

  const userPrompt = topico.user_prompt_template.replace('{{RESPOSTA}}', resposta);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: topico.system_prompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return { suficiente: true, pergunta_complementar: null };
    }

    const data = await response.json();
    const texto = data.content?.[0]?.text?.trim() ?? '';
    const jsonLimpo = texto
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(jsonLimpo) as ExtractionResult;
  } catch (error) {
    console.error('Erro ao processar resposta da IA:', error);
    return { suficiente: true, pergunta_complementar: null };
  }
}
