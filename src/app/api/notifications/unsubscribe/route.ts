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

// Remover inscrição de notificações push
export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

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
      // Arquivo não existe
      return NextResponse.json({
        success: true,
        message: 'Inscrição não encontrada'
      });
    }

    // Remover inscrição
    const filteredSubscriptions = subscriptions.filter(
      sub => sub.endpoint !== subscription.endpoint
    );

    // Salvar arquivo atualizado
    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(filteredSubscriptions, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Inscrição removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}