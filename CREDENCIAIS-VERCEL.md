# 🔐 Credenciais de Acesso - Sabores de Zissou

## 📋 Informações para Login Admin

### 🌐 **URL da Aplicação na Vercel**
Acesse: https://saboresdezissou.vercel.app/admin

### 🔑 **Credenciais Padrão**
- **Email**: `admin@sabores.com`
- **Senha**: `admin123`

### ⚙️ **Se as credenciais não funcionarem:**

1. **Verifique as variáveis de ambiente na Vercel:**
   - `NEXT_PUBLIC_ADMIN_EMAIL` = admin@sabores.com
   - `ADMIN_PASSWORD` = admin123

2. **Para alterar as credenciais:**
   - Faça login com as credenciais padrão
   - Vá em "Configurações" no painel admin
   - Altere email e senha
   - As novas credenciais serão salvas automaticamente

## 📱 **PWA Installation**

### ✅ **Novo Sistema de Instalação Implementado:**
- Prompt automático aparece após 3 segundos
- Botão "Instalar" visível
- Funciona em Chrome, Edge, Safari
- Detecta se já está instalado

### 🔍 **Para testar a instalação:**
1. Acesse no celular ou Chrome desktop
2. Aguarde 3 segundos
3. Verá popup no canto inferior direito
4. Clique em "Instalar"

### 🛠️ **Se não aparecer o prompt:**
- Chrome: Menu → "Instalar Sabores de Zissou"
- Safari: Compartilhar → "Adicionar à Tela Inicial"
- Edge: Menu → "Aplicativos" → "Instalar este site"

## 🧪 **Para Testar Localmente:**
```bash
git pull origin main
npm run dev
# Acesse: http://localhost:3000/admin
```

---
**Data de atualização**: 2025-09-10  
**Status**: ✅ Funcional na Vercel