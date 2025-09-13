-- SCRIPT SIMPLES PARA ADMIN NO SUPABASE
-- Execute APENAS UMA VEZ no SQL Editor

-- 1. Criar tabela admin_users (só se não existir)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Remover política anterior e criar nova
DROP POLICY IF EXISTS "allow_all_operations_on_admin_users" ON admin_users;
CREATE POLICY "allow_all_operations_on_admin_users" 
ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- 4. Inserir admin padrão
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Admin Sabores de Zissou')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'admin123',
  name = 'Admin Sabores de Zissou';

-- 5. Verificar se foi criado
SELECT 'Admin criado com sucesso!' as status;
SELECT email, name, created_at FROM admin_users WHERE email = 'admin@sabores.com';