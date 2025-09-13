import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const SUBSCRIPTIONS_FILE = join(process.cwd(), 'push-subscriptions.json');

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userType: 'admin' | 'customer';
  subscribedAt: string;
}

// Salvar inscrição para notificações push
export async function POST(request: NextRequest) {
  try {
    const { subscription, userType } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Dados de inscrição inválidos' },
        { status: 400 }
      );
    }

    // Carregar inscrições existentes
    let subscriptions: PushSubscriptionData[] = [];
    try {
      const data = await readFile(SUBSCRIPTIONS_FILE, 'utf-8');
      subscriptions = JSON.parse(data);
    } catch {
      // Arquivo não existe, começar com array vazio
      subscriptions = [];
    }

    // Verificar se já existe esta inscrição
    const existingIndex = subscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userType: userType || 'customer',
      subscribedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Atualizar inscrição existente
      subscriptions[existingIndex] = subscriptionData;
    } else {
      // Adicionar nova inscrição
      subscriptions.push(subscriptionData);
    }

    // Salvar arquivo
    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Inscrição salva com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar inscrição:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}