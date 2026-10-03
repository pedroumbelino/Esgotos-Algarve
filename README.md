# Esgotos Algarve, website

Site estático de uma página (HTML, CSS e JavaScript, sem dependências) para a Esgotos Algarve Vimasilco Unipessoal Lda, Almancil.

## Ficheiros
- `index.html`: conteúdo e estrutura
- `styles.css`: sistema de tokens (cores, tipografia) e layout
- `script.js`: contactos, menu móvel, barra de chamada em telemóvel e formulário de orçamento
- `assets/favicon.svg`: ícone (tampa de saneamento)

## Antes de publicar
Preencher o telefone e o email no topo de `script.js` (objeto `CONTACTO`). O site inteiro é atualizado a partir daí.
Para quem não usa JavaScript, trocar também `tel:+351000000000`, `000 000 000` e `geral@exemplo.pt` em `index.html`.

## Sistema visual
- Cal `#F4F6F5` (fundo, 60%), Petróleo `#0B3341` e Água `#1F6F78` (marca, 30%), Sinal `#F2B705` (só CTAs, 10%)
- Barlow Condensed (títulos, lembra sinalética de camião) + Public Sans (texto)
- Assinatura: corte técnico do terreno no topo e uma "conduta" que liga as secções, marcadas por tampas de saneamento
