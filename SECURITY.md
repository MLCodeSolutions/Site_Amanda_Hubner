# Segurança

- **O PAT colado no chat foi exposto. Revogue/rotacione agora.** Não use esse valor em nenhum
  lugar. O projeto não contém token, `.env` ou credenciais.
- Autenticação GitHub somente via `gh auth login` ou Git Credential Manager. Nunca grave token em
  arquivo, commit, README ou mensagem.
- `.gitignore` cobre `node_modules`, `.env*`, logs e arquivos de sistema.
- Repositório público: nenhum dado privado, documento confidencial ou credencial.
- Ativar 2FA, secret scanning e branch/tag protection em `main`.
- O código usa `safeUrl()` para links http/https, valida o e-mail antes de montar `mailto:` e não
  usa `innerHTML` com dados não confiáveis.
- Links externos abrem com `rel="noopener noreferrer"`.
- Sem analytics, e-commerce, login ou backend.
- Vídeos (se adicionados): MP4 ≤20 MB ou YouTube; se houver iframe, liberar apenas o domínio do
  player em `frame-src`. PDFs públicos ≤20 MB; confidencial nunca vai ao GitHub público.
