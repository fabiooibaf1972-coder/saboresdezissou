import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import webpush from 'web-push';

const SUBSCRIPTIONS_FILE = join(process.cwd(), 'push-subscriptions.json');

// Configuração VAPID (chaves reais geradas)
const VAPID_KEYS = {
  publicKey: 'BMMl6l5EJCTZeOz5jIf024wRR9jopNOEJ7S7PbcpPMdbBnESVwCtZxahABM8B3Spkg5vKs87-H7TTO0NmJx77cA',
  privateKey: 'Ss6ERRkPzGDVnohGI8fnEu8HzIg__VDq4ui-YjIfwoc'
};

// Configurar web-push
webpush.setVapidDetails(
  'mailto:admin@sabores.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userType: 'admin' | 'customer';
  subscribedAt: string;
}

// Enviar notificação de teste
export async function POST(request: NextRequest) {
  try {
    // Carregar inscrições
    let subscriptions: PushSubscriptionData[] = [];
    try {
      const data = await readFile(SUBSCRIPTIONS_FILE, 'utf-8');
      subscriptions = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Nenhuma inscrição encontrada' },
        { status: 404 }
      );
    }

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma inscrição ativa' },
        { status: 404 }
      );
    }

    const notificationPayload = {
      title: '🧪 Teste - Sabores de Zissou',
      body: 'Esta é uma notificação de teste! Se você recebeu isso, as notificações estão funcionando perfeitamente. 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '👀 Ver Site'
        },
        {
          action: 'dismiss',
          title: '✅ OK'
        }
      ],
      data: {
        url: '/',
        timestamp: new Date().toISOString()
      }
    };

    const promises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload)
        );

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(`Erro ao enviar para ${sub.endpoint}:`, error);
        return { success: false, endpoint: sub.endpoint, error };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Notificação de teste enviada! Enviadas: ${successful}, Falharam: ${failed}`,
      details: {
        total: results.length,
        successful,
        failed
      }
    });

  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}