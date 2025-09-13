# 🎯 INSTRUÇÕES DE CONFIGURAÇÃO - SABORES DE ZISSOU

## ✅ PROBLEMAS RESOLVIDOS:
1. **PWA Install**: Agora aparece um botão "📱 Instalar como app" abaixo do botão de notificações
2. **Login Admin**: Sistema de debug melhorado para identificar problemas

## 🔧 PASSOS PARA CONFIGURAR:

### 1. CONFIGURAR SUPABASE

1. **Acesse seu projeto Supabase:**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Execute o script SQL:**
   - Clique em "SQL Editor" no menu lateral
   - Copie e cole o conteúdo do arquivo `setup-completo.sql`
   - Clique em "Run" para executar
   - ✅ Deve aparecer "CONFIGURAÇÃO CONCLUÍDA!" no final

3. **Pegue suas credenciais:**
   - Vá em "Settings" > "API"
   - Copie a "Project URL" e "anon public key"
   - Em "Service Role", copie a "service_role key" também

### 2. CONFIGURAR VARIÁVEIS DE AMBIENTE

1. **Crie o arquivo `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
   ```

2. **Substitua os valores** pelas suas credenciais reais do Supabase

### 3. TESTAR O SISTEMA

1. **Instalar dependências (se necessário):**
   ```bash
   npm install
   ```

2. **Executar o projeto:**
   ```bash
   npm run dev
   ```

3. **Testar PWA:**
   - Acesse http://localhost:3000
   - Role até o final da página (seção "Fale Conosco")
   - Deve aparecer o botão "📱 Instalar como app" abaixo de "Ativar Notificações"

4. **Testar Login Admin:**
   - Acesse http://localhost:3000/admin
   - Use as credenciais padrão:
     - **Email:** admin@sabores.com
     - **Senha:** admin123
   - Abra o Console do navegador (F12) para ver logs de debug

## 🐛 SE DER ERRO:

### Erro de Login:
1. Abra o Console (F12) e veja as mensagens de debug
2. Verifique se a tabela `admin_users` foi criada no Supabase
3. Confirme se as credenciais estão corretas no `.env.local`

### Erro de PWA:
1. O botão sempre aparece agora (versão simplificada)
2. Em dispositivos móveis, mostra instruções específicas
3. Em desktop, mostra instruções gerais

### Problemas de Conexão:
1. Verifique se o Supabase está online
2. Confirme as URLs no `.env.local`
3. Certifique-se que as políticas RLS foram criadas

## 📱 COMO FUNCIONA O PWA:

- **Mobile (iOS/Android):** Clique no botão → Seguir instruções do popup
- **Desktop:** Clique no botão → Menu do navegador → "Instalar app"
- **PWA ativo:** Funciona offline, aparece na tela inicial

## 🔐 CREDENCIAIS PADRÃO:
- **Email:** admin@sabores.com  
- **Senha:** admin123

## 📞 PRÓXIMOS PASSOS:
1. Teste o login admin
2. Adicione produtos via painel admin
3. Configure webhook do WhatsApp (opcional)
4. Personalize design conforme necessário

---
💡 **Dica:** Se algo não funcionar, mande print da tela e dos erros no console!