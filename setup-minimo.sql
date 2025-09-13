-- 🚀 SCRIPT MÍNIMO - Execute este se os outros falharam

-- 1. Criar tabela admin_users (o mais importante)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS e criar política permissiva
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "allow_all_admin_users" ON admin_users;

-- Criar nova política
CREATE POLICY "allow_all_admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Inserir admin padrão
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Admin Sabores')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'admin123',
  name = 'Admin Sabores';

-- 4. Verificar se funcionou
SELECT '🎉 ADMIN CRIADO COM SUCESSO!' as resultado;
SELECT email, name, created_at FROM admin_users WHERE email = 'admin@sabores.com';

-- 5. Criar tabela products simples
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$
BEGIN
    -- Adicionar is_daily se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_daily') THEN
        ALTER TABLE products ADD COLUMN is_daily BOOLEAN DEFAULT false;
    END IF;
    
    -- Adicionar category se não existir  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'geral';
    END IF;
END
$$;

-- 6. RLS para products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_products" ON products;
CREATE POLICY "allow_all_products" ON products FOR ALL USING (true) WITH CHECK (true);

-- 7. Produto de teste (só inserir se todas as colunas existirem)
DO $$
BEGIN
    -- Verificar se as colunas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_daily') THEN
        INSERT INTO products (name, description, price, is_daily) 
        VALUES ('Bolo de Chocolate', 'Bolo delicioso', 45.00, true)
        ON CONFLICT DO NOTHING;
    ELSE
        -- Inserir sem is_daily se a coluna não existir
        INSERT INTO products (name, description, price) 
        VALUES ('Bolo de Chocolate', 'Bolo delicioso', 45.00)
        ON CONFLICT DO NOTHING;
    END IF;
END
$$;

SELECT '✅ CONFIGURAÇÃO MÍNIMA CONCLUÍDA!' as final;