export type BenchmarkRow = {
  nicho: string;
  subnicho: string | null;
  cac_min: number | null;
  cac_max: number | null;
  ciclo_min_dias: number | null;
  ciclo_max_dias: number | null;
};

export type DiagnosticoScoreRecord = {
  id: string;
  etapa_atual: number | null;
  produto_desc: string | null;
  icp_desc: string | null;
  concorrentes_desc: string | null;
  budget_total: number | null;
  prazo_esperado: number | null;
  icp_score: number | null;
  diferencial_score: number | null;
};

export type LastroZone = 'critico' | 'ajuste' | 'ressalvas' | 'pronto';

export type LastroCalculation = {
  budgetMidia: number;
  dim1: number;
  dim2: number;
  dim3: number;
  dim4: number;
  score: number;
  zone: LastroZone;
  nicho: string | null;
  benchmark: BenchmarkRow | null;
};

const ICP_GENERIC_PATTERNS = [
  'todo mundo',
  'qualquer pessoa',
  'qualquer um',
  'todos',
  'geral',
  'todas as pessoas',
  'qualquer empresa',
  'todo tipo de cliente',
] as const;

const DIFFERENTIAL_KEYWORDS = [
  'porque',
  'diferencial',
  'melhor',
  'mais rapido',
  'mais rápido',
  'atendimento',
  'especializado',
  'especialista',
  'metodo',
  'método',
  'qualidade',
  'proximo',
  'próximo',
  'personalizado',
  'resultado',
  'experiencia',
  'experiência',
] as const;

const NO_COMPETITOR_PATTERNS = [
  'nao tenho',
  'não tenho',
  'nenhum concorrente',
  'sem concorrente',
  'nao sei',
  'não sei',
  'nao conheco',
  'não conheço',
] as const;

const STOP_WORDS = new Set([
  'a',
  'o',
  'e',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'para',
  'por',
  'com',
  'sem',
  'uma',
  'um',
  'na',
  'no',
  'em',
  'que',
]);

const NICHE_ALIASES: Record<string, string> = {
  academia: 'academia',
  agencia: 'agencia_mkt',
  agência: 'agencia_mkt',
  corretor: 'imobiliaria',
  corretora: 'imobiliaria',
  credito: 'credito_consignado',
  crédito: 'credito_consignado',
  consignado: 'credito_consignado',
  curso: 'infoproduto',
  dentista: 'clinica_odontologica',
  ecommerce: 'ecommerce',
  'e-commerce': 'ecommerce',
  imovel: 'imobiliaria',
  imóvel: 'imobiliaria',
  imoveis: 'imobiliaria',
  imóveis: 'imobiliaria',
  imobiliaria: 'imobiliaria',
  imobiliária: 'imobiliaria',
  infoproduto: 'infoproduto',
  loja: 'ecommerce',
  marketing: 'agencia_mkt',
  medica: 'clinica_medica',
  médica: 'clinica_medica',
  medico: 'clinica_medica',
  médico: 'clinica_medica',
  odontologia: 'clinica_odontologica',
  odontologica: 'clinica_odontologica',
  odontológica: 'clinica_odontologica',
  perfumaria: 'perfumaria',
  studio: 'studio_fitness',
  fitness: 'studio_fitness',
};

const DEFAULT_CAC_MIN = 100;
const DEFAULT_CICLO_MIN_DIAS = 30;

export const normalizeText = (value: string | null | undefined) => {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getMeaningfulWords = (value: string) => {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

export const resolveNicho = (produtoDesc: string | null | undefined, benchmarks: BenchmarkRow[]) => {
  const normalized = normalizeText(produtoDesc);
  if (!normalized) return null;

  const benchmarkNiches = benchmarks.map((benchmark) => benchmark.nicho);
  const aliasEntries = Object.entries(NICHE_ALIASES).sort((a, b) => b[0].length - a[0].length);

  for (const [alias, nicho] of aliasEntries) {
    if (normalized.includes(alias)) {
      return nicho;
    }
  }

  for (const benchmarkNiche of benchmarkNiches) {
    const humanizedNiche = benchmarkNiche.replace(/_/g, ' ');
    if (normalized.includes(humanizedNiche)) {
      return benchmarkNiche;
    }
  }

  const words = getMeaningfulWords(normalized);
  for (const word of words) {
    if (NICHE_ALIASES[word]) {
      return NICHE_ALIASES[word];
    }

    if (benchmarkNiches.includes(word)) {
      return word;
    }

    const match = benchmarkNiches.find((benchmarkNiche) => benchmarkNiche.split('_').includes(word));
    if (match) {
      return match;
    }
  }

  return words[0] ?? null;
};

const scoreFinancialViability = (budgetTotal: number | null, cacMin: number | null) => {
  const budgetMidia = Math.max(0, budgetTotal ?? 0) * 0.56;
  const cycles = budgetMidia / Math.max(cacMin ?? DEFAULT_CAC_MIN, 1);

  if (cycles >= 3) return { score: 100, budgetMidia };
  if (cycles >= 2) return { score: 75, budgetMidia };
  if (cycles >= 1) return { score: 50, budgetMidia };
  if (cycles >= 0.5) return { score: 25, budgetMidia };

  return { score: 10, budgetMidia };
};

const scoreIcpClarity = (icpDesc: string | null) => {
  const normalized = normalizeText(icpDesc);
  const words = normalized ? normalized.split(' ').filter(Boolean) : [];
  const isGeneric = ICP_GENERIC_PATTERNS.some((pattern) => normalized.includes(pattern));

  if (words.length < 5 || isGeneric) return 15;
  if (words.length > 30) return 85;
  if (words.length >= 15) return 65;
  return 40;
};

const scoreTimelineAlignment = (prazoEsperado: number | null, cicloMinDias: number | null) => {
  const prazo = prazoEsperado ?? 0;
  const ciclo = cicloMinDias ?? DEFAULT_CICLO_MIN_DIAS;

  if (prazo >= ciclo * 2) return 100;
  if (prazo >= ciclo) return 70;
  if (prazo >= ciclo / 2) return 40;
  return 15;
};

const scoreMarketMaturity = (concorrentesDesc: string | null) => {
  const normalized = normalizeText(concorrentesDesc);
  if (!normalized || NO_COMPETITOR_PATTERNS.some((pattern) => normalized.includes(pattern))) return 25;

  const mentionsCompetitors = normalized.split(' ').filter(Boolean).length >= 4;
  const hasClearDifferential = DIFFERENTIAL_KEYWORDS.some((keyword) => normalized.includes(keyword));

  if (mentionsCompetitors && hasClearDifferential) return 90;
  if (mentionsCompetitors) return 55;
  return 25;
};

const getZone = (score: number): LastroZone => {
  if (score <= 39) return 'critico';
  if (score <= 59) return 'ajuste';
  if (score <= 79) return 'ressalvas';
  return 'pronto';
};

export const calculateLastroScore = (
  diagnostico: DiagnosticoScoreRecord,
  benchmarks: BenchmarkRow[],
): LastroCalculation => {
  const nicho = resolveNicho(diagnostico.produto_desc, benchmarks);
  const benchmark = benchmarks.find((item) => item.nicho === nicho) ?? null;

  const { score: dim1, budgetMidia } = scoreFinancialViability(
    diagnostico.budget_total,
    benchmark?.cac_min ?? null,
  );
  const dim2 = diagnostico.icp_score ?? scoreIcpClarity(diagnostico.icp_desc);
  const dim3 = scoreTimelineAlignment(
    diagnostico.prazo_esperado,
    benchmark?.ciclo_min_dias ?? DEFAULT_CICLO_MIN_DIAS,
  );
  const dim4 = diagnostico.diferencial_score ?? scoreMarketMaturity(diagnostico.concorrentes_desc);

  const score = Math.round(dim1 * 0.4 + dim2 * 0.25 + dim3 * 0.2 + dim4 * 0.15);

  return {
    budgetMidia,
    dim1,
    dim2,
    dim3,
    dim4,
    score,
    zone: getZone(score),
    nicho,
    benchmark,
  };
};