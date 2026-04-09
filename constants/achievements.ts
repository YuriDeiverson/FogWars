// constants/achievements.ts

export const TILE_SIZE = 0.0008; // ~88m por tile

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type AchievementType = 'coverage' | 'landmark' | 'distance';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xp: number;
  curiosity?: string;
  // coverage
  threshold?: number;
  // landmark
  lat?: number;
  lng?: number;
  radius?: number;
}

export const RARITY_CONFIG: Record<AchievementRarity, { label: string; color: string }> = {
  common:    { label: 'Comum',    color: '#94a3b8' },
  uncommon:  { label: 'Incomum',  color: '#4ade80' },
  rare:      { label: 'Raro',     color: '#60a5fa' },
  epic:      { label: 'Épico',    color: '#c084fc' },
  legendary: { label: 'Lendário', color: '#fbbf24' },
};

export const COVERAGE_ACHIEVEMENTS: Achievement[] = [
  { id: 'cov_1',    type: 'coverage', title: 'Primeiro Passo',     description: 'Explore qualquer área pela primeira vez',          icon: '👣', rarity: 'common',    threshold: 1,       xp: 50 },
  { id: 'cov_50',   type: 'coverage', title: 'Vizinhança',          description: 'Explorou seu primeiro quarteirão',                  icon: '🏘️', rarity: 'common',    threshold: 50,      xp: 100 },
  { id: 'cov_100',  type: 'coverage', title: 'Andarilho',           description: '100 tiles — você está começando!',                  icon: '🚶', rarity: 'common',    threshold: 100,     xp: 200 },
  { id: 'cov_500',  type: 'coverage', title: 'Explorador Urbano',   description: 'Explorou seu bairro inteiro',                       icon: '🏙️', rarity: 'common',    threshold: 500,     xp: 400 },
  { id: 'cov_1k',   type: 'coverage', title: 'Cartógrafo Amador',   description: '1.000 tiles no mapa!',                              icon: '🗺️', rarity: 'uncommon',  threshold: 1000,    xp: 750 },
  { id: 'cov_5k',   type: 'coverage', title: 'Desbravador',         description: '5.000 tiles explorados',                            icon: '⛺', rarity: 'uncommon',  threshold: 5000,    xp: 1500 },
  { id: 'cov_10k',  type: 'coverage', title: 'Mochileiro',          description: '10.000 tiles — você conhece bem sua cidade',        icon: '🎒', rarity: 'uncommon',  threshold: 10000,   xp: 2500 },
  { id: 'cov_50k',  type: 'coverage', title: 'Viajante',            description: '50.000 tiles — cruzando fronteiras!',               icon: '✈️', rarity: 'rare',      threshold: 50000,   xp: 5000 },
  { id: 'cov_100k', type: 'coverage', title: 'Aventureiro',         description: '100.000 tiles no mapa!',                            icon: '🧭', rarity: 'rare',      threshold: 100000,  xp: 10000 },
  { id: 'cov_500k', type: 'coverage', title: 'Explorador Épico',    description: '500.000 tiles — nível lendário se aproximando',     icon: '🌍', rarity: 'epic',      threshold: 500000,  xp: 25000 },
  { id: 'cov_1m',   type: 'coverage', title: '1 Milhão de Passos',  description: 'Um milhão de tiles! Você é uma lenda.',             icon: '🏆', rarity: 'legendary', threshold: 1000000, xp: 100000 },
];

export const LANDMARK_ACHIEVEMENTS: Achievement[] = [
  // Brasil
  { id: 'lm_cristo',     type: 'landmark', title: 'Cristo Redentor',         description: 'Visitou uma das 7 Maravilhas do Mundo Moderno',    icon: '✝️',  rarity: 'epic',      lat: -22.9519,  lng: -43.2105,  radius: 800,    xp: 5000,  curiosity: 'O Cristo Redentor tem 38m de altura e os braços medem 28m. Foi eleito uma das 7 Maravilhas do Mundo Moderno em 2007.' },
  { id: 'lm_sugarloaf',  type: 'landmark', title: 'Pão de Açúcar',           description: 'Avistou o icônico Pão de Açúcar no Rio',           icon: '⛰️',  rarity: 'rare',      lat: -22.9488,  lng: -43.1568,  radius: 600,    xp: 3000,  curiosity: 'O Pão de Açúcar tem 396m. O bondinho que leva ao topo foi instalado em 1912, sendo um dos primeiros do mundo.' },
  { id: 'lm_iguazu',     type: 'landmark', title: 'Cataratas do Iguaçu',     description: 'Sentiu o poder das maiores cataratas do mundo',     icon: '💧',  rarity: 'epic',      lat: -25.6953,  lng: -54.4367,  radius: 2000,   xp: 6000,  curiosity: 'Com 275 quedas espalhadas por 2,7km, as Cataratas do Iguaçu têm maior volume que as do Niágara.' },
  { id: 'lm_amazon',     type: 'landmark', title: 'Coração da Amazônia',     description: 'Entrou na maior floresta tropical do planeta',      icon: '🌿',  rarity: 'legendary', lat: -3.4653,   lng: -62.2159,  radius: 50000,  xp: 15000, curiosity: 'A Amazônia cobre 5,5 milhões de km² e abriga 10% de todas as espécies vivas do planeta.' },
  { id: 'lm_pantanal',   type: 'landmark', title: 'Pantanal',                description: 'Explorou a maior área úmida do mundo',              icon: '🐊',  rarity: 'epic',      lat: -17.7051,  lng: -57.4559,  radius: 30000,  xp: 8000,  curiosity: 'O Pantanal é a maior área úmida tropical do mundo com 150.000 km². Tem a maior concentração de jacarés do planeta.' },
  { id: 'lm_lencois',    type: 'landmark', title: 'Lençóis Maranhenses',     description: 'Descobriu o deserto de dunas e lagoas do Brasil',   icon: '🏜️',  rarity: 'epic',      lat: -2.4869,   lng: -43.1212,  radius: 10000,  xp: 7000,  curiosity: 'Os Lençóis Maranhenses têm 1.550 km² de dunas brancas com lagoas de água doce formadas no período das chuvas.' },
  { id: 'lm_fernando',   type: 'landmark', title: 'Fernando de Noronha',     description: 'Chegou ao paraíso ecológico brasileiro',            icon: '🏝️',  rarity: 'legendary', lat: -3.8547,   lng: -32.4255,  radius: 5000,   xp: 12000, curiosity: 'Fernando de Noronha é Patrimônio da UNESCO. Suas águas têm visibilidade de até 50 metros de profundidade.' },
  // Mundo
  { id: 'lm_liberty',    type: 'landmark', title: 'Estátua da Liberdade',    description: 'Visitou o símbolo da liberdade americana',          icon: '🗽',  rarity: 'epic',      lat: 40.6892,   lng: -74.0445,  radius: 500,    xp: 5000,  curiosity: 'A Estátua da Liberdade mede 93m do chão até a tocha. Seus pés têm tamanho 879!' },
  { id: 'lm_eiffel',     type: 'landmark', title: 'Torre Eiffel',            description: 'Visitou o monumento mais fotografado do mundo',     icon: '🗼',  rarity: 'epic',      lat: 48.8584,   lng: 2.2945,    radius: 400,    xp: 5000,  curiosity: 'A Torre Eiffel cresce até 15cm no verão pela dilatação do ferro. Foi construída em 2 anos, 2 meses e 5 dias.' },
  { id: 'lm_colosseum',  type: 'landmark', title: 'Coliseu de Roma',         description: 'Pisou no maior anfiteatro da Antiguidade',          icon: '🏟️',  rarity: 'epic',      lat: 41.8902,   lng: 12.4922,   radius: 400,    xp: 5000,  curiosity: 'O Coliseu comportava até 80.000 espectadores e tinha um sistema de toldos retráteis chamado "velarium".' },
  { id: 'lm_greatwall',  type: 'landmark', title: 'Grande Muralha da China', description: 'Tocou a maior construção humana da história',       icon: '🧱',  rarity: 'legendary', lat: 40.4319,   lng: 116.5704,  radius: 500,    xp: 10000, curiosity: 'A Grande Muralha tem 21.196km. Ao contrário do mito, NÃO é visível do espaço.' },
  { id: 'lm_machu',      type: 'landmark', title: 'Machu Picchu',            description: 'Descobriu a cidade perdida dos Incas',              icon: '🏔️',  rarity: 'legendary', lat: -13.1631,  lng: -72.5450,  radius: 800,    xp: 12000, curiosity: 'Machu Picchu foi construída por volta de 1450 e abandonada 100 anos depois. "Redescoberta" em 1911.' },
  { id: 'lm_pyramids',   type: 'landmark', title: 'Pirâmides de Gizé',       description: 'Viu a única Maravilha Antiga que ainda existe',     icon: '🔺',  rarity: 'legendary', lat: 29.9792,   lng: 31.1342,   radius: 1000,   xp: 12000, curiosity: 'A Grande Pirâmide foi a estrutura mais alta do mundo por 3.800 anos. É feita de 2,3 milhões de blocos.' },
  { id: 'lm_tajmahal',   type: 'landmark', title: 'Taj Mahal',               description: 'Visitou o mais belo monumento ao amor',             icon: '🕌',  rarity: 'epic',      lat: 27.1751,   lng: 78.0421,   radius: 500,    xp: 8000,  curiosity: 'O Taj Mahal levou 22 anos e 20.000 trabalhadores. O mármore branco muda de cor ao longo do dia.' },
  { id: 'lm_sydney',     type: 'landmark', title: 'Ópera de Sydney',         description: 'Chegou ao ícone mais reconhecível da Oceania',      icon: '🎭',  rarity: 'rare',      lat: -33.8568,  lng: 151.2153,  radius: 400,    xp: 4000,  curiosity: 'A Ópera de Sydney tem 1.056.006 azulejos no telhado. Foi inaugurada em 1973 após 14 anos.' },
  { id: 'lm_stonehenge', type: 'landmark', title: 'Stonehenge',              description: 'Descobriu o mistério pré-histórico da Inglaterra',  icon: '🪨',  rarity: 'rare',      lat: 51.1789,   lng: -1.8262,   radius: 500,    xp: 4000,  curiosity: 'Stonehenge foi construída entre 3000–1500 a.C. As pedras pesam até 25 toneladas e vieram de 250km.' },
  { id: 'lm_everest',    type: 'landmark', title: 'Monte Everest',           description: 'Alcançou o ponto mais alto da Terra',               icon: '🏔️',  rarity: 'legendary', lat: 27.9881,   lng: 86.9250,   radius: 5000,   xp: 30000, curiosity: 'O Everest cresce ~4mm por ano. A zona da morte (>8000m) tem apenas 1/3 do oxigênio do nível do mar.' },
  { id: 'lm_northpole',  type: 'landmark', title: 'Polo Norte',              description: 'Chegou ao topo do mundo!',                          icon: '🧊',  rarity: 'legendary', lat: 90.0,      lng: 0.0,       radius: 100000, xp: 50000, curiosity: 'O Polo Norte não tem terra — só gelo flutuante sobre o Oceano Ártico com ~4km de profundidade.' },
  { id: 'lm_southpole',  type: 'landmark', title: 'Polo Sul',                description: 'Explorou o continente mais frio da Terra',          icon: '🐧',  rarity: 'legendary', lat: -90.0,     lng: 0.0,       radius: 100000, xp: 50000, curiosity: 'A Antártida é o maior deserto do mundo com 14 milhões de km². Contém 70% da água doce da Terra em gelo.' },
];

export const DISTANCE_ACHIEVEMENTS: Achievement[] = [
  { id: 'dist_1k',    type: 'distance', title: 'Primeiros Quilômetros', description: 'Caminhou 1km explorando',                icon: '🦶', rarity: 'common',   threshold: 1000,    xp: 100 },
  { id: 'dist_10k',   type: 'distance', title: 'Maratonista Iniciante', description: 'Caminhou 10km total',                    icon: '🏃', rarity: 'common',   threshold: 10000,   xp: 300 },
  { id: 'dist_42k',   type: 'distance', title: 'Maratonista',           description: 'Caminhou a distância de uma maratona',   icon: '🥇', rarity: 'uncommon', threshold: 42195,   xp: 1000 },
  { id: 'dist_100k',  type: 'distance', title: 'Ultra Runner',          description: '100km de exploração!',                   icon: '⚡', rarity: 'rare',     threshold: 100000,  xp: 3000 },
  { id: 'dist_1000k', type: 'distance', title: 'Globo-Trotter',         description: '1.000km — você deu a volta no Brasil!',  icon: '🌎', rarity: 'epic',     threshold: 1000000, xp: 15000 },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...COVERAGE_ACHIEVEMENTS,
  ...LANDMARK_ACHIEVEMENTS,
  ...DISTANCE_ACHIEVEMENTS,
];