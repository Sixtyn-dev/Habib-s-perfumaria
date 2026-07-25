# Noor Attar — Site de Perfumes Árabes

Estrutura do projeto:

```
noor-attar/
├── index.html      → estrutura da página
├── css/style.css   → todo o visual do site
├── js/script.js    → catálogo, carrinho via WhatsApp e painel admin
└── README.md
```

## Antes de publicar, ajuste em `js/script.js`:

- `ADMIN_PW` — troque a senha padrão do painel administrativo (`attar2026`).
- `WHATSAPP_NUMBER` — coloque o número real da loja no formato `55DDDXXXXXXXXX`.

## Como usar o painel administrativo

1. Clique no ícone de cadeado no menu (ou em "Área administrativa" no rodapé).
2. Entre com a senha configurada.
3. Em **Adicionar perfume**, cadastre nome, categoria, notas olfativas, preço, estoque e (opcionalmente) uma foto.
4. Em **Gerenciar estoque**, você pode atualizar a quantidade em estoque, editar qualquer perfume ou excluí-lo.

Os dados ficam salvos no navegador (`localStorage`), então continuam lá mesmo depois de fechar a aba. Como é um armazenamento local do navegador, **cada computador/navegador tem seu próprio catálogo** — para um catálogo compartilhado entre várias pessoas (ex: você e um funcionário acessando de dispositivos diferentes), será necessário um banco de dados real no futuro.

## Como publicar o site

Como é um site 100% estático (HTML/CSS/JS puro, sem servidor), você pode hospedar gratuitamente em:

- **Netlify** ou **Vercel**: arraste a pasta inteira no painel de deploy.
- **GitHub Pages**: suba os arquivos para um repositório e ative o Pages nas configurações.

Basta manter os três arquivos/pastas (`index.html`, `css/`, `js/`) juntos, sem alterar os caminhos entre eles.
