-- SCRIPT ALTERNATIVO PARA VERIFICAR E CRIAR ADMIN NO SUPABASE
-- Execute este script se o anterior deu erro

-- 1. Verificar se tabela admin_users já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        -- Criar tabela de administradores
        CREATE TABLE admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Habilitar RLS
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- 2. Verificar se tabela system_config já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config') THEN
        -- Criar tabela de configurações do sistema
        CREATE TABLE system_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Habilitar RLS para configurações
        ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- 3. Remover políticas antigas se existirem e criar novas
DROP POLICY IF EXISTS "allow_all_operations_on_admin_users" ON admin_users;
DROP POLICY IF EXISTS "allow_all_operations_on_system_config" ON system_config;

-- 4. Criar políticas permissivas
CREATE POLICY "allow_all_operations_on_admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "allow_all_operations_on_system_config" 
ON system_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Inserir admin padrão (verificar se já existe)
INSERT INTO admin_users (email, password_hash, name) 
VALUES (
  'admin@sabores.com', 
  'admin123',
  'Administrador Sabores de Zissou'
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;

-- 6. Inserir configurações padrão (verificar se já existem)
INSERT INTO system_config (key, value) VALUES
  ('admin_email', 'admin@sabores.com'),
  ('webhook_url', ''),
  ('company_name', 'Sabores de Zissou'),
  ('whatsapp', '5511981047422'),
  ('pix', '11981047422')
ON CONFLICT (key) DO NOTHING;

-- 7. Verificar resultado final
SELECT 'Setup concluído com sucesso!' as result;
SELECT 'Admin criado:' as info, email, name FROM admin_users WHERE email = 'admin@sabores.com';
SELECT 'Configurações:' as info, key, value FROM system_config;