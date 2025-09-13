-- ========================================
-- CRIAÇÃO DAS TABELAS - SABORES DE ZISSOU
-- ========================================

-- 1. TABELA PRODUCTS
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    price DECIMAL(10,2),
    show_price BOOLEAN DEFAULT false,
    images TEXT[] DEFAULT '{}',
    is_daily_product BOOLEAN DEFAULT false,
    is_custom_product BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA ORDERS
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_whatsapp VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2),
    delivery_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA NOTIFICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255), -- Pode ser email ou ID do usuário
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'admin')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(500) DEFAULT '/',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA PUSH_SUBSCRIPTIONS
-- ========================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255),
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'admin')),
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA SYSTEM_CONFIG
-- ========================================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERIR DADOS INICIAIS
-- ========================================

-- Configurações padrão do sistema
INSERT INTO system_config (key, value) VALUES
('webhook_url', ''),
('admin_email', 'admin@sabores.com'),
('company_name', 'Sabores de Zissou'),
('whatsapp_number', '5511981047422'),
('pix_key', '11981047422'),
('site_logo', '/icon-192x192.png'),
('app_icon', '/icon-512x512.png')
ON CONFLICT (key) DO NOTHING;

-- Produtos de exemplo
INSERT INTO products (name, description, ingredients, price, show_price, is_daily_product, is_custom_product) VALUES
('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura cremosa', 'Farinha, açúcar, chocolate, ovos, manteiga', 45.00, true, true, false),
('Torta de Morango', 'Torta cremosa com morangos frescos', 'Biscoito, creme, morangos, gelatina', 35.00, true, false, true),
('Cupcakes Variados', 'Cupcakes com sabores variados e decoração especial', 'Farinha, açúcar, ovos, corantes naturais', 8.00, true, false, true)
ON CONFLICT DO NOTHING;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_products_daily ON products(is_daily_product) WHERE is_daily_product = true;
CREATE INDEX IF NOT EXISTS idx_products_custom ON products(is_custom_product) WHERE is_custom_product = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- 8. FUNÇÃO PARA ATUALIZAR updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. CRIAR BUCKET PARA IMAGENS
-- ========================================
-- Nota: Execute este comando no Storage do Supabase, não no SQL Editor
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- ========================================
-- INSTRUÇÕES DE USO
-- ========================================

/*
1. Execute este script no SQL Editor do Supabase
2. Depois execute o arquivo SUPABASE-POLICIES.sql
3. No Storage do Supabase, crie um bucket chamado 'product-images' e marque como público
4. Teste criando um produto no admin

ESTRUTURA CRIADA:
- products: Produtos da confeitaria
- orders: Pedidos dos clientes  
- notifications: Notificações do sistema
- push_subscriptions: Inscrições para push notifications
- system_config: Configurações do sistema

DADOS INICIAIS:
- 3 produtos de exemplo
- Configurações padrão do sistema
- Índices para performance
- Triggers para updated_at automático
*/
