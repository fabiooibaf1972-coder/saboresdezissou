# 🍰 Sabores de Zissou - PWA Confeitaria

Um aplicativo PWA completo para confeitaria com painel administrativo, integração com WhatsApp e sistema de pedidos.

## ✨ Funcionalidades

### 🎨 Interface do Cliente
- **Produtos do Dia**: Carrossel interativo com formulário de pedido
- **Produtos Sob Encomenda**: Grade de produtos com páginas de detalhes
- **Design Responsivo**: Paleta de cores pastéis e layout moderno
- **PWA Completo**: Instalável em dispositivos móveis

### 📱 Integração WhatsApp
- Formulários de pedido automáticos
- Formatação de mensagens personalizadas
- Máscara de telefone automática
- Envio via webhook configurável

### 👨‍💼 Painel Administrativo
- Sistema de autenticação
- CRUD completo de produtos
- Upload de imagens para Supabase
- Dashboard com estatísticas
- Gerenciamento de pedidos

### ☁️ Backend
- Supabase como banco de dados
- Storage para imagens
- APIs REST completas
- Row Level Security

## 🚀 Configuração

### 1. Instalação
```bash
npm install
```

### 2. Configuração do Ambiente
Copie `.env.example` para `.env.local` e configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uvkcloxlnnvluzoovvgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# WhatsApp Webhook
NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL=sua_webhook_url_aqui

# Admin
ADMIN_PASSWORD=sua_senha_admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@sabores.com
```

### 3. Configuração do Banco de Dados

Execute o script de configuração:
```bash
node setup-database.js
```

Ou execute manualmente no SQL Editor do Supabase:
```sql
-- Criar tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_daily_product BOOLEAN DEFAULT FALSE,
  is_custom_product BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_whatsapp VARCHAR(20) NOT NULL,
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Produtos são públicos" ON products FOR SELECT USING (true);
CREATE POLICY "Inserir pedidos público" ON orders FOR INSERT WITH CHECK (true);

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Política para storage
CREATE POLICY "Imagens públicas" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
```

### 4. Executar o Projeto
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

## 📱 Como Usar

### Acesso Cliente
- Acesse `http://localhost:3000`
- Navegue pelos produtos do dia e sob encomenda
- Faça pedidos através dos formulários

### Acesso Administrador
- Acesse `http://localhost:3000/admin`
- Login: `admin@sabores.com`
- Senha: configurada no `.env.local`

### Funcionalidades Admin
- **Dashboard**: Visualize estatísticas gerais
- **Produtos**: Criar, editar e remover produtos
- **Upload**: Adicionar imagens aos produtos
- **Pedidos**: Visualizar todos os pedidos recebidos

## 🔧 Configurações Adicionais

### WhatsApp Webhook
Configure um webhook para receber os pedidos automaticamente no WhatsApp. O formato da mensagem será:

```
🍰 Novo Pedido - Sabores de Zissou

🛍️ Produto: [Nome do Produto]
👤 Cliente: [Nome do Cliente]
📱 WhatsApp: [Telefone]
📍 Endereço: [Endereço completo]
📅 Data para entrega: [Se aplicável]

⏰ Pedido realizado em: [Data e hora]
```

### PWA
O aplicativo é um PWA completo e pode ser instalado em dispositivos móveis:
- Chrome: Botão "Instalar app"
- Safari: "Adicionar à tela inicial"

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Pages (App Router)
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── produto/[id]/      # Páginas de produtos
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI
│   └── ...               # Componentes específicos
├── lib/                  # Utilitários
│   ├── supabase.ts       # Cliente Supabase
│   └── utils.ts          # Funções utilitárias
├── types/                # Definições TypeScript
└── contexts/             # Context API (Auth)
```

## 🎨 Design System

### Cores Pastéis
- `pastel-pink`: #F8BBD9
- `pastel-peach`: #F4A261
- `pastel-cream`: #FDF2E9
- `pastel-lavender`: #E9C46A
- `pastel-mint`: #A8DADC
- `pastel-rose`: #F1C0E8
- `pastel-vanilla`: #F9F7E8
- `pastel-blush`: #FFE5E5

### Tipografia
- **Display**: Playfair Display (títulos)
- **Body**: Inter (texto)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Outras Plataformas
- Netlify
- Railway
- Heroku

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para Sabores de Zissou**