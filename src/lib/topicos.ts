export type ExtractionResult = {
  suficiente: boolean;
  pergunta_complementar: string | null;
  [key: string]: unknown;
};

export type Topico = {
  id: number;
  campo_principal: string;
  pergunta_inicial: string;
  max_complementares: number;
  system_prompt: string;
  user_prompt_template: string;
};

export const TOPICOS: Topico[] = [
  {
    id: 1,
    campo_principal: 'produto_desc',
    pergunta_inicial: 'O que você vende — e qual problema ele resolve para o seu cliente?',
    max_complementares: 2,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- produto: string (descrição do produto ou serviço)
- nicho: string (um dos: imobiliaria, clinica_medica, clinica_odontologica, academia, studio_fitness, ecommerce, perfumaria, agencia_mkt, infoproduto, credito_consignado, saas, consultoria, outro)
- subnicho: string ou null (ex: odonto_estetica, studio_fitness_high_ticket, clinica_geral)
- categoria: string (servico | produto | infoproduto | saas)
- modelo_negocio: string (b2b | b2c | b2b2c)
- suficiente: boolean (true se nicho e tipo de produto identificados com clareza)
- pergunta_complementar: string ou null (se suficiente=false, pergunta específica e curta para o que falta — ex: "Clínica de qual especialidade — geral, odontologia ou estética?")

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 2,
    campo_principal: 'icp_desc',
    pergunta_inicial: 'Me descreva a pessoa que mais compra de você. Quem é ela?',
    max_complementares: 2,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- perfil: string (descrição do perfil identificado)
- especificidade: string (especifico | parcial | vago)
- icp_score: number (especifico=85, parcial=55, vago=20)
- tem_demografico: boolean
- tem_dor: boolean
- suficiente: boolean (true se tem ao menos perfil parcial com alguma dor ou motivação identificável)
- pergunta_complementar: string ou null (se suficiente=false — ex: "Qual a faixa de idade e o que essa pessoa busca quando te contrata?")

IMPORTANTE: "todo mundo", "qualquer pessoa", "todos" = suficiente=false, icp_score=15

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 3,
    campo_principal: 'ticket_medio',
    pergunta_inicial: 'Qual é o ticket médio da sua venda? E como o cliente paga — único, recorrente ou parcelado?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- ticket_medio: number ou null (extrair valor numérico, aceitar qualquer formato — "mil reais"=1000, "500/mês"=500)
- modelo_cobranca: string (unico | recorrente | parcelado | nao_identificado)
- suficiente: boolean (true se tem valor numérico identificável)
- pergunta_complementar: string ou null (se falta valor → "Qual o valor médio que um cliente paga por vez?", se falta modelo → "Esse valor é por consulta, mensalidade ou parcelado?")

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 4,
    campo_principal: 'concorrentes_desc',
    pergunta_inicial: 'Quem são seus principais concorrentes — e por que um cliente escolheria você no lugar deles?',
    max_complementares: 2,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- concorrentes: array de strings (nomes ou tipos mencionados)
- diferencial: string ou null (diferencial identificado)
- diferencial_score: number (claro_e_defensavel=90, existe_mas_fraco=55, ausente=20)
- suficiente: boolean (true se ao menos 1 concorrente E algum diferencial identificado)
- pergunta_complementar: string ou null (se sem concorrente → "Quem o cliente contrataria se não fosse você?", se sem diferencial → "O que faz um cliente escolher você em vez deles?")

IMPORTANTE: "não tenho concorrentes", "não sei" = suficiente=false

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 5,
    campo_principal: 'foco_geografico',
    pergunta_inicial: 'Em qual região ou segmento você quer crescer nos próximos 90 dias?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- regiao: string (cidade, estado ou "nacional")
- segmento: string ou null (segmento de mercado se mencionado)
- suficiente: boolean (true se identificou região OU segmento específico)
- pergunta_complementar: string ou null (se "todo Brasil" ou muito vago → "Começa por qual cidade ou estado?")

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 6,
    campo_principal: 'historico_marketing',
    pergunta_inicial: 'Você já tentou alguma ação de marketing antes? O que funcionou e o que não funcionou?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- tem_historico: boolean
- canais_testados: array de objetos com {canal: string, resultado: string} (array vazio se não tentou)
- suficiente: boolean (true se claramente disse que tentou COM detalhes, OU claramente disse que nunca tentou)
- pergunta_complementar: string ou null (se disse "sim tentei" sem detalhe → "Quais canais — Instagram, Google, panfleto? O que aconteceu?")

IMPORTANTE: qualquer variação de "nunca tentei", "não fiz nada", "ainda não" = suficiente=true, tem_historico=false

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 7,
    campo_principal: 'budget_total',
    pergunta_inicial: 'Quanto você pode investir por mês em marketing — incluindo ferramenta, mídia e produção?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- budget_total: number ou null (extrair valor numérico mensal, qualquer formato)
- suficiente: boolean (true se tem qualquer valor numérico identificável)
- pergunta_complementar: string ou null (se "pouco", "não sei", "depende" → "Pensa num valor mensal — mesmo que seja R$200 ou R$500.")

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 8,
    campo_principal: 'meta_clientes',
    pergunta_inicial: 'Quantos clientes novos você precisa fechar por mês para considerar o marketing bem-sucedido?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- meta_clientes: number ou null (extrair inteiro, aceitar por extenso — "cinco"=5, "uns dez"=10)
- suficiente: boolean (true se tem número identificável)
- pergunta_complementar: string ou null (se "muitos", "quanto mais melhor" → "Me dá um número — 5, 10, 20 por mês?")

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
  {
    id: 9,
    campo_principal: 'prazo_esperado',
    pergunta_inicial: 'Em quanto tempo você espera ver os primeiros resultados?',
    max_complementares: 1,
    system_prompt: `Você é um assistente de diagnóstico de marketing brasileiro.
Analise respostas de donos de negócio e extraia dados estruturados.
Responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
    user_prompt_template: `Analise a resposta e retorne JSON com:
- prazo_esperado: number ou null (mapear para 30, 60, 90 ou 180 dias — "1 mês"=30, "3 meses"=90, "rápido"=30)
- suficiente: boolean (true se tem prazo identificável)
- pergunta_complementar: string ou null (se "rápido", "logo", "não sei" → "Em quanto tempo — 1 mês, 3 meses, 6 meses?")

Mapeamento: até 30d=30, 31-60d=60, 61-90d=90, mais de 90d=180

Resposta do usuário: "{{RESPOSTA}}"

Retorne APENAS JSON válido.`,
  },
];
