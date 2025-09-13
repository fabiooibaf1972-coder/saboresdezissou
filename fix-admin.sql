-- SCRIPT PARA CORRIGIR ADMIN - EXECUTE NO SUPABASE SQL EDITOR

-- 1. Verificar se a tabela existe e suas políticas
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- 2. Desabilitar RLS temporariamente para inserção
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 3. Deletar o usuário admin existente se houver
DELETE FROM admin_users WHERE email = 'admin@sabores.com';

-- 4. Recriar o usuário admin com as credenciais corretas
INSERT INTO admin_users (email, password_hash, name) 
VALUES (
  'admin@sabores.com', 
  'admin123',
  'Administrador Principal'
);

-- 5. Reabilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Recriar políticas permissivas
DROP POLICY IF EXISTS "allow_all_operations_on_admin_users" ON admin_users;

CREATE POLICY "allow_all_operations_on_admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 7. Verificar se foi criado corretamente
SELECT id, email, name, created_at 
FROM admin_users 
WHERE email = 'admin@sabores.com';

-- 8. Verificar as configurações finais
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'admin_users';

SELECT 'Setup do admin concluído!' as resultado;