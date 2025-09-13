-- 🚀 SETUP SABORES DE ZISSOU - CONFIGURAÇÃO FINAL
-- Execute este script no SQL Editor do seu Supabase

-- 1. CRIAR TABELA DE ADMINS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONFIGURAR RLS PARA ADMIN
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_access_policy" ON admin_users;
CREATE POLICY "admin_access_policy" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- 3. INSERIR ADMIN PRINCIPAL
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Administrador Sabores de Zissou')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'admin123',
  name = 'Administrador Sabores de Zissou';

-- 4. CRIAR TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(100) DEFAULT 'geral',
  is_daily BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS PARA PRODUTOS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_read_policy" ON products;
DROP POLICY IF EXISTS "products_admin_policy" ON products;
CREATE POLICY "products_read_policy" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_policy" ON products FOR ALL USING (true) WITH CHECK (true);

-- 6. PRODUTOS INICIAIS
INSERT INTO products (name, description, price, category, is_daily) VALUES
  ('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura cremosa', 45.00, 'bolos', true),
  ('Torta de Morango', 'Torta fresca com morangos selecionados', 55.00, 'tortas', false),
  ('Brigadeiro Gourmet', 'Brigadeiros artesanais diversos sabores', 3.50, 'docinhos', true),
  ('Pão de Açúcar', 'Pão doce tradicional', 8.00, 'paes', true),
  ('Sonho de Creme', 'Sonho recheado com creme', 6.50, 'docinhos', true)
ON CONFLICT DO NOTHING;

-- 7. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RLS PARA PEDIDOS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_policy" ON orders;
CREATE POLICY "orders_policy" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 9. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RLS PARA CONFIGURAÇÕES
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "config_policy" ON system_config;
CREATE POLICY "config_policy" ON system_config FOR ALL USING (true) WITH CHECK (true);

-- 11. CONFIGURAÇÕES INICIAIS
INSERT INTO system_config (key, value) VALUES
  ('company_name', 'Sabores de Zissou'),
  ('whatsapp', '5511981047422'),
  ('admin_email', 'admin@sabores.com'),
  ('pix', '11981047422')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value, 
  updated_at = NOW();

-- 12. TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notification_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription JSONB NOT NULL,
  user_type VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RLS PARA NOTIFICAÇÕES
ALTER TABLE notification_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_policy" ON notification_subscribers;
CREATE POLICY "notifications_policy" ON notification_subscribers FOR ALL USING (true) WITH CHECK (true);

-- 14. CRIAR BUCKET PARA IMAGENS (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- 15. POLÍTICAS PARA STORAGE
DROP POLICY IF EXISTS "product_images_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_write" ON storage.objects;

CREATE POLICY "product_images_read" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_write" ON storage.objects 
FOR ALL USING (bucket_id = 'product-images') 
WITH CHECK (bucket_id = 'product-images');

-- 16. VERIFICAÇÃO FINAL
SELECT '🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!' as status;
SELECT 'Tabelas criadas:' as info, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'products', 'orders', 'system_config', 'notification_subscribers');

SELECT '👤 Admin criado:' as tipo, email, name, created_at 
FROM admin_users 
WHERE email = 'admin@sabores.com';

SELECT '🛍️ Produtos:' as tipo, COUNT(*) as total FROM products;
SELECT '⚙️ Configurações:' as tipo, COUNT(*) as total FROM system_config;

-- 17. MOSTRAR CREDENCIAIS
SELECT '🔑 CREDENCIAIS DE LOGIN:' as info;
SELECT 'Email: admin@sabores.com' as login;
SELECT 'Senha: admin123' as senha;