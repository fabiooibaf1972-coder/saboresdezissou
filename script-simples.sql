-- 🔥 SCRIPT SUPER SIMPLES - SEM ERROS
-- Execute este no SQL Editor do Supabase

-- 1. CRIAR ADMIN (o mais importante)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POLÍTICA SIMPLES
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_policy" ON admin_users;
CREATE POLICY "admin_policy" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- 3. INSERIR ADMIN
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Admin Sabores')
ON CONFLICT (email) DO UPDATE SET password_hash = 'admin123';

-- 4. CRIAR PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. POLÍTICA PRODUTOS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_policy" ON products;
CREATE POLICY "products_policy" ON products FOR ALL USING (true) WITH CHECK (true);

-- 6. PRODUTO TESTE
INSERT INTO products (name, description, price) 
VALUES ('Bolo de Chocolate', 'Delicioso bolo', 45.00)
ON CONFLICT DO NOTHING;

-- 7. VERIFICAR
SELECT '✅ SUCESSO!' as resultado;
SELECT email, name FROM admin_users WHERE email = 'admin@sabores.com';
SELECT name, price FROM products LIMIT 1;