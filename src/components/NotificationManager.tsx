'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Label from '@/components/ui/Label';
import { Bell, Send, Settings, Users, Megaphone, CheckCircle, XCircle } from 'lucide-react';

interface NotificationManagerProps {
  isAdmin?: boolean;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ isAdmin = false }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Para admin: enviar notificações
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    targetAudience: 'all', // all, customers, admins
    actionUrl: '/'
  });

  useEffect(() => {
    checkPushSupport();
    checkSubscriptionStatus();
  }, []);

  const checkPushSupport = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setMessage({
        type: 'error',
        text: 'Notificações push não são suportadas neste navegador'
      });
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setIsSubscribed(true);
        setSubscription(existingSubscription);
        
        // Salvar no localStorage que está ativado
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('notifications-enabled', 'true');
        }
      } else {
        setIsSubscribed(false);
        setSubscription(null);
        
        // Limpar localStorage se não tem subscription
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('notifications-enabled');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da inscrição:', error);
      setIsSubscribed(false);
      setSubscription(null);
    }
  };

  const requestNotificationPermission = async () => {
    if (!isSupported) return false;

    try {
      // Verificar se já tem permissão
      if (Notification.permission === 'granted') {
        return true;
      }

      // Se estiver negado, não pode solicitar novamente
      if (Notification.permission === 'denied') {
        setMessage({
          type: 'error',
          text: 'Permissão para notificações foi negada. Ative nas configurações do navegador.'
        });
        return false;
      }

      // Solicitar permissão
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return true;
      } else {
        setMessage({
          type: 'error',
          text: 'Permissão para notificações negada'
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao solicitar permissão para notificações'
      });
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!isSupported || isActivating) return;

    try {
      setIsActivating(true);
      setLoading(true);
      setMessage(null);

      // Verificar se já está ativado
      if (isSubscribed) {
        setMessage({
          type: 'success',
          text: 'Notificações já estão ativadas!'
        });
        return;
      }

      // Solicitar permissão
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        return;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.ready;

      // Chave VAPID pública (chaves reais geradas)
      const vapidPublicKey = 'BMMl6l5EJCTZeOz5jIf024wRR9jopNOEJ7S7PbcpPMdbBnESVwCtZxahABM8B3Spkg5vKs87-H7TTO0NmJx77cA';

      // Inscrever-se para push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Salvar inscrição no servidor
      await savePushSubscription(pushSubscription);

      setIsSubscribed(true);
      setSubscription(pushSubscription);
      
      // Salvar no localStorage que está ativado
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('notifications-enabled', 'true');
      }
      
      setMessage({
        type: 'success',
        text: 'Notificações ativadas com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao ativar notificações. Verifique se as permissões estão habilitadas.'
      });
    } finally {
      setLoading(false);
      setIsActivating(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return;

    try {
      setLoading(true);

      // Cancelar inscrição
      await subscription.unsubscribe();
      
      // Remover do servidor
      await removePushSubscription(subscription);

      setIsSubscribed(false);
      setSubscription(null);
      
      // Remover do localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('notifications-enabled');
      }
      
      setMessage({
        type: 'success',
        text: 'Notificações desativadas'
      });

    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao desativar notificações'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePushSubscription = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          userType: isAdmin ? 'admin' : 'customer'
        })
      });
    } catch (error) {
      console.error('Erro ao salvar inscrição:', error);
    }
  };

  const removePushSubscription = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      });
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!isSubscribed) return;

    try {
      setLoading(true);

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Notificação de teste enviada!'
        });
      } else {
        throw new Error('Erro no servidor');
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao enviar notificação de teste'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      setMessage({
        type: 'error',
        text: 'Título e mensagem são obrigatórios'
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notificationForm.title,
          body: notificationForm.body,
          targetAudience: notificationForm.targetAudience,
          actionUrl: notificationForm.actionUrl,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        })
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Notificação enviada com sucesso!'
        });
        
        // Limpar formulário
        setNotificationForm({
          title: '',
          body: '',
          targetAudience: 'all',
          actionUrl: '/'
        });
      } else {
        throw new Error('Erro no servidor');
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao enviar notificação'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para converter VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">
            Notificações Não Suportadas
          </h3>
          <p className="text-gray-600 text-sm">
            Seu navegador não suporta notificações push. 
            Tente usar Chrome, Firefox ou Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Status das Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações Push</h4>
              <p className="text-sm text-gray-600">
                {isSubscribed 
                  ? 'Você receberá notificações sobre pedidos, promoções e novidades'
                  : 'Ative para receber notificações importantes'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                isSubscribed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isSubscribed ? 'Ativado' : 'Desativado'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {!isSubscribed ? (
              <Button
                onClick={subscribeToNotifications}
                disabled={loading || isActivating}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {loading || isActivating ? 'Ativando...' : 'Ativar Notificações'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={sendTestNotification}
                  disabled={loading}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Testar
                </Button>
                <Button
                  onClick={unsubscribeFromNotifications}
                  disabled={loading}
                  variant="ghost"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                  Desativar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Painel Admin - Enviar Notificações */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Enviar Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notifTitle">Título *</Label>
              <Input
                id="notifTitle"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ 
                  ...prev, 
                  title: e.target.value 
                }))}
                placeholder="Ex: Nova Promoção!"
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="notifBody">Mensagem *</Label>
              <Textarea
                id="notifBody"
                value={notificationForm.body}
                onChange={(e) => setNotificationForm(prev => ({ 
                  ...prev, 
                  body: e.target.value 
                }))}
                placeholder="Ex: Desconto de 20% em todos os bolos hoje!"
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="audience">Público-alvo</Label>
              <select
                id="audience"
                value={notificationForm.targetAudience}
                onChange={(e) => setNotificationForm(prev => ({ 
                  ...prev, 
                  targetAudience: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos os Usuários</option>
                <option value="customers">Apenas Clientes</option>
                <option value="admins">Apenas Admins</option>
              </select>
            </div>

            <div>
              <Label htmlFor="actionUrl">URL de Destino (opcional)</Label>
              <Input
                id="actionUrl"
                type="url"
                value={notificationForm.actionUrl}
                onChange={(e) => setNotificationForm(prev => ({ 
                  ...prev, 
                  actionUrl: e.target.value 
                }))}
                placeholder="/"
              />
            </div>

            <Button
              onClick={sendCustomNotification}
              disabled={loading || !notificationForm.title || !notificationForm.body}
              className="w-full flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationManager;