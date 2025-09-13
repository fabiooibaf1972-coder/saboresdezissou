import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import webpush from 'web-push';

const SUBSCRIPTIONS_FILE = join(process.cwd(), 'push-subscriptions.json');

// Configuração VAPID 
const VAPID_KEYS = {
  publicKey: 'BMMl6l5EJCTZeOz5jIf024wRR9jopNOEJ7S7PbcpPMdbBnESVwCtZxahABM8B3Spkg5vKs87-H7TTO0NmJx77cA',
  privateKey: 'Ss6ERRkPzGDVnohGI8fnEu8HzIg__VDq4ui-YjIfwoc'
};

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

// Enviar notificação customizada
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      body, 
      targetAudience, 
      actionUrl, 
      icon, 
      badge 
    } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, error: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

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

    // Filtrar público-alvo
    let targetSubscriptions = subscriptions;
    if (targetAudience === 'customers') {
      targetSubscriptions = subscriptions.filter(sub => sub.userType === 'customer');
    } else if (targetAudience === 'admins') {
      targetSubscriptions = subscriptions.filter(sub => sub.userType === 'admin');
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma inscrição encontrada para o público-alvo' },
        { status: 404 }
      );
    }

    const notificationPayload = {
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      tag: `custom-${Date.now()}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '👀 Ver Detalhes'
        },
        {
          action: 'dismiss',
          title: '✅ OK'
        }
      ],
      data: {
        url: actionUrl || '/',
        timestamp: new Date().toISOString(),
        targetAudience
      }
    };

    const promises = targetSubscriptions.map(async (sub) => {
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

    // Log da notificação enviada
    console.log(`📤 Notificação enviada: "${title}" para ${targetAudience} (${successful}/${results.length})`);

    return NextResponse.json({
      success: true,
      message: `Notificação enviada! Enviadas: ${successful}, Falharam: ${failed}`,
      details: {
        total: results.length,
        successful,
        failed,
        targetAudience
      }
    });

  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}