-- SCRIPT PARA CORRIGIR POLÍTICAS RLS NO SUPABASE
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Remover todas as políticas antigas da tabela products
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "allow_all_operations_on_products" ON products;

-- 2. Garantir que RLS está habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Criar nova política permissiva para todas as operações
CREATE POLICY "allow_all_operations_on_products" 
ON products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Verificar se a política foi criada corretamente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 5. Testar inserção de um produto de teste
INSERT INTO products (name, description, is_daily_product, is_custom_product, created_at)
VALUES ('Teste RLS', 'Produto para testar RLS', false, false, NOW());

-- 6. Verificar se o produto foi inserido
SELECT id, name, description FROM products WHERE name = 'Teste RLS';

-- 7. Remover produto de teste (opcional)
DELETE FROM products WHERE name = 'Teste RLS';

-- Se tudo funcionou, as políticas RLS estão corrigidas!