/* ==========================================================================
   DADOS OFICIAIS DO ORGANOGRAMA, TOUR DE ONBOARDING E FALLBACK DE ÍCONES
   ========================================================================== */
const ORG_DATA = {
  'conselho': {
    id: 'conselho',
    code: 'GOV-01',
    category: 'Conselho Consultivo',
    role: 'Conselho Consultivo',
    name: 'Maria Luiza dos Santos Buzanelo',
    avatarInitials: 'MB',
    avatarClass: 'avatar-indigo',
    parentId: null,
    childrenIds: ['ceo'],
    mission: `O Conselho Consultivo da Betha Sistemas atua como órgão colegiado de assessoria estratégica de alto nível, apoiando os acionistas e a Presidência Executiva na definição das diretrizes de longo prazo, sustentabilidade do negócio e expansão institucional.`,
    onboardingSummary: `Para o novo colaborador, o Conselho representa a solidez institucional e a visão de futuro da Betha, garantindo que nossos valores e propósito de transformar a gestão pública permaneçam vivos.`,
    onboardingActions: [
      `Compreenda a visão de longo prazo da Betha no material institucional da primeira semana.`,
      `Observe como os direcionamentos do Conselho orientam as metas estratégicas e o OKR anual.`,
      `Participe dos encontros institucionais de alinhamento corporativo (All-Hands).`
    ],
    connections: ['ceo', 'governanca'],
    channels: `Comunicação institucional conduzida pela Governança Corporativa e Presidência Executiva.`
  },
  'ceo': {
    id: 'ceo',
    code: 'EXEC-01',
    category: 'Presidência Executiva',
    role: 'CEO',
    name: 'Wellington Rogerio Biagio Silva',
    avatarInitials: 'WB',
    avatarClass: 'avatar-gold',
    parentId: 'conselho',
    childrenIds: ['auditoria', 'governanca', 'juridico', 'relacoes', 'inteligencia', 'tecnologia', 'produto', 'servicos', 'comercial', 'novos-negocios', 'marketing', 'gente', 'financas'],
    mission: `Responsável pela liderança executiva integral da Betha Sistemas, definindo as metas organizacionais, integrando todas as diretorias e garantindo excelência na entrega de soluções em nuvem para mais de mil cidades brasileiras.`,
    onboardingSummary: `O CEO lidera o ritmo de crescimento e a cultura de inovação. Durante seu onboarding, você entenderá como o trabalho do seu time se conecta diretamente aos objetivos executivos da empresa.`,
    onboardingActions: [
      `Assista ao vídeo de boas-vindas do CEO na trilha de integração da Universidade Corporativa Betha.`,
      `Alinhe com seu gestor como as entregas do seu setor impactam os resultados globais da empresa.`,
      `Fique atento aos comunicados mensais da presidência com os principais marcos de crescimento.`
    ],
    connections: ['conselho', 'auditoria', 'governanca', 'juridico', 'tecnologia', 'produto', 'comercial', 'gente'],
    channels: `Comunicados gerais da liderança via Workplace/Teams e sessões trimestrais de prestação de contas.`
  },
  'auditoria': {
    id: 'auditoria',
    code: 'AUD-01',
    category: 'Assessoria & Controle',
    role: 'Auditoria',
    name: 'Mariane de Souza Medeiros',
    avatarInitials: 'MM',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Conduzir avaliações independentes dos processos internos, conformidade operacional e financeira, assegurando mitigação contínua de riscos e aderência aos padrões de qualidade da organização.`,
    onboardingSummary: `A Auditoria existe para proteger os processos e apoiar a melhoria contínua. Para novos colaboradores, ela oferece clareza sobre normas de conformidade e boas práticas operacionais.`,
    onboardingActions: [
      `Leia o Guia de Normas Internas e Procedimentos Padrão (SOPs) aplicáveis à sua função.`,
      `Ao identificar desvios operacionais ou dúvidas de conformidade, consulte os manuais ou acione a Auditoria.`,
      `Mantenha os registros de suas atividades e aprovações devidamente arquivados e rastreáveis.`
    ],
    connections: ['ceo', 'governanca', 'juridico', 'financas'],
    channels: `Canal oficial de auditoria interna e canal confidencial de integridade.`
  },
  'governanca': {
    id: 'governanca',
    code: 'GOV-02',
    category: 'Governança Corporativa',
    role: 'Governança Corporativa',
    name: 'Andreia Cardoso Dias Pacheco',
    avatarInitials: 'AP',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Estruturar e zelar pelas práticas de boa governança, transparência institucional, alinhamento societário, condução de comitês executivos e prestação de contas aos conselhos e acionistas.`,
    onboardingSummary: `A Governança Corporativa estabelece as regras do jogo: processos decisórios claros, ética empresarial e sustentabilidade do modelo corporativo Betha.`,
    onboardingActions: [
      `Conheça o Código de Ética e Conduta da Betha e confirme sua leitura no portal de onboarding.`,
      `Entenda como funcionam os comitês estratégicos e a estrutura de tomada de decisão.`,
      `Consulte as políticas de integridade corporativa sempre que interagir com parceiros externos.`
    ],
    connections: ['conselho', 'ceo', 'juridico', 'auditoria'],
    channels: `Portal de Governança e canal de dúvidas éticas e regulatórias.`
  },
  'juridico': {
    id: 'juridico',
    code: 'JUR-01',
    category: 'Jurídico & Compliance',
    role: 'Jurídico / Compliance',
    name: 'Samanta Santinoni Souza',
    avatarInitials: 'SS',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Garantir a total segurança jurídica das operações da Betha Sistemas, cuidando de contratos públicos e privados, conformidade regulatória, propriedade intelectual, licitações e privacidade de dados (LGPD).`,
    onboardingSummary: `Como fornecedora de software para órgãos governamentais, a conformidade legal é pilar vital. O time de Compliance protege você e os clientes em todas as operações de dados públicos.`,
    onboardingActions: [
      `Complete o treinamento obrigatório de Lei Geral de Proteção de Dados (LGPD) nos primeiros 15 dias.`,
      `Antes de compartilhar minutas contratuais ou termos com parceiros, submeta à validação jurídica.`,
      `Utilize sempre os modelos contratuais homologados disponíveis no repositório institucional.`
    ],
    connections: ['ceo', 'comercial', 'governanca', 'tecnologia', 'financas'],
    channels: `Central de Serviços Jurídicos e canal direto do DPO (Encarregado de Proteção de Dados).`
  },
  'relacoes': {
    id: 'relacoes',
    code: 'REL-01',
    category: 'Relações Governamentais',
    role: 'Relações Institucionais e Governamentais',
    name: 'Articulação Institucional',
    avatarInitials: 'RIG',
    avatarClass: 'avatar-teal',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Representar a Betha Sistemas junto a órgãos públicos, associações de municípios (CNM, Fecam, etc.), tribunais de contas e fóruns legislativos, fortalecendo a presença institucional da empresa.`,
    onboardingSummary: `Esta área constrói pontes com o ecossistema público e entidades governamentais, garantindo que nossas inovações tecnológicas estejam alinhadas às necessidades dos gestores municipais.`,
    onboardingActions: [
      `Compreenda a importância dos grandes eventos municipalistas onde a Betha atua.`,
      `Caso seu setor necessite de articulação com entidades públicas de classe, alinhe previamente com este departamento.`,
      `Acompanhe as publicações sobre reformas tributárias e novos marcos regulatórios da gestão pública.`
    ],
    connections: ['ceo', 'comercial', 'marketing', 'novos-negocios'],
    channels: `Comunicação institucional com entidades de classe e órgãos governamentais.`
  },
  'inteligencia': {
    id: 'inteligencia',
    code: 'OPS-01',
    category: 'Inteligência Operacional',
    role: 'Inteligência de Operações',
    name: 'Anderson Alves',
    avatarInitials: 'AA',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Desenvolver inteligência analítica, dashboards de indicadores de performance corporativa (BI), otimização de fluxos de trabalho e suporte executivo à tomada de decisão baseada em dados.`,
    onboardingSummary: `A Inteligência de Operações transforma dados brutos em clareza estratégica. Ela ajuda sua equipe a entender suas métricas de entrega e eficiência.`,
    onboardingActions: [
      `Familiarize-se com os painéis e dashboards de indicadores do seu setor no Power BI corporativo.`,
      `Entenda a rotina de alimentação e confiabilidade de dados dos sistemas internos.`,
      `Apoie a cultura data-driven participando das revisões de indicadores de processo.`
    ],
    connections: ['ceo', 'tecnologia', 'servicos', 'comercial', 'financas'],
    channels: `Hub de Business Intelligence (BI) e canal de requisições analíticas.`
  },
  'tecnologia': {
    id: 'tecnologia',
    code: 'TEC-01',
    category: 'Tecnologia (CTO)',
    role: 'Tecnologia',
    name: 'Ezequiel dos Santos Garcia',
    avatarInitials: 'EG',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Liderar a arquitetura técnica, engenharia de software, infraestrutura de nuvem (AWS/Azure), práticas de DevOps, cibersegurança e sustentação de todas as plataformas SaaS da Betha Sistemas.`,
    onboardingSummary: `Coração tecnológico da Betha. Se você é da área técnica, aqui está sua liderança direta. Se é de negócios, este time garante que os softwares operem com alta disponibilidade e segurança para os clientes.`,
    onboardingActions: [
      `Configure seus acessos aos ambientes corporativos (GitHub, VPN, AWS, Jira) junto ao suporte de TI.`,
      `Leia as Diretrizes de Segurança da Informação e Políticas de Senhas seguras no seu primeiro dia.`,
      `Participe dos Tech Talks e alinhamentos de arquitetura de software promovidos pela diretoria.`
    ],
    connections: ['ceo', 'produto', 'servicos', 'inteligencia', 'juridico'],
    channels: `Central de Suporte Interno de TI e fóruns de engenharia de software.`
  },
  'produto': {
    id: 'produto',
    code: 'PRD-01',
    category: 'Produto (CPO)',
    role: 'Produto',
    name: 'Eduardo Pires da Silva',
    avatarInitials: 'EP',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Definir a estratégia do portfólio de produtos Betha (Tributos, Saúde, Educação, Folha, Contabilidade Pública, etc.), conduzindo discovery, design de experiência (UX/UI) e roadmap de lançamentos em nuvem.`,
    onboardingSummary: `A Diretoria de Produto concebe as soluções que prefeituras e cidadãos utilizam todos os dias. Ela conecta os requisitos legais dos municípios a experiências intuitivas em software.`,
    onboardingActions: [
      `Conheça as principais verticais do ecossistema de produtos Betha (Educação, Saúde, Gestão Fiscal).`,
      `Descubra como feedbacks de clientes chegam aos Product Managers (PMs) e Product Designers.`,
      `Acompanhe as notas de release e demonstrações de novos módulos da plataforma em nuvem.`
    ],
    connections: ['ceo', 'tecnologia', 'servicos', 'marketing', 'comercial'],
    channels: `Comunidade de Produto e repositório de roadmaps e releases.`
  },
  'servicos': {
    id: 'servicos',
    code: 'SRV-01',
    category: 'Serviços & Suporte',
    role: 'Serviços',
    name: 'Mario Alex da Silva Santos',
    avatarInitials: 'MS',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Garantir o sucesso do cliente pós-venda, executando a implantação e migração de dados nos órgãos públicos, capacitação técnica de servidores municipais e suporte técnico especializado de alta disponibilidade.`,
    onboardingSummary: `A Diretoria de Serviços é a linha de frente do relacionamento diário com as prefeituras. Ela garante que a tecnologia seja efetivamente adotada e gere valor para a população.`,
    onboardingActions: [
      `Entenda a metodologia de implantação de sistemas e migração de bases de dados legadas.`,
      `Conheça os Acordos de Nível de Serviço (SLA) de atendimento aos clientes Betha.`,
      `Se sua função envolve atendimento, passe pelo ciclo de imersão de suporte e treinamento.`
    ],
    connections: ['ceo', 'produto', 'tecnologia', 'comercial', 'novos-negocios'],
    channels: `Central de Atendimento ao Cliente e mesa de operações de implantação.`
  },
  'comercial': {
    id: 'comercial',
    code: 'COM-01',
    category: 'Comercial & Vendas',
    role: 'Comercial (Interina)',
    name: 'Debora Regina Guchert Pamplona',
    avatarInitials: 'DP',
    avatarClass: 'avatar-teal',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Conduzir as vendas diretas de soluções para municípios, gestão do funil de prospecção, participação estratégica em pregões e licitações públicas, e fidelização da base de prefeituras atendidas.`,
    onboardingSummary: `A Diretoria Comercial é o motor de expansão de receita da Betha no mercado público, trabalhando com rigor técnico e conformidade em processos licitatórios.`,
    onboardingActions: [
      `Compreenda a dinâmica de licitações públicas municipais (Lei 14.133) e como a Betha concorre.`,
      `Alinhe com a equipe comercial os diferenciais das soluções em nuvem frente aos concorrentes.`,
      `Consulte o calendário de entregas de propostas técnicas e demonstrações com órgãos públicos.`
    ],
    connections: ['ceo', 'novos-negocios', 'marketing', 'juridico', 'servicos', 'financas'],
    channels: `Pipeline comercial no CRM e reuniões de alinhamento de vendas.`
  },
  'novos-negocios': {
    id: 'novos-negocios',
    code: 'NNR-01',
    category: 'Canais & Parcerias',
    role: 'Novos Negócios e Revendas',
    name: 'Giuliano Galli Santana',
    avatarInitials: 'GS',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Gerenciar e expandir a rede de revendas autorizadas e parceiros de negócios pelo território nacional, prospectando novos mercados regionais e viabilizando o crescimento capilar da Betha.`,
    onboardingSummary: `Graças à rede de revendas e parceiros, a Betha está presente de norte a sul do Brasil. Esta diretoria fortalece os canais indiretos de comercialização e atendimento local.`,
    onboardingActions: [
      `Entenda o modelo de remuneração, credenciamento e capacitação das revendas autorizadas.`,
      `Identifique em quais estados a Betha atua via filial própria e onde opera por parceiros credenciados.`,
      `Apoie o compartilhamento de materiais de capacitação destinados à rede credenciada.`
    ],
    connections: ['ceo', 'comercial', 'marketing', 'servicos', 'financas'],
    channels: `Portal das Revendas Betha e coordenação de canais parceiros.`
  },
  'marketing': {
    id: 'marketing',
    code: 'MKT-01',
    category: 'Marketing & Marca',
    role: 'Marketing',
    name: 'Paloma Zimmer',
    avatarInitials: 'PZ',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Construir o posicionamento da marca Betha Sistemas como líder em GovTech no Brasil, gerando demanda qualificada, comunicação corporativa, presença em congressos e marketing de produto.`,
    onboardingSummary: `O time de Marketing conta a história da Betha e amplifica nosso impacto na sociedade. Eles fornecem materiais de apresentação, diretrizes de marca e comunicação oficial.`,
    onboardingActions: [
      `Baixe o Brandbook oficial e os templates padronizados da Betha para apresentações corporativas.`,
      `Atualize seu perfil no LinkedIn conectando-se como colaborador oficial da Betha Sistemas.`,
      `Acompanhe as redes sociais da empresa e compartilhe as novidades e casos de sucesso das cidades.`
    ],
    connections: ['ceo', 'comercial', 'novos-negocios', 'produto', 'gente'],
    channels: `Banco de ativos de marca (Mídia Kit), intranet e canal de solicitações de design.`
  },
  'gente': {
    id: 'gente',
    code: 'RH-01',
    category: 'Gente & Gestão',
    role: 'Gente e Gestão',
    name: 'Mauricio Campos Malachias',
    avatarInitials: 'MM',
    avatarClass: 'avatar-gold',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Cuidar das pessoas e da cultura Betha, liderando atração de talentos, programas de onboarding, gestão de desempenho, desenvolvimento de lideranças, clima organizacional, benefícios e saúde do colaborador.`,
    onboardingSummary: `Seu principal porto seguro no início da jornada! O time de Gente & Gestão organiza sua recepção, acompanha sua adaptação e apoia seu plano de desenvolvimento individual (PDI).`,
    onboardingActions: [
      `Participe ativamente de todos os módulos da sua trilha de onboarding na Universidade Corporativa.`,
      `Agende com seu gestor a reunião de alinhamento de expectativas dos primeiros 30, 60 e 90 dias.`,
      `Acesse o portal do colaborador para conferir benefícios, holerites e canais de apoio à saúde.`
    ],
    connections: ['ceo', 'financas', 'marketing', 'tecnologia', 'servicos'],
    channels: `Central de Gente & Gestão, Business Partners (BPs) de cada área e canal de bem-estar.`
  },
  'financas': {
    id: 'financas',
    code: 'FIN-01',
    category: 'Finanças (CFO)',
    role: 'Administração e Finanças',
    name: 'Tatiane Deziderio Costa',
    avatarInitials: 'TC',
    avatarClass: '',
    parentId: 'ceo',
    childrenIds: [],
    mission: `Assegurar a solidez e sustentabilidade financeira da Betha Sistemas, coordenando controladoria, contabilidade, planejamento orçamentário (FP&A), faturamento, compras e gestão predial das instalações.`,
    onboardingSummary: `A Diretoria Administrativa e Financeira garante os recursos para o crescimento sustentável da empresa e providencia a infraestrutura física e equipamentos para o seu trabalho.`,
    onboardingActions: [
      `Entenda as políticas de reembolso de despesas corporativas e prestação de contas de viagens.`,
      `Conheça os fluxos de compras e contratação de ferramentas e suprimentos homologados.`,
      `Caso precise de ajustes de infraestrutura física ou equipamentos, acione o setor de patrimônio.`
    ],
    connections: ['ceo', 'gente', 'juridico', 'comercial', 'novos-negocios'],
    channels: `Central de Serviços Financeiros e portal de solicitações de compras e viagens.`
  }
};

/* Metadados padrão de posicionamento e hierarquia */
const DEFAULT_LAYOUT_META = {
  'conselho':       { tierGroup: 'conselho',    sortOrder: 0, footerTag: 'Diretrizes e Sustentabilidade',            footerPrompt: 'Detalhes',   badgeIcon: 'shield' },
  'ceo':            { tierGroup: 'ceo',         sortOrder: 0, footerTag: 'Liderança Executiva & Estratégia Betha',  footerPrompt: 'Ver perfil', badgeIcon: 'crown' },
  'auditoria':      { tierGroup: 'advisory',    sortOrder: 0, footerTag: 'Controle & Riscos',                        footerPrompt: 'Info',       badgeIcon: '' },
  'governanca':     { tierGroup: 'advisory',    sortOrder: 1, footerTag: 'Transparência & Gestão',                   footerPrompt: 'Info',       badgeIcon: '' },
  'juridico':       { tierGroup: 'advisory',    sortOrder: 2, footerTag: 'Integridade & LGPD',                       footerPrompt: 'Info',       badgeIcon: '' },
  'relacoes':       { tierGroup: 'advisory',    sortOrder: 3, footerTag: 'Setor Público & Ecossistema',              footerPrompt: 'Info',       badgeIcon: '' },
  'inteligencia':   { tierGroup: 'advisory',    sortOrder: 4, footerTag: 'BI & Eficiência Operacional',              footerPrompt: 'Info',       badgeIcon: '' },
  'tecnologia':     { tierGroup: 'operational', sortOrder: 0, footerTag: 'Cloud, DevOps & Dev',                      footerPrompt: 'Detalhes',   badgeIcon: '' },
  'produto':        { tierGroup: 'operational', sortOrder: 1, footerTag: 'Roadmap, UX & Suítes',                     footerPrompt: 'Detalhes',   badgeIcon: '' },
  'servicos':       { tierGroup: 'operational', sortOrder: 2, footerTag: 'Implantação & Suporte',                    footerPrompt: 'Detalhes',   badgeIcon: '' },
  'comercial':      { tierGroup: 'operational', sortOrder: 3, footerTag: 'Vendas & Licitações',                      footerPrompt: 'Detalhes',   badgeIcon: '' },
  'novos-negocios': { tierGroup: 'operational', sortOrder: 4, footerTag: 'Canais & Parcerias Brasil',                footerPrompt: 'Detalhes',   badgeIcon: '' },
  'marketing':      { tierGroup: 'operational', sortOrder: 5, footerTag: 'Branding & Demanda',                       footerPrompt: 'Detalhes',   badgeIcon: '' },
  'gente':          { tierGroup: 'operational', sortOrder: 6, footerTag: 'Onboarding & Desenvolvimento',               footerPrompt: 'Detalhes',   badgeIcon: '' },
  'financas':       { tierGroup: 'operational', sortOrder: 7, footerTag: 'Controladoria, FP&A & Compras',            footerPrompt: 'Detalhes',   badgeIcon: '' }
};

Object.keys(ORG_DATA).forEach(function(id, idx) {
  const meta = DEFAULT_LAYOUT_META[id] || { tierGroup: 'operational', sortOrder: idx, footerTag: 'Diretoria', footerPrompt: 'Detalhes', badgeIcon: '' };
  ORG_DATA[id].tierGroup = meta.tierGroup;
  ORG_DATA[id].sortOrder = meta.sortOrder;
  ORG_DATA[id].offsetX = 0;
  ORG_DATA[id].offsetY = 0;
  ORG_DATA[id].footerTag = meta.footerTag;
  ORG_DATA[id].footerPrompt = meta.footerPrompt;
  ORG_DATA[id].badgeIcon = meta.badgeIcon;
  if (typeof ORG_DATA[id].avatar === 'undefined') ORG_DATA[id].avatar = '';
});

/* Etapas do Tour de Onboarding */
const TOUR_STEPS = [
  {
    step: 1,
    title: `Bem-vindo à Betha Sistemas!`,
    highlight: `Mais de 35 anos revolucionando a gestão pública municipal com inovação e tecnologia em nuvem.`,
    text: `Este organograma interativo é o seu mapa de navegação durante o onboarding. Aqui você conhecerá quem lidera cada setor, como as decisões fluem e onde sua equipe está inserida.`,
    targetNode: 'ceo'
  },
  {
    step: 2,
    title: `Conselho Consultivo & CEO`,
    highlight: `Liderança estratégica com Maria Luiza Buzanelo (Conselho) e Wellington Rogerio Biagio Silva (CEO).`,
    text: `O Conselho orienta as grandes diretrizes institucionais, enquanto o CEO comanda as operações diárias e a expansão de nossos softwares por todo o país.`,
    targetNode: 'ceo'
  },
  {
    step: 3,
    title: `Governança, Controle & Assessoria`,
    highlight: `Auditoria, Governança Corporativa, Jurídico/Compliance, Relações Governamentais e Inteligência de Operações.`,
    text: `Este cluster de assessoria estratégica garante que a Betha opere com máxima integridade, segurança jurídica, conformidade e inteligência analítica de dados.`,
    targetNode: 'governanca'
  },
  {
    step: 4,
    title: `O Coração de Inovação: Tecnologia & Produto`,
    highlight: `Liderados por Ezequiel Garcia (Tecnologia) e Eduardo Pires (Produto).`,
    text: `Juntas, estas diretorias pesquisam, projetam e desenvolvem plataformas robustas em nuvem que atendem aos servidores municipais e melhoram a vida de milhões de cidadãos.`,
    targetNode: 'tecnologia'
  },
  {
    step: 5,
    title: `Mercado & Expansão: Comercial, Negócios e Marketing`,
    highlight: `Debora Pamplona (Comercial), Giuliano Santana (Novos Negócios) e Paloma Zimmer (Marketing).`,
    text: `Equipes dedicadas a posicionar a marca Betha, expandir nossa rede de revendas autorizadas pelo Brasil e conquistar novas prefeituras através de vendas públicas transparentes.`,
    targetNode: 'comercial'
  },
  {
    step: 6,
    title: `Sustentação e Suas Pessoas: Serviços, Gente & Finanças`,
    highlight: `Mario Alex (Serviços), Mauricio Malachia (Gente e Gestão) e Tatiane Costa (Finanças).`,
    text: `Serviços implanta os softwares nas cidades, Finanças assegura a sustentabilidade, e Gente & Gestão cuida de você, do seu plano de carreira e do seu acolhimento na empresa. Conte com todos nós!`,
    targetNode: 'gente'
  }
];

const DEFAULT_TOUR_CONFIG = {
  buttonLabel: 'Tour de Onboarding',
  buttonIcon: 'sparkles',
  buttonTitle: '',
  skipLabel: 'Pular',
  nextLabel: 'Próximo',
  finishLabel: 'Concluir Tour',
  steps: TOUR_STEPS.map(function(s) {
    return {
      stepLabel: '',
      title: s.title,
      highlight: s.highlight,
      text: s.text,
      targetNode: s.targetNode || ''
    };
  })
};

/* Fallback SVG (Lucide) para garantir ícones mesmo offline */
const LUCIDE_FALLBACK_ICONS = {
  'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'align-center': '<line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up-down': '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevrons-down-up': '<path d="m7 20 5-5 5 5"/><path d="m7 4 5 5 5-5"/>',
  'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  'crown': '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  'git-fork': '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>',
  'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  'map': '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
  'maximize-2': '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'move': '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>',
  'network': '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  'play': '<polygon points="6 3 20 12 6 21 6 3"/>',
  'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'scan': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'zoom-in': '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>',
  'zoom-out': '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/>'
};
