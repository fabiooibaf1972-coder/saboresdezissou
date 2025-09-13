-- 🔧 CONFIGURAÇÃO COMPLETA DO SABORES DE ZISSOU
-- Execute este script no seu Editor SQL do Supabase

-- 1. CRIAR TABELAS NECESSÁRIAS
-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(100) DEFAULT 'geral',
  is_daily BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de assinantes de notificação
CREATE TABLE IF NOT EXISTS notification_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription JSONB NOT NULL,
  user_type VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONFIGURAR RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS ANTIGAS E CRIAR NOVAS
-- Admin users
DROP POLICY IF EXISTS "allow_all_admin_users" ON admin_users;
CREATE POLICY "allow_all_admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- System config
DROP POLICY IF EXISTS "allow_all_system_config" ON system_config;
CREATE POLICY "allow_all_system_config" ON system_config FOR ALL USING (true) WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "allow_read_products" ON products;
DROP POLICY IF EXISTS "allow_all_products" ON products;
CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "allow_all_products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "allow_all_orders" ON orders;
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Notification subscribers
DROP POLICY IF EXISTS "allow_all_notification_subscribers" ON notification_subscribers;
CREATE POLICY "allow_all_notification_subscribers" ON notification_subscribers FOR ALL USING (true) WITH CHECK (true);

-- 4. INSERIR ADMIN PADRÃO
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Administrador Sabores de Zissou')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'admin123',
  name = 'Administrador Sabores de Zissou';

-- 5. INSERIR CONFIGURAÇÕES PADRÃO
INSERT INTO system_config (key, value) VALUES
  ('admin_email', 'admin@sabores.com'),
  ('admin_password', 'admin123'),
  ('webhook_url', ''),
  ('company_name', 'Sabores de Zissou'),
  ('whatsapp', '5511981047422'),
  ('pix', '11981047422')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. INSERIR PRODUTOS DE EXEMPLO
-- Primeiro, garantir que a coluna category existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'geral';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_available') THEN
        ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
END
$$;

-- Agora inserir os produtos
INSERT INTO products (name, description, price, category, is_daily, image_url) VALUES
  ('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura cremosa', 45.00, 'bolos', true, null),
  ('Torta de Morango', 'Torta fresca com morangos selecionados', 55.00, 'tortas', false, null),
  ('Brigadeiro Gourmet', 'Brigadeiros artesanais diversos sabores', 3.50, 'docinhos', true, null),
  ('Pão de Açúcar', 'Pão doce tradicional feito com açúcar cristal', 8.00, 'paes', true, null),
  ('Sonho de Creme', 'Sonho recheado com creme de confeiteiro', 6.50, 'docinhos', true, null)
ON CONFLICT DO NOTHING;

-- 7. CONFIGURAR STORAGE (se necessário)
-- Criar bucket para imagens de produtos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Política para bucket de imagens
DROP POLICY IF EXISTS "allow_public_read" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_operations" ON storage.objects;

CREATE POLICY "allow_public_read" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "allow_all_operations" ON storage.objects 
FOR ALL USING (bucket_id = 'product-images') 
WITH CHECK (bucket_id = 'product-images');

-- 8. VERIFICAÇÃO FINAL
SELECT '✅ CONFIGURAÇÃO CONCLUÍDA!' as status;
SELECT '👤 Admin criado:' as info, email, name FROM admin_users WHERE email = 'admin@sabores.com';
SELECT '⚙️ Configurações:' as info, COUNT(*) as total FROM system_config;
SELECT '🛍️ Produtos de exemplo:' as info, COUNT(*) as total FROM products;

SELECT '🔑 CREDENCIAIS DE LOGIN:' as credenciais;
SELECT 'Email: admin@sabores.com' as login_info;
SELECT 'Senha: admin123' as login_info;