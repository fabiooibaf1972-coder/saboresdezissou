# 🗄️ INSTRUÇÕES COMPLETAS - SUPABASE

## 🚨 **ERRO RESOLVIDO**: `relation "notifications" does not exist`

O erro aconteceu porque as tabelas não existiam no Supabase. Agora você tem os scripts completos!

## 📋 **PASSO A PASSO PARA CONFIGURAR**

### **1. CRIAR AS TABELAS**
Execute no **SQL Editor** do Supabase:
```sql
-- Execute o arquivo: CREATE-TABLES-SUPABASE.sql
```

### **2. CONFIGURAR POLÍTICAS**
Execute no **SQL Editor** do Supabase:
```sql
-- Execute o arquivo: SUPABASE-POLICIES.sql
```

### **3. CRIAR BUCKET PARA IMAGENS**
No **Storage** do Supabase:
1. Clique em "New bucket"
2. Nome: `product-images`
3. Marque como **Público**
4. Clique em "Create bucket"

## 🗂️ **ESTRUTURA CRIADA**

### **Tabelas**:
- ✅ `products` - Produtos da confeitaria
- ✅ `orders` - Pedidos dos clientes
- ✅ `notifications` - Notificações do sistema
- ✅ `push_subscriptions` - Inscrições para push notifications
- ✅ `system_config` - Configurações do sistema

### **Dados Iniciais**:
- ✅ 3 produtos de exemplo
- ✅ Configurações padrão
- ✅ Índices para performance
- ✅ Triggers automáticos

### **Políticas**:
- ✅ Acesso público para leitura de produtos
- ✅ Acesso público para imagens
- ✅ Políticas para admins e usuários

## 🧪 **COMO TESTAR**

### **Teste 1 - Produtos**:
1. Acesse `/admin` → "Produtos"
2. Deve aparecer os 3 produtos de exemplo
3. Teste criar um novo produto

### **Teste 2 - Imagens**:
1. Crie um produto com imagem
2. Marque como "Produto do Dia"
3. Vá para a home → Imagem deve aparecer

### **Teste 3 - Notificações**:
1. Vá em "Configurações"
2. Teste ativar notificações
3. Deve funcionar sem erro

## 🔧 **SE AINDA DER ERRO**

### **Erro de Tabela**:
```sql
-- Verifique se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Erro de Bucket**:
- Verifique se o bucket `product-images` existe
- Verifique se está marcado como público

### **Erro de Políticas**:
```sql
-- Verifique as políticas
SELECT * FROM pg_policies WHERE tablename = 'products';
```

## 📁 **ARQUIVOS CRIADOS**

1. ✅ `CREATE-TABLES-SUPABASE.sql` - Cria todas as tabelas
2. ✅ `SUPABASE-POLICIES.sql` - Configura as políticas
3. ✅ `INSTRUÇÕES-SUPABASE.md` - Este arquivo de instruções

## 🎯 **RESULTADO ESPERADO**

Após executar os scripts:
- ✅ Todas as tabelas criadas
- ✅ Políticas configuradas
- ✅ Bucket de imagens funcionando
- ✅ Sistema 100% funcional
- ✅ Sem mais erros de "relation does not exist"

## 🚀 **PRÓXIMOS PASSOS**

1. Execute os scripts no Supabase
2. Teste o sistema
3. Se tudo funcionar, está pronto para produção!

---
**Status**: ✅ **SCRIPTS COMPLETOS CRIADOS**
**Data**: $(Get-Date)
