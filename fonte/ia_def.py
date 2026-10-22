# Currículo Inteligência Artificial: dos fundamentos à IA em produção.
import glob, os
from fs_def import _clean

HERE = os.path.dirname(os.path.abspath(__file__))
SKIP = set()

def load(folder='ia'):
    PL, V = {}, {}
    cur = None
    for f in sorted(glob.glob(os.path.join(HERE, folder, 'c*.txt'))):
        for line in open(f, encoding='utf-8'):
            line = line.rstrip('\n')
            if not line: continue
            if line.startswith('#'):
                cur = line[1:].split()[0]; PL[cur] = []; continue
            i, d, t = line.split('|', 2)
            row = [i, d, _clean(t)]
            PL[cur].append(row); V.setdefault(i, row)
    return PL, V

YT = 'https://www.youtube.com/playlist?list='
LEVELS = ['1 · Fundamentos de IA', '2 · Matemática, Estatística e Python', '3 · Machine Learning',
          '4 · Deep Learning', '5 · LLMs, RAG e Agentes', '6 · IA em Produção']

COURSES = [
 ('ia01', 'Introdução à Inteligência Artificial', 0, 'PLHz_AreHm4dm24MhlWJYiR_Rm7TFtvs6S', None, [],
  'O que é IA · Machine Learning, Deep Learning e LLMs · Tokens · Prompts · Vieses e alucinações · IA para estudar e programar',
  [('pl', 'PLHz_AreHm4dm24MhlWJYiR_Rm7TFtvs6S')], []),
 ('ia02', 'IA Generativa na Prática', 0, 'PLHz_AreHm4dk0Hg99bUQMiH1dEn-qu0Hg', None, ['ia01'],
  'Markdown · Método ACR e os 4 pilares do prompt · Geração de imagem e vídeo · Evolução da IA (IA fraca, AGI, ASI) · Assistentes x agentes',
  [('pl', 'PLHz_AreHm4dk0Hg99bUQMiH1dEn-qu0Hg')], []),
 ('ia03', 'Engenharia de Prompt', 0, 'PLucm8g_ezqNqMWJwzCUjQn-SdHDwcxcCY', None, ['ia01'],
  'Prompts básicos · Persona e cenários · Cadeia de pensamento (chain of thought) · Role-playing · Verificador cognitivo · Vibe coding',
  [('pl', 'PLucm8g_ezqNqMWJwzCUjQn-SdHDwcxcCY')], []),
 ('ia04', 'Matemática para Machine Learning', 1, 'PLyqOvdQmGdTTYHKdxWRmt8oOhMwYhmxkM', None, ['ia01'],
  'Limites e derivadas · Derivadas parciais · Vetores · Distribuição normal · Teorema de Bayes · Métricas (MAE, MSE, R²) · Gradiente descendente. Para ir além: as cadeiras de Cálculo e Álgebra Linear da trilha de Matemática.',
  [('pl', 'PLyqOvdQmGdTTYHKdxWRmt8oOhMwYhmxkM')], []),
 ('ia05', 'Estatística para Ciência de Dados', 1, 'PLvlkVRRKOYFQGIZdz7BycJet9OncyXlbq', None, ['ia01'],
  'População e amostra · Medidas de resumo e dispersão · Gráficos · Probabilidade · Distribuições · Intervalo de confiança · Teste de hipótese (com planilhas, Python e SQL)',
  [('pl', 'PLvlkVRRKOYFQGIZdz7BycJet9OncyXlbq')], []),
 ('ia06', 'Python para Machine Learning e Análise de Dados', 1, 'PLyqOvdQmGdTR46HUxDA6Ymv4DGsIjvTQ-', None, ['ia01'],
  'Estruturas do Python · NumPy · Pandas · Matplotlib · Dados faltantes · Primeiro modelo de ML',
  [('pl', 'PLyqOvdQmGdTR46HUxDA6Ymv4DGsIjvTQ-')], []),
 ('ia07', 'Machine Learning', 2, 'PLvlkVRRKOYFR6_LmNcJliicNan2TYeFO2', None, ['ia04', 'ia05', 'ia06'],
  'Ciclo analítico · Regressão linear e logística · Árvores de decisão · Naive Bayes · Métricas e matriz de confusão · Projeto completo de churn (pipeline, tuning e predição)',
  [('pl', 'PLvlkVRRKOYFR6_LmNcJliicNan2TYeFO2')], []),
 ('ia08', 'Machine Learning Avançado (Mestrado IMPA)', 2, 'PLo4jXE-LdDTRLGDL59SkkLPBHVmYphuqI', None, ['ia07'],
  'Disciplina do Programa de Mestrado do IMPA (prof. Paulo Orenstein), com a base teórica e matemática de Machine Learning. Opcional para quem quer aprofundar.',
  [('pl', 'PLo4jXE-LdDTRLGDL59SkkLPBHVmYphuqI')], []),
 ('ia09', 'Redes Neurais: a Intuição Visual', 3, 'PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', None, ['ia07'],
  'O que é uma rede neural · Gradiente descendente · Retropropagação e o cálculo por trás dela · Entropia cruzada (3Blue1Brown, com áudio e legendas em português)',
  [('v', ['aircAruvnKk', 'IHZwWFHWa-w', 'Ilg3gGewQ5U', 'tIeHLnjs5U8', 'GlYgs6v2YfU'])], []),
 ('ia10', 'Deep Learning', 3, 'PL9At2PVRU0ZqVArhU9QMyI3jSe113_m2-', None, ['ia09'],
  'Perceptron · Álgebra linear para DL · Gradiente descendente · PyTorch · MLP · Regularização · Otimizadores · CNNs · RNNs · Autoencoders · GANs (UTFPR)',
  [('pl', 'PL9At2PVRU0ZqVArhU9QMyI3jSe113_m2-')], []),
 ('ia11', 'Visão Computacional', 3, 'PLxI8Can9yAHfjhwNAEYdbf1ok7Kwfz7kG', None, ['ia10'],
  'Imagens digitais · Filtragem e cores · Câmeras · Classificação e segmentação · CNNs · Reconhecimento de objetos e facial (UNIVESP)',
  [('pl', 'PLxI8Can9yAHfjhwNAEYdbf1ok7Kwfz7kG')], []),
 ('ia12', 'Processamento de Linguagem Natural', 3, 'PLxI8Can9yAHeLcxJwSQPrzhWTKoYqgXOL', None, ['ia10'],
  'Tokens e corpus · Similaridade textual · N-gramas · Representação vetorial e embeddings · Modelagem de tópicos · Classificação de textos · Análise de sentimentos (UNIVESP)',
  [('pl', 'PLxI8Can9yAHeLcxJwSQPrzhWTKoYqgXOL')], []),
 ('ia13', 'Transformers e LLMs', 4, 'PLbmt8d_ueDMVMW1Iu4OcmlQGisGhxAmMy', YT + 'PLoROMvodv4rOCXd21gf0CF4xr35yINeOy', ['ia12'],
  'Tokens · Embeddings · Codificação posicional · Mecanismo de atenção · GPT · Treinamento, ajuste fino, raciocínio e avaliação de LLMs · LLMs agênticos. As aulas de Stanford (CME295) são em inglês.',
  [('pl', 'PLbmt8d_ueDMVMW1Iu4OcmlQGisGhxAmMy'), ('v', ['LPZh9BOjkQs', 'wjZofJX0v4M', 'eMlx5fFNoYc', '9-Jl0dxWQs8', 'iv-5mZ_9CPY']),
   ('pl', 'PLoROMvodv4rOCXd21gf0CF4xr35yINeOy')], []),
 ('ia14', 'LangChain e RAG', 4, 'PLZibr6lRx3W9KD-hTt2LyQOSLgsj5xWT1', None, ['ia03', 'ia13'],
  'APIs de LLMs · Runnables e LCEL · Prompt templates · Chains · Memória · RAG: carregadores, splitters, embeddings, bancos vetoriais e recuperadores · Qdrant',
  [('pl', 'PLZibr6lRx3W9KD-hTt2LyQOSLgsj5xWT1')], []),
 ('ia15', 'Agentes de IA', 4, 'PLlrxD0HtieHgKcRjd5-8DT9TbwdlDO-OC', None, ['ia14'],
  'O que são agentes · Frameworks · Uso de ferramentas · RAG agêntico · Planejamento · Multiagentes · Memória · Engenharia de contexto · MCP e A2A · Agentes em produção (Microsoft, em inglês com legendas)',
  [('pl', 'PLlrxD0HtieHgKcRjd5-8DT9TbwdlDO-OC')], []),
 ('ia16', 'MLOps: IA em Produção', 5, 'PLkDaE6sCZn6GMoA0wbpJLi3t34Gd8l0aK', None, ['ia07'],
  'Ciclo de vida de um projeto de ML · Deploy e monitoramento · Data drift · Modelagem centrada em dados · Definição de escopo (DeepLearning.AI, Andrew Ng, em inglês com legendas). Combina com Docker e CI/CD da trilha Full Stack.',
  [('pl', 'PLkDaE6sCZn6GMoA0wbpJLi3t34Gd8l0aK')], []),
]
