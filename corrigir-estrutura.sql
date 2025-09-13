-- 🔧 SCRIPT DE CORREÇÃO - Execute este PRIMEIRO se deu erro

-- 1. Verificar tabelas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar colunas da tabela products (se existir)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 3. Corrigir tabela products se necessário
DO $$
BEGIN
    -- Se a tabela products existe mas não tem a coluna category
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        
        -- Adicionar coluna category se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'products' AND column_name = 'category') THEN
            ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'geral';
            RAISE NOTICE 'Coluna category adicionada à tabela products';
        END IF;
        
        -- Adicionar coluna is_available se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'products' AND column_name = 'is_available') THEN
            ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_available adicionada à tabela products';
        END IF;
        
    ELSE
        -- Se a tabela não existe, criar ela completa
        CREATE TABLE products (
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
        
        -- Habilitar RLS
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas
        CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);
        CREATE POLICY "allow_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
        
        RAISE NOTICE 'Tabela products criada com sucesso';
    END IF;
END
$$;

-- 4. Verificar se admin_users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        CREATE TABLE admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL DEFAULT 'Administrador',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "allow_all_admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
        
        RAISE NOTICE 'Tabela admin_users criada';
    END IF;
END
$$;

-- 5. Inserir admin padrão
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@sabores.com', 'admin123', 'Administrador Sabores de Zissou')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'admin123',
  name = 'Administrador Sabores de Zissou';

-- 6. Verificação final
SELECT '✅ CORREÇÃO CONCLUÍDA!' as status;
SELECT 'Tabelas criadas:' as info, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('products', 'admin_users', 'orders', 'system_config');

-- 7. Mostrar estrutura da tabela products
SELECT 'Estrutura da tabela products:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;