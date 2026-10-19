# ULivre Estudos

Plataforma de estudos para os currículos da [Universidade Brasileira Livre](https://github.com/Universidade-Livre): Ciência da Computação, Matemática e seis especializações, reunidos num só lugar.

- **8 trilhas, 140 cursos e 3.851 aulas**, com a lista de vídeos de cada playlist
- **Lista, quadro e mapa** de pré-requisitos para cada trilha
- **Plano de estudos**: você informa as horas por semana e a plataforma estima quando termina cada etapa, usando a duração real das aulas
- **Anotações por aula** com o minuto do vídeo
- **Revisão espaçada** (1, 3, 7, 21 e 60 dias) das aulas assistidas
- **Exercícios** encontrados nas playlists e plataformas de prática
- **Estante** com os 87 livros recomendados e onde ler cada um
- **Comece aqui**: roteiro de 5 passos para quem está chegando

O progresso fica salvo no navegador de cada pessoa (`localStorage`). Não há conta nem servidor.

## Rodar localmente

É um site estático, sem etapa de build. Abra o `index.html` ou sirva a pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

| Arquivo | O que é |
| --- | --- |
| `index.html` | Página única do app |
| `styles.css` | Estilos (temas claro e escuro) |
| `app.js` | Lógica do app |
| `data.js` | Trilhas, cursos, aulas e livros (gerado) |
| `fonte/` | Dados de origem e scripts que geram o `data.js` |

## Atualizar os dados

As listas de aulas ficam em `fonte/aulas-cc.txt` e `fonte/aulas-trilhas.txt`, no formato `idDoVideo|duração|título`, agrupadas por `#chave`. Os cursos, pré-requisitos e livros vêm dos repositórios da ULivre.

```bash
# 1. clonar os currículos da ULivre
git clone --depth 1 https://github.com/Universidade-Livre/ciencia-da-computacao repos/cc
git clone --depth 1 https://github.com/Universidade-Livre/matematica repos/mat

# 2. extrair cursos, pré-requisitos e livros
python3 fonte/parse.py repos

# 3. gerar o data.js
python3 fonte/build.py
```

## Deploy no Cloudflare Pages

1. No painel da Cloudflare, vá em **Workers & Pages → Create → Pages → Connect to Git** e escolha este repositório.
2. Em **Build settings**, deixe o comando de build vazio e use `/` como diretório de saída.
3. Clique em **Save and Deploy**. Cada push na branch principal publica uma nova versão.

## Créditos

O conteúdo dos currículos (cursos, playlists, pré-requisitos e bibliografias) é da [Universidade Brasileira Livre](https://github.com/Universidade-Livre), sob licença MIT. Os vídeos pertencem aos seus autores e são abertos no YouTube.
