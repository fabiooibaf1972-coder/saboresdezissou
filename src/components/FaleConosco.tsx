'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MessageCircle, Phone, MapPin, Bell } from 'lucide-react';
import NotificationManager from '@/components/NotificationManager';
import PWAInstallManager from '@/components/PWAInstallManager';
import PWAInstallDebug from '@/components/PWAInstallDebug';

const FaleConosco: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const whatsappNumber = '5511981047422';
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre os produtos da Sabores de Zissou.');

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <section className="mb-12">
      <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
        Fale Conosco
      </h2>
      
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-pastel-cream to-pastel-blush">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary-800">
              Tem alguma dúvida?
            </CardTitle>
            <p className="text-primary-600 mt-2">
              Entre em contato conosco pelo WhatsApp!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={handleWhatsAppClick}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
                <Phone className="w-6 h-6 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-primary-700">Telefone</span>
                <span className="text-primary-600">(11) 98104-7422</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-primary-700">Localização</span>
                <span className="text-primary-600">São Paulo, SP</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-primary-600">
              <p>Horário de atendimento:</p>
              <p>Segunda a Sexta: 8h às 18h</p>
              <p>Sábado: 8h às 14h</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Botão de Notificações */}
        <div className="text-center mt-6">
          <Button 
            onClick={() => setShowNotifications(!showNotifications)}
            variant="outline"
            size="lg"
            className="bg-white/80 hover:bg-white border-primary-300 text-primary-700 hover:text-primary-800"
          >
            <Bell className="w-5 h-5 mr-2" />
            Ativar Notificações
          </Button>
          <p className="text-xs text-primary-600 mt-2">
            Receba avisos sobre novos produtos e promoções
          </p>
          
          {/* PWA Install - Sempre visível para teste */}
          <div className="text-center mt-3">
            <button 
              onClick={() => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                
                if (isIOS && isSafari) {
                  alert('🍰 Para instalar o Sabores de Zissou:\n\n1. Toque no botão "Compartilhar" (⬆️) na barra inferior\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"\n\n✨ Pronto! O app aparecerá na sua tela inicial!');
                } else {
                  alert('🍰 Para instalar o Sabores de Zissou:\n\nNo menu do navegador (⋮), procure por:\n• "Instalar app"\n• "Adicionar à tela inicial"\n• "Instalar Sabores de Zissou"\n\n✨ Depois é só seguir as instruções!');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 hover:border-primary-300"
            >
              <span>📱</span>
              <span>Instalar como app</span>
            </button>
            <p className="text-xs text-primary-500 mt-1">
              Acesso rápido sem navegador
            </p>
          </div>
        </div>
      </div>
      
      {/* Modal de Notificações */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-display text-xl font-bold text-primary-800">
                Notificações
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <NotificationManager isAdmin={false} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FaleConosco;