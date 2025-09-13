-- SCRIPT PARA CONFIGURAR STORAGE NO SUPABASE
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Criar bucket para imagens de produtos (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de imagens
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- 3. Criar política para permitir leitura pública de imagens
CREATE POLICY IF NOT EXISTS "Allow public access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

-- 4. Criar política para permitir delete de imagens
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

-- 5. Criar política para permitir updates de imagens
CREATE POLICY IF NOT EXISTS "Allow authenticated updates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images');

-- 6. Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

-- 7. Verificar políticas de storage
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

SELECT 'Storage configurado com sucesso!' as result;