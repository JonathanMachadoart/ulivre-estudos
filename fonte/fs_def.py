# Currículo Full Stack Development — níveis e tópicos do board do Miro
# (Júnior → Pleno/Sênior → Arquiteto de Software → Arquiteto de Soluções).
import glob, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SKIP = {'U_A2kwUfmlw', 'L26dSJ8u-IY', '-zY6eTiKF0I', 'u1sg_uD8H4g'}  # anúncios, promo e compilação duplicada

def _clean(t):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', t)).strip()

def load():
    PL, V = {}, {}
    cur = None
    for f in sorted(glob.glob(os.path.join(HERE, 'fullstack', 'b*.txt'))):
        for line in open(f, encoding='utf-8'):
            line = line.rstrip('\n')
            if not line: continue
            if line.startswith('#'):
                cur = line[1:].split()[0]; PL[cur] = []; continue
            i, d, t = line.split('|', 2)
            row = [i, d, _clean(t)]
            PL[cur].append(row); V.setdefault(i, row)
    for line in open(os.path.join(HERE, 'fullstack', 'singles.txt'), encoding='utf-8'):
        line = line.rstrip('\n')
        if line:
            i, d, t = line.split('|', 2); V.setdefault(i, [i, d, _clean(t)])
    return PL, V

YT = 'https://www.youtube.com/playlist?list='

# (id, nome, nível, playlist principal, alternativa, pré-requisitos, tópicos do Miro, fontes, links extras)
# fontes: ('pl', id) = playlist inteira | ('pl-', id) = playlist em ordem inversa | ('v', [ids]) = vídeos avulsos
LEVELS = ['Nível 1 · Programador Júnior', 'Nível 2 · Programador Pleno / Sênior',
          'Nível 3 · Arquiteto de Software', 'Nível 4 · Arquiteto de Soluções']

COURSES = [
 # ---------------- Nível 1 · Programador Júnior ----------------
 ('fs01', 'Fundamentos da Computação', 0, 'PLdsnXVqbHDUcQIuiH9b-i9A85H3A2ZW5W', YT+'PLdsnXVqbHDUd17xLINVEXhJ32RxbzCEWV', [],
  'Como funciona um computador · Como os programas rodam na memória · Como os processadores funcionam · Sistemas operacionais · Linguagem compilada x interpretada',
  [('pl', 'PLdsnXVqbHDUcQIuiH9b-i9A85H3A2ZW5W'), ('pl', 'PLdsnXVqbHDUd17xLINVEXhJ32RxbzCEWV')], []),
 ('fs02', 'Linux (Ubuntu ou Debian)', 0, 'PLHz_AreHm4dlIXleu20uwPWFOSswqLYbV', None, ['fs01'],
  'Instalação, ambiente gráfico, instalação de programas, terminal, diretórios e arquivos',
  [('pl', 'PLHz_AreHm4dlIXleu20uwPWFOSswqLYbV')], []),
 ('fs03', 'Lógica de Programação e Algoritmos', 0, 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV', None, ['fs01'],
  'Lógica de programação · Variáveis e operadores · Condicionais · Repetição · Procedimentos e funções · Vetores e matrizes',
  [('pl', 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV')], []),
 ('fs04', 'Escolha uma linguagem: JavaScript', 0, 'PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1', None, ['fs03'],
  'No Miro você escolhe uma linguagem (Python, JavaScript, Java, C#, PHP, Ruby, Go, Rust ou C++). Aqui a trilha usa JavaScript, que serve no front-end e no back-end (Node.js).',
  [('pl', 'PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1')], []),
 ('fs05', 'Algoritmos e Estruturas de Dados', 0, 'PLGxZ4Rq3BOBrgumpzz-l8kFMw2DLERdxi', None, ['fs04'],
  'Vetores e arrays · Pilhas · Filas e filas com prioridade · Listas encadeadas',
  [('pl', 'PLGxZ4Rq3BOBrgumpzz-l8kFMw2DLERdxi')], []),
 ('fs06', 'Paradigmas de Programação e POO', 0, 'PLHz_AreHm4dkqe2aR0tQK74m8SFe-aGsY', None, ['fs04'],
  'Procedural · Funcional · Orientação a Objetos: abstração, herança, polimorfismo e encapsulamento',
  [('pl', 'PLHz_AreHm4dkqe2aR0tQK74m8SFe-aGsY')], []),
 ('fs07', 'SQL e Bancos Relacionais', 0, 'PLHz_AreHm4dkBs-795Dsgvau_ekxg8g1r', None, ['fs04'],
  'Escolha um banco (MySQL, SQLite, PostgreSQL, MariaDB ou Oracle) · Operações de CRUD · Relacionamentos · ACID · Transações',
  [('pl', 'PLHz_AreHm4dkBs-795Dsgvau_ekxg8g1r')], []),
 ('fs08', 'Versionamento de Código e Repositórios Remotos', 0, 'PLHz_AreHm4dm7ZULPAmadvNhH6vk9oNZA', None, ['fs04'],
  'Git · Branches · Repositórios remotos: GitHub, GitLab e Bitbucket',
  [('pl', 'PLHz_AreHm4dm7ZULPAmadvNhH6vk9oNZA')], []),
 ('fs09', 'Redes e Internet', 0, 'PLAp37wMSBouDdpuuYhZfEK9oH0qk0IANb', None, ['fs01'],
  'Como a internet funciona · O que é um nome de domínio · Como funciona um DNS · Protocolos e portas · Modelo OSI',
  [('pl', 'PLAp37wMSBouDdpuuYhZfEK9oH0qk0IANb')], []),
 ('fs10', 'Fundamentos da Web', 0, 'PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n', YT+'PLx6gdu4s3nkceYGr8i4H0necTuN_gx8H_', ['fs09'],
  'O que é uma URL · Protocolo HTTP · Arquitetura cliente x servidor · Servidor web · Cache · HTML e CSS',
  [('pl', 'PLx6gdu4s3nkceYGr8i4H0necTuN_gx8H_'), ('pl', 'PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n')], []),
 ('fs11', 'APIs e Integrações', 0, 'PL3B-OV5dZTqbaLi1f2UmXEWbcx9WyYaTX', None, ['fs10'],
  'O que é uma API · APIs REST e RESTful · JSON · Métodos HTTP · Códigos de status · HATEOAS · Paginação, filtros e versionamento · gRPC · GraphQL · HTTP/3 (QUIC)',
  [('pl', 'PL3B-OV5dZTqbaLi1f2UmXEWbcx9WyYaTX')], []),
 ('fs12', 'Segurança', 0, 'PLEqTHftpM91OZzAIOwMcAuQ4ciK1n4_Ll', None, ['fs10'],
  'HTTP vs HTTPS · Como funciona um sistema de login · Autenticação e autorização · CORS · Cookies · Sessão · VPN · Firewall · OWASP Top 10',
  [('pl-', 'PLEqTHftpM91OZzAIOwMcAuQ4ciK1n4_Ll')],
  [('HTTP vs HTTPS (Cloudflare)', 'https://www.cloudflare.com/pt-br/learning/ssl/why-is-http-not-secure/'),
   ('O que é login (Tecnoblog)', 'https://tecnoblog.net/responde/o-que-e-login/')]),
 ('fs13', 'Model-View-Controller (MVC)', 0, 'PLJ_KhUnlXUPtbtLwaxxUxHqvcNQndmI4B', None, ['fs07', 'fs11'],
  'Padrão MVC na prática com Node.js e Express. Outros frameworks do Miro: Django, Flask, Laravel, Symfony, ASP.NET, Ruby on Rails, NestJS e Spring Boot',
  [('pl', 'PLJ_KhUnlXUPtbtLwaxxUxHqvcNQndmI4B')], []),
 ('fs14', 'Docker', 0, 'PLf-O3X2-mxDn1VpyU2q3fuI6YYeIWp5rR', None, ['fs02', 'fs13'],
  'Conceitos de conteinerização · Comandos básicos · Imagens, volumes e network · Dockerfile · Docker Compose',
  [('pl', 'PLf-O3X2-mxDn1VpyU2q3fuI6YYeIWp5rR')], []),
 # ---------------- Nível 2 · Programador Pleno / Sênior ----------------
 ('fs15', 'Mais sobre Bancos de Dados', 1, 'PLfvOpw8k80WpKTtloa7fMbfPWL7D6X5cC', None, ['fs07'],
  'Bancos não relacionais · Document store (MongoDB) · Key-value store · Graph database · Search engine',
  [('pl', 'PLfvOpw8k80WpKTtloa7fMbfPWL7D6X5cC')], []),
 ('fs16', 'Clean Code', 1, 'PLVc5bWuiFQ8H5P-7QB1_3LOJkOZNMnnpg', YT+'PLNHxHgB-_LTtnyj453VPF7_CdYM4dpv_Z', ['fs06'],
  'Nomes significativos · Formatação e estilo · Classes, métodos e arquivos pequenos · Regra do escoteiro · Complexidade ciclomática · Exceções em vez de códigos de erro · Evite booleanos e nulos · Funções puras · Comente só o necessário · Seja consistente',
  [('pl', 'PLVc5bWuiFQ8H5P-7QB1_3LOJkOZNMnnpg'), ('v', ['S2mMFopw_ww', 'vFBUWtrzz48'])], []),
 ('fs17', 'Orientação a Objetos Avançada: SOLID e Object Calisthenics', 1, 'PLNHxHgB-_LTtnyj453VPF7_CdYM4dpv_Z', None, ['fs16'],
  'Princípios SOLID (SRP, OCP, LSP, ISP, DIP) · Object Calisthenics: um nível de indentação, nunca usar ELSE, envolva primitivos, coleções de primeira classe, um ponto por linha, não abrevie, classes pequenas, 2 variáveis por instância, sem getters/setters',
  [('v', ['yZRd_EWUs1g', 'EWHTE1dQM4U', 'T6pF7BfAPIo', 'f6-5ANuTkys', 'jHbI9ej5O1Y', 's8g32ePcPps',
          'pW9Bb4PteWU', 'YGNH71KPIes', 'KXaPJhG9yCk', '_OKbQKjiKR8', 'PXHqooNlkVM'])], []),
 ('fs18', 'Princípios de Qualidade e Testes Automatizados', 1, 'PLbIBj8vQhvm0pgOkQu3YzOfpQLvWRKdAG', None, ['fs17'],
  'DRY · KISS · YAGNI · Pirâmide de testes: unitários (80%), integração (15%) e funcionais (5%)',
  [('v', ['wjtfJ9c4KdM']), ('pl', 'PLbIBj8vQhvm0pgOkQu3YzOfpQLvWRKdAG')], []),
 ('fs19', 'Design Patterns', 1, 'PLNHxHgB-_LTt67szNmMsZwqBKq9jH4uKJ', YT+'PLbIBj8vQhvm0VY5YrMrafWaQY2EnJ3j8H', ['fs17'],
  'Criacionais (Singleton, Factory Method, Abstract Factory, Builder, Prototype) · Estruturais (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy) · Comportamentais (Observer, State, Strategy, Template Method, Chain of Responsibility, Command, Iterator, Mediator, Memento, Visitor)',
  [('v', ['3-ESljj0jgI', 'Fg1kEjaaBrs', 'OrCgWzpNszk', '4Aq9UHQ5f5Y', 'mv9JxI85Ac8', 'j5fGTi8ObK4',
          '7B60j9EGrrU', 'DzlXwgsc_AU', 'el1MtIPXTqo', 'E8ey3HjSthg'])], []),
 ('fs20', 'Técnicas de Refactoring', 1, 'PLeKXYyZCJHxeEeta6ddgqUagLp_Oo_kAx', None, ['fs18', 'fs19'],
  'O que é débito técnico · Code smells · Métodos de composição · Organização de dados · Expressões condicionais · Simplificar chamadas de métodos',
  [('pl', 'PLeKXYyZCJHxeEeta6ddgqUagLp_Oo_kAx')], []),
 ('fs21', 'Otimização e Performance', 1, 'PL3j2sfzg3FPvJIz_ifBUjBjMosgP7VLdM', None, ['fs15'],
  'Cache aside pattern · Jobs assíncronos · Concorrência e paralelismo · Otimização e performance de SQL · CDN',
  [('pl', 'PL3j2sfzg3FPvJIz_ifBUjBjMosgP7VLdM'), ('v', ['vRO0UfvsbDw', 'UYOr-rpQs1I'])], []),
 ('fs22', 'Básico das Cloud Providers', 1, 'PL9zNGy7HsKm6t2Nlcwrv3wOV6yU_8W8s4', YT+'PLNCSWIsR6ADKdmgkzm4qluf5psqJ6i3JQ', ['fs14'],
  'Cloud computing · IaaS, PaaS e SaaS · Regiões e zonas de disponibilidade · Redes na AWS · Deploy, NGINX, Terraform e serverless',
  [('pl', 'PL9zNGy7HsKm6t2Nlcwrv3wOV6yU_8W8s4'),
   ('v', ['5qUvI58eFr8', 'pOFToA0Upek', 'DdoncfOdru8', 'ZWor5luY_Q4', 'D_ha0g9yS2E', 'gd_cUmwzgEM', 'BslJdgv_I2c'])], []),
 ('fs23', 'Pipelines de CI/CD', 1, 'PL1gdHPtv45Mfv77D--fy1BdoGLpR3x9YR', None, ['fs08', 'fs22'],
  'Integração, entrega e deploy contínuos · GitHub Actions · GitLab CI · Jenkins · Azure DevOps Pipelines',
  [('pl', 'PL1gdHPtv45Mfv77D--fy1BdoGLpR3x9YR'), ('v', ['df_WMXk7JxE'])], []),
 # ---------------- Nível 3 · Arquiteto de Software ----------------
 ('fs24', 'Fundamentos de Arquitetura de Software', 2, 'PLs-l5bSgIMhA0P3xnOV5Bf9osyKzcN6tU', None, ['fs20', 'fs21', 'fs23'],
  'Níveis de arquitetura (aplicação, solução e corporativa) · Tipos de arquiteto (software/LLD, soluções/HLD e corporativo) · Papéis e responsabilidades · Requisitos funcionais e não funcionais',
  [('v', ['SWgCLOW1bCE', 'jwBpiEoo8rI', 'mKIltWid_L0', 'fjnYO-puEJE', 'bEYApUHG-r0', 'f0Dp6Ob2guc'])], []),
 ('fs25', 'Domain-Driven Design', 2, 'PLAcZIBgjW3CRe_9cvwbBWkEp37-SEoOMR', None, ['fs24'],
  'Modelagem estratégica (domínio e subdomínios, linguagem ubíqua, bounded contexts, context map) · Modelagem tática (entity, value object, aggregate root, repository, domain service, factory) · Ferramentas: EventStorming, Business Model Canvas, User Story Mapping, Domain Storytelling',
  [('pl', 'PLAcZIBgjW3CRe_9cvwbBWkEp37-SEoOMR'), ('v', ['6jHgd1LY6IE'])], []),
 ('fs26', 'Arquitetura em Camadas e Monólito Modular', 2, 'PLNCSWIsR6ADL_qsxAayXkSzzCCf2xlIy9', YT+'PLQCmSnNFVYnStflA1V__q6_9yC8_nV2ra', ['fs25'],
  'Arquitetura em camadas · Clean Architecture · Arquitetura hexagonal (ports and adapters) · Onion Architecture · Monólito modular',
  [('v', ['zcDKQqFmjEA', 'tetVY6jmlnM', 'Vf2rykpfgAI', 'UKSj5VJEzps', 'DWsxTJpxaOo', 'zo1MVUnfAbo', 'NYoW-ycqbYk', 'HTp5KM9P2yU'])], []),
 ('fs27', 'Sistemas Distribuídos e Padrões Arquiteturais', 2, 'PLNHxHgB-_LTusKqdWaZJtRbcqEMXPZXtw', None, ['fs26'],
  'Arquitetura de microsserviços · Arquitetura orientada a eventos (EDA) · Arquitetura serverless · CQRS · Comunicação síncrona x assíncrona',
  [('v', ['JXeJUfBCg4U', 'qfVs3-mL1nE', 'kgRMPN96Lns', 'voeWcHeYzLI', 'sUqtqNEj9aY', '8xFBQc1A4B8', 'E1mTZtzyDRw',
          '8Z8JAtEEan0', 'WjN4ljhchx0', '2LQkKU3dPGo', 'RCacN_-MKPc'])], []),
 # ---------------- Nível 4 · Arquiteto de Soluções ----------------
 ('fs28', 'Requisitos Não Funcionais (NFRs)', 3, 'PLFmBNfkCoVHJq7FfY8MyZfEZGE4JIaUkW', None, ['fs27'],
  'Planejamento de capacidade (latência x throughput, RPS, concorrência, saturação, taxa de erros) · Escalabilidade e performance (escala vertical x horizontal, auto scaling, load balancing, replicação, sharding, CQRS, cache, filas, CDN) · Consistência (teorema CAP, ACID x BASE, idempotência) · Disponibilidade e resiliência (redundância, failover, zero downtime, graceful degradation, chaos engineering, tracing) · Segurança (VPN, WAF, DDoS, SQL injection, criptografia) · Performance anti-patterns',
  [('v', ['FfigYiI2fKc']), ('pl', 'PLFmBNfkCoVHJq7FfY8MyZfEZGE4JIaUkW'),
   ('v', ['hhy6EDDjy-o', 'xJllDyCIyws', 'bhw4-Kq_RPs', 'VW2mywTTz80'])], []),
 ('fs29', 'System Design', 3, 'PLs-l5bSgIMhAIi4QIWvzwdyoTFXj9CDFv', YT+'PLNHxHgB-_LTusKqdWaZJtRbcqEMXPZXtw', ['fs28'],
  'Fundamentos (cliente-servidor, TCP/IP, bancos) · Proxies e load balancer · Rate limit · Escalar para milhões de usuários · Estudos de caso: encurtador de URL, YouTube, Google Drive, Ticketmaster e placar ao vivo',
  [('v', ['9lYK4gnV86M', '-0Ja8QWCMYo', 'yaNjUYg6yY0', '9g7twJrXqoY', 'jpGGfSV_QWw', '5nwei1ZIvFA', 'hJOVJpYVrO4',
          'uiT4oK19hu4', 'm_anIoKW7Jg', 'JBivKeZVex0', 'qMPfjCH3qQU', '3XSijmIZxXU', 'GwK9hxNS7l4', '6bTkTy6DjOQ',
          '-NF06EaAr0I', '-8tdjn30SSw'])],
  [('Alex Xu', 'https://www.linkedin.com/in/alexxubyte/'), ('Neo Kim', 'https://www.linkedin.com/in/nk-systemdesign-one/'),
   ('Martin Fowler', 'https://www.linkedin.com/in/martin-fowler-com/'), ('Sam Newman', 'https://www.linkedin.com/in/samnewman/'),
   ('Gaurav Sen', 'https://www.linkedin.com/in/gkcs/')]),
 ('fs30', 'AWS Certified Cloud Practitioner (recomendação)', 3, 'PLz3hnOImntAPoJZ2JAWtOzc34X1EI_ge7', None, ['fs22', 'fs28'],
  'Certificação recomendada no Miro para quem quer seguir como arquiteto de soluções: conceitos de nuvem, segurança, serviços e preços da AWS',
  [('pl', 'PLz3hnOImntAPoJZ2JAWtOzc34X1EI_ge7')], []),
]

# Livros do quadro "LIVROS QUE EU INDICO" (os técnicos), cada um ligado ao curso em que mais ajuda.
BOOKS = [
 ('fs16', 'Código Limpo: Habilidades Práticas do Agile Software', 'Robert C. Martin', 'Alta Books',
  'O clássico sobre escrever código legível: nomes, funções, comentários, formatação, tratamento de erros e testes.'),
 ('fs16', 'O Programador Pragmático: de aprendiz a mestre', 'Andrew Hunt, David Thomas', 'Bookman',
  'Hábitos e atitudes de quem programa bem: responsabilidade, automação, DRY, protótipos e aprendizado contínuo.'),
 ('fs19', 'Padrões de Projeto: Soluções Reutilizáveis de Software Orientado a Objetos', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Bookman',
  'O livro da "Gangue dos Quatro" que catalogou os 23 padrões de projeto clássicos.'),
 ('fs20', 'Refatoração: Aperfeiçoando o Design de Códigos Existentes', 'Martin Fowler', 'Novatec',
  'Catálogo de refatorações e de code smells, com exemplos em JavaScript na 2ª edição.'),
 ('fs24', 'Fundamentos da Arquitetura de Software: uma abordagem de engenharia', 'Mark Richards, Neal Ford', "Alta Books (O'Reilly)",
  'Características arquiteturais, estilos (camadas, microsserviços, eventos...) e as habilidades do arquiteto.'),
 ('fs25', 'Domain-Driven Design: Atacando as Complexidades no Coração do Software', 'Eric Evans', 'Alta Books',
  'O livro original do DDD: linguagem ubíqua, bounded contexts, entidades, value objects e agregados.'),
 ('fs25', 'Aprenda Domain-Driven Design', 'Vlad Khononov', "Alta Books (O'Reilly)",
  'Introdução moderna e prática ao DDD, alinhando arquitetura de software e estratégia de negócio.'),
 ('fs26', 'Arquitetura Limpa: o Guia do Artesão para Estrutura e Design de Software', 'Robert C. Martin', 'Alta Books',
  'Princípios de design e de componentes que levam à Clean Architecture.'),
 ('fs27', 'Criando Microsserviços: projetando sistemas com componentes menores e mais especializados', 'Sam Newman', "Novatec (O'Reilly)",
  'Guia completo para modelar, integrar, implantar, testar e operar microsserviços.'),
 ('fs27', 'Migrando Sistemas Monolíticos para Microsserviços', 'Sam Newman', "Novatec (O'Reilly)",
  'Padrões para decompor um monólito aos poucos, incluindo a separação do banco de dados.'),
 ('fs28', 'Arquitetura de Software: As Partes Difíceis', 'Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani', "Alta Books (O'Reilly)",
  'Análises de trade-off em arquiteturas distribuídas: granularidade, dados, transações e workflows.'),
 ('fs29', 'System Design Interview – An Insider’s Guide (vol. 1)', 'Alex Xu', 'Independente',
  'Framework de 4 passos e estudos de caso clássicos: rate limiter, consistent hashing, encurtador de URL, chat e mais.'),
 ('fs29', 'System Design Interview – An Insider’s Guide (vol. 2)', 'Alex Xu, Sahn Lam', 'ByteByteGo',
  'Mais estudos de caso: proximidade, Google Maps, filas distribuídas, pagamentos, bolsa de valores e outros.'),
]
