-- 🔑 SCRIPT ULTRA SIMPLES - SÓ PARA CRIAR ADMIN

-- 1. Apagar tabela se existir (para recomeçar limpo)
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Criar tabela admin_users do zero
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Desabilitar RLS temporariamente para testar
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 4. Inserir admin
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Admin Sabores');

-- 5. Verificar se funcionou
SELECT '🎉 ADMIN CRIADO!' as status;
SELECT * FROM admin_users WHERE email = 'admin@sabores.com';

-- 6. Reabilitar RLS e criar política depois
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON admin_users FOR ALL USING (true) WITH CHECK (true);