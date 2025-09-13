import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload iniciado');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    console.log('📋 Arquivo recebido:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de arquivo inválido:', file.type);
      return NextResponse.json(
        { error: 'Arquivo deve ser uma imagem' },
        { status: 400 }
      );
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log('💾 Preparando upload:', { fileName, filePath });

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Tentar upload para Supabase primeiro
    try {
      console.log('📁 Tentando upload para Supabase...');
      
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('❌ Erro no Supabase:', error);
        throw new Error(error.message);
      }

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('✅ Upload para Supabase bem-sucedido:', publicUrlData.publicUrl);

      return NextResponse.json(
        { 
          success: true, 
          url: publicUrlData.publicUrl,
          path: filePath,
          source: 'supabase'
        },
        { status: 200 }
      );
    } catch (supabaseError) {
      console.warn('⚠️ Supabase não disponível, usando sistema de arquivos local:', supabaseError);
      
      // Fallback: salvar no sistema de arquivos local
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const fullPath = join(uploadDir, fileName);
      
      console.log('📂 Salvando em:', fullPath);
      
      // Criar diretório se não existir
      await mkdir(uploadDir, { recursive: true });
      
      // Salvar arquivo
      await writeFile(fullPath, fileBuffer);
      
      // Retornar URL relativa
      const publicUrl = `/uploads/${fileName}`;
      
      console.log('✅ Upload local bem-sucedido:', publicUrl);
      
      return NextResponse.json(
        { 
          success: true, 
          url: publicUrl,
          path: fileName,
          source: 'local'
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('❌ Erro crítico na API de upload:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Caminho do arquivo não fornecido' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar imagem' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na API de delete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}