# Site da Dra. Amanda Hübner — Google Sites (modo app)

Projeto de hospedagem de assets no GitHub + jsDelivr e um **único `dist/index.html` autossuficiente**
para colar em Google Sites > Incorporar código. O iframe é uma aplicação completa: header sticky,
menu mobile, WhatsApp flutuante, voltar ao topo, preloader e animações.

- Repositório: `MLCodeSolutions/Site_Amanda_Hubner`
- Tag inicial: `v1.0.0` (imutável; qualquer mudança exige nova tag)
- Base de assets: `https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_Amanda_Hubner@v1.0.0/`
- O site original em `../Site/` **não é alterado**; este projeto copia e adapta o conteúdo.

## Comandos

```powershell
npm ci
npm run build          # build local: dist/index.html com assets em ../assets/
npm run build:release  # build final com URLs jsDelivr na tag v1.0.0
npm run check          # valida o self-contained
node tools/check.mjs --cdn=https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_Amanda_Hubner@v1.0.0
npm run assets         # gera docs/ASSETS.md a partir do build
```

## Estrutura

```
assets/img/      retrato WebP 600/1200, logos, OG 1200x630, favicon, ilustrações SVG
assets/video/    vazio (N/A) — .gitkeep
assets/docs/     vazio (N/A) — .gitkeep
assets/fonts/    10 WOFF2 locais
src/index.html   HTML de origem (header, seções, footer, loader, flutuantes)
src/css/         7 CSS + main.css (entry) + app.css (modo app)
src/js/          site-config, safe, animations, main, app (entry)
dist/            index.html, index-cdn.html, main.min.css/js, integrity, asset-urls, size, check
tools/           build, check, assets
docs/            GOOGLE-SITES.md, ASSETS.md
```

## Estado atual

- `dist/index.html` é self-contained (CSS/JS inline) e usa apenas imagens/fontes no jsDelivr.
- `dist/index-cdn.html` é a alternativa com CSS/JS externos + SRI, caso o campo do Google Sites
  rejeite o tamanho do self-contained.
- Modal: **PENDENTE** — o cliente optou por não definir conteúdo/gatilho.
- Retrato 1200 é upscale do original 485×641; pedir original maior.
- Vídeos e documentos: N/A.
- Publicação no GitHub: requer autenticação via `gh auth login`/Git Credential Manager; **nunca**
  use token em arquivo, commit ou chat.

## Publicação

1. Autentique no GitHub (`gh auth login`) e crie `MLCodeSolutions/Site_Amanda_Hubner` público, se
   ainda não existir.
2. `npm run build:release`, `npm run check`, `node tools/check.mjs --cdn=...`, `npm run assets`.
3. Commit de `src`, `assets`, `tools`, `docs`, `dist`; `git tag -a v1.0.0`; push de `main` e da tag.
4. Teste as URLs do jsDelivr e cole `dist/index.html` no Google Sites conforme
   `docs/GOOGLE-SITES.md`.
5. Qualquer alteração: nova tag, novo build, recolar; nunca mover tag.

## Pendências

- Modal (conteúdo/gatilho).
- Original em alta resolução do retrato.
- Depoimentos fictícios, alegações técnicas e autorização da foto precisam de aprovação.
- Teste de colagem/limite do Google Sites e teste em Safari iOS/Chrome Android reais.
- Token exposto no chat deve ser revogado antes de qualquer push.
