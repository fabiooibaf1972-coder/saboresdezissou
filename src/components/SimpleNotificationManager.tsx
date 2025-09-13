'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SimpleNotificationManagerProps {
  isAdmin?: boolean;
}

const SimpleNotificationManager: React.FC<SimpleNotificationManagerProps> = ({ isAdmin = false }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    checkSupport();
    checkPermission();
  }, []);

  const checkSupport = () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setMessage({
        type: 'error',
        text: 'Seu navegador não suporta notificações. Use Chrome, Firefox ou Safari.'
      });
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Verificar se já está ativado
      if (Notification.permission === 'granted') {
        setIsSubscribed(true);
      }
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      setLoading(true);
      setMessage(null);

      // Solicitar permissão
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setIsSubscribed(true);
        setMessage({
          type: 'success',
          text: '✅ Notificações ativadas com sucesso! Você receberá avisos sobre pedidos e promoções.'
        });

        // Enviar notificação de teste
        setTimeout(() => {
          new Notification('🍰 Sabores de Zissou', {
            body: 'Notificações ativadas! Você receberá avisos sobre pedidos e promoções.',
            icon: '/icon-192x192.png',
            tag: 'test-notification'
          });
        }, 1000);

      } else if (result === 'denied') {
        setMessage({
          type: 'error',
          text: '❌ Permissão negada. Ative as notificações nas configurações do navegador.'
        });
      } else {
        setMessage({
          type: 'info',
          text: 'ℹ️ Permissão cancelada. Você pode ativar depois nas configurações.'
        });
      }

    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao ativar notificações. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('🧪 Teste - Sabores de Zissou', {
        body: 'Esta é uma notificação de teste! Se você viu isso, as notificações estão funcionando perfeitamente.',
        icon: '/icon-192x192.png',
        tag: 'test-notification'
      });
      
      setMessage({
        type: 'success',
        text: '✅ Notificação de teste enviada!'
      });
    }
  };

  const getStatusIcon = () => {
    if (!isSupported) return <XCircle className="w-5 h-5 text-red-500" />;
    if (permission === 'granted') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (permission === 'denied') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!isSupported) return 'Não Suportado';
    if (permission === 'granted') return 'Ativado';
    if (permission === 'denied') return 'Negado';
    return 'Pendente';
  };

  const getStatusColor = () => {
    if (!isSupported) return 'text-red-600';
    if (permission === 'granted') return 'text-green-600';
    if (permission === 'denied') return 'text-red-600';
    return 'text-yellow-600';
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
            Seu navegador não suporta notificações. 
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
            : message.type === 'error'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
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
              <h4 className="font-medium">Notificações do Navegador</h4>
              <p className="text-sm text-gray-600">
                {permission === 'granted' 
                  ? 'Você receberá notificações sobre pedidos, promoções e novidades'
                  : 'Ative para receber notificações importantes'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {permission !== 'granted' ? (
              <Button
                onClick={requestPermission}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {loading ? 'Ativando...' : 'Ativar Notificações'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={sendTestNotification}
                  disabled={loading}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Testar Notificação
                </Button>
                <div className="text-sm text-gray-600 flex items-center">
                  ✅ Notificações ativadas
                </div>
              </>
            )}
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Permissão negada:</strong> Para ativar as notificações, 
                clique no ícone de notificações na barra de endereços do navegador 
                e permita as notificações para este site.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleNotificationManager;
