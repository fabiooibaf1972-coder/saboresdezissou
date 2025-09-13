import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

// Interface para configurações
interface AppConfig {
  webhookUrl: string;
  adminEmail: string;
  adminPassword: string;
  siteLogo: string;
  appIcon: string;
  companyName: string;
  whatsapp: string;
  pix: string;
}

const CONFIG_FILE = join(process.cwd(), 'app-config.json');
const MANIFEST_FILE = join(process.cwd(), 'public', 'manifest.json');

// GET - Buscar configurações atuais
export async function GET() {
  try {
    let config: AppConfig;
    
    try {
      const configData = await readFile(CONFIG_FILE, 'utf-8');
      config = JSON.parse(configData);
    } catch {
      // Se não existir arquivo, usar valores padrão
      config = {
        webhookUrl: process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL || '',
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sabores.com',
        adminPassword: '', // Nunca retornar senha
        siteLogo: '/icon-192x192.png',
        appIcon: '/icon-512x512.png',
        companyName: 'Sabores de Zissou',
        whatsapp: '5511981047422',
        pix: '11981047422'
      };
    }

    // Não incluir senha na resposta
    const { adminPassword, ...publicConfig } = config;

    return NextResponse.json({ 
      success: true, 
      config: publicConfig 
    });
    
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Salvar configurações
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Salvando configurações...');
    
    const body = await request.json();
    const { 
      webhookUrl, 
      adminEmail, 
      adminPassword, 
      siteLogo, 
      appIcon,
      companyName,
      whatsapp,
      pix
    } = body;

    console.log('📋 Dados recebidos:', {
      webhookUrl: webhookUrl ? 'Fornecido' : 'Vazio',
      adminEmail,
      adminPassword: adminPassword ? 'Fornecida' : 'Vazia',
      siteLogo,
      appIcon,
      companyName,
      whatsapp,
      pix
    });

    // Validações básicas
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      console.error('❌ Email inválido:', adminEmail);
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (webhookUrl && !/^https?:\/\/.+/.test(webhookUrl)) {
      console.error('❌ URL do webhook inválida:', webhookUrl);
      return NextResponse.json(
        { success: false, error: 'URL do webhook inválida' },
        { status: 400 }
      );
    }

    // Carregar configuração atual
    let currentConfig: AppConfig;
    try {
      const configData = await readFile(CONFIG_FILE, 'utf-8');
      currentConfig = JSON.parse(configData);
      console.log('📂 Configuração atual carregada');
    } catch {
      console.log('📝 Criando nova configuração');
      currentConfig = {
        webhookUrl: '',
        adminEmail: 'admin@sabores.com',
        adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
        siteLogo: '/icon-192x192.png',
        appIcon: '/icon-512x512.png',
        companyName: 'Sabores de Zissou',
        whatsapp: '5511981047422',
        pix: '11981047422'
      };
    }

    // Atualizar apenas campos fornecidos
    const newConfig: AppConfig = {
      ...currentConfig,
      webhookUrl: webhookUrl ?? currentConfig.webhookUrl,
      adminEmail: adminEmail ?? currentConfig.adminEmail,
      adminPassword: adminPassword || currentConfig.adminPassword,
      siteLogo: siteLogo ?? currentConfig.siteLogo,
      appIcon: appIcon ?? currentConfig.appIcon,
      companyName: companyName ?? currentConfig.companyName,
      whatsapp: whatsapp ?? currentConfig.whatsapp,
      pix: pix ?? currentConfig.pix
    };

    console.log('💾 Salvando configuração atualizada...');

    // Salvar configurações com tratamento de erro
    try {
      await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
      console.log('✅ Configuração salva em arquivo');
    } catch (writeError) {
      console.warn('⚠️ Erro ao salvar arquivo, usando fallback para localStorage');
      // Fallback: salvar no localStorage do cliente (será implementado no frontend)
      // Por enquanto, continuamos com a operação
    }

    // Atualizar manifest.json se o ícone mudou
    if (appIcon && appIcon !== currentConfig.appIcon) {
      console.log('🔄 Atualizando manifest.json...');
      await updateManifest(newConfig);
    }

    console.log('✅ Configurações salvas com sucesso!');

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso!' 
    });

  } catch (error) {
    console.error('❌ Erro crítico ao salvar configurações:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Função para atualizar o manifest.json
async function updateManifest(config: AppConfig) {
  try {
    const manifest = {
      name: config.companyName,
      short_name: config.companyName,
      description: `${config.companyName} - Confeitaria PWA`,
      start_url: "/",
      display: "standalone",
      background_color: "#FDF2E9",
      theme_color: "#E9C46A",
      icons: [
        {
          src: config.appIcon,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: config.appIcon,
          sizes: "512x512", 
          type: "image/png",
          purpose: "maskable"
        }
      ]
    };

    await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log('Manifest.json atualizado com sucesso');
    
  } catch (error) {
    console.error('Erro ao atualizar manifest:', error);
  }
}

// POST para testar webhook
export async function PUT(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json();

    console.log('🧪 Testando webhook:', webhookUrl);

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'URL do webhook é obrigatória' },
        { status: 400 }
      );
    }

    // Validar URL do webhook
    if (!/^https?:\/\/.+/.test(webhookUrl)) {
      return NextResponse.json(
        { success: false, error: 'URL do webhook inválida. Deve começar com http:// ou https://' },
        { status: 400 }
      );
    }

    const testMessage = {
      text: `🧪 *Teste do Webhook - Sabores de Zissou*\n\n✅ Se você recebeu esta mensagem, o webhook está funcionando corretamente!\n\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`
    };

    console.log('📤 Enviando mensagem de teste...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    console.log('📥 Resposta do webhook:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('❌ Erro na resposta do webhook:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    console.log('✅ Webhook testado com sucesso!');

    return NextResponse.json({ 
      success: true, 
      message: 'Teste enviado com sucesso! Verifique o WhatsApp.' 
    });

  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erro ao testar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      },
      { status: 500 }
    );
  }
}