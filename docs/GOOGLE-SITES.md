# Publicar o site da Amanda no Google Sites

Pré-requisitos: repositório público `MLCodeSolutions/Site_Amanda_Hubner`, tag `v1.0.0` publicada,
`dist/index.html` gerado com `npm run build:release` e URLs do jsDelivr respondendo 200.

## 1. Antes de colar

Confirme na tag exata (sem `@main`):

- `https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_Amanda_Hubner@v1.0.0/dist/main.min.css`
- `https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_Amanda_Hubner@v1.0.0/dist/main.min.js`
- uma imagem (`assets/img/amanda-retrato-600.webp`)
- uma fonte (`assets/fonts/hanken-grotesk-latin.woff2`)

Se alguma URL der 404 logo após o push da tag, aguarde a indexação do jsDelivr e teste novamente.

## 2. Configuração da página no Google Sites

- Nome/título da página: `Dra. Amanda Hübner — Veterinária Domiciliar`.
- Tema mínimo; **esconder o cabeçalho e a navegação nativa** nas configurações de tema/navegação,
  porque o embed traz header e menu próprios.
- Fundo da página: `#F3EEDF`.
- Favicon e imagem de compartilhamento: configurar no próprio Google Sites, se desejado (o embed
  não fornece SEO).
- Deixar **somente o bloco incorporado** na página.

## 3. Inserir o bloco

1. Editar a página > **Inserir > Incorporar > Incorporar código**.
2. Colar **todo** o conteúdo de `dist/index.html`.
3. Avançar > Inserir.
4. Usar a opção de embed em página inteira, se aparecer. Se não aparecer, arrastar o bloco até as
   quatro bordas e usar a altura máxima disponível.
5. Não adicionar outros blocos: a rolagem deve ficar dentro do iframe.

O modo app usa header sticky, WhatsApp flutuante, voltar ao topo e preloader dentro do iframe; a
altura do bloco deve ser a maior possível. Se o bloco ficar menor que a tela, aparecerá rolagem
dupla (Sites + iframe).

## 4. Publicar e testar

1. Publicar com visibilidade **“Qualquer pessoa”**.
2. Abrir a URL publicada (não só o preview do editor) em Chrome desktop, Safari iOS e Chrome
   Android reais.
3. Verificar:
   - preloader some em até 3 s (mesmo com imagem/fonte bloqueada);
   - header sticky, menu mobile abre/fecha, WhatsApp flutuante e voltar ao topo;
   - âncoras param abaixo do header;
   - FAQ, galeria e carrossel funcionam;
   - sem rolagem horizontal em 390/768/1440;
   - sem erros de SRI/404 no console (na versão self-contained não há SRI externo).
4. Registrar limitações do Google Sites: margens/barras de alguns celulares e comportamento de
   tela cheia variam por dispositivo.

## 5. Modal

O prompt previa um modal, mas o cliente optou por não definir conteúdo/gatilho. **PENDENTE**: não
há modal no site. Se for definido depois, implementar em `src`, rebuildar e publicar nova tag.

## 6. SEO

O Google Sites ignora `title`, meta description, Open Graph, canonical e JSON-LD dentro do iframe.
Configure nome, descrição, URL amigável, favicon e imagem de compartilhamento no próprio Sites.
Não conte com o embed para SEO.

## 7. Atualizações e rollback

1. Alterar `src/`/`assets/`.
2. `npm run build:release` com uma **nova tag** (nunca reutilizar).
3. `npm run check`, `npm run assets`, commit do `dist/`.
4. Push de `main` e da nova tag; recolar o novo `index.html` e reconfigurar a altura do bloco.
5. Para rollback, reverter para a tag anterior e recolar o `index.html` correspondente.
