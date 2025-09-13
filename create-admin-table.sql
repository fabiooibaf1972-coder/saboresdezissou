-- SCRIPT PARA CRIAR TABELA DE ADMIN NO SUPABASE
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Criar tabela de administradores
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

-- 3. Remover política se existir e criar nova
DROP POLICY IF EXISTS "allow_all_operations_on_admin_users" ON admin_users;
CREATE POLICY "allow_all_operations_on_admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Inserir admin padrão (senha: admin123)
-- Senha em texto simples para simplicidade inicial
INSERT INTO admin_users (email, password_hash, name) 
VALUES (
  'admin@sabores.com', 
  'admin123',
  'Administrador Sabores de Zissou'
)
ON CONFLICT (email) DO NOTHING;

-- 5. Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Habilitar RLS para configurações
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 7. Remover política se existir e criar nova para configurações
DROP POLICY IF EXISTS "allow_all_operations_on_system_config" ON system_config;
CREATE POLICY "allow_all_operations_on_system_config" 
ON system_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 8. Inserir configurações padrão
INSERT INTO system_config (key, value) VALUES
  ('admin_email', 'admin@sabores.com'),
  ('webhook_url', ''),
  ('company_name', 'Sabores de Zissou'),
  ('whatsapp', '5511981047422'),
  ('pix', '11981047422')
ON CONFLICT (key) DO NOTHING;

-- 9. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as result;
SELECT * FROM admin_users;
SELECT * FROM system_config;