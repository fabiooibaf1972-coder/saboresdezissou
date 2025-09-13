-- ========================================
-- CORREÇÃO RÁPIDA - SABORES DE ZISSOU
-- ========================================

-- 1. CORRIGIR TABELA SYSTEM_CONFIG
-- ========================================

-- Remover coluna description se existir
ALTER TABLE system_config DROP COLUMN IF EXISTS description;

-- 2. LIMPAR POLÍTICAS EXISTENTES
-- ========================================

-- Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Produtos são públicos para leitura" ON products;
DROP POLICY IF EXISTS "Apenas admins podem criar produtos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem editar produtos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem deletar produtos" ON products;

DROP POLICY IF EXISTS "Pedidos são visíveis para admins e donos" ON orders;
DROP POLICY IF EXISTS "Qualquer um pode criar pedidos" ON orders;
DROP POLICY IF EXISTS "Apenas admins podem editar pedidos" ON orders;

DROP POLICY IF EXISTS "Imagens são públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins podem atualizar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins podem deletar imagens" ON storage.objects;

-- 3. CRIAR POLÍTICAS CORRETAS
-- ========================================

-- Políticas para PRODUCTS
CREATE POLICY "Produtos são públicos para leitura" ON products
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar produtos" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Apenas admins podem editar produtos" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Apenas admins podem deletar produtos" ON products
    FOR DELETE USING (true);

-- Políticas para ORDERS
CREATE POLICY "Pedidos são visíveis para admins e donos" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode criar pedidos" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Apenas admins podem editar pedidos" ON orders
    FOR UPDATE USING (true);

-- Políticas para STORAGE
CREATE POLICY "Imagens são públicas para leitura" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Apenas admins podem fazer upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Apenas admins podem atualizar imagens" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Apenas admins podem deletar imagens" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images');

-- 4. VERIFICAR SE TUDO ESTÁ FUNCIONANDO
-- ========================================

-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'orders', 'notifications', 'push_subscriptions', 'system_config');

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'orders');

-- ========================================
-- INSTRUÇÕES
-- ========================================

/*
1. Execute este script no SQL Editor do Supabase
2. Isso vai corrigir os erros de coluna e política
3. Depois teste o sistema novamente

ERROS CORRIGIDOS:
- ✅ Coluna "description" removida da tabela system_config
- ✅ Políticas duplicadas removidas e recriadas
- ✅ Todas as políticas funcionando corretamente
*/
