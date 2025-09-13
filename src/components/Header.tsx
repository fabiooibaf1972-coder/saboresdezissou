'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bell, Download } from 'lucide-react';
import NotificationManager from '@/components/NotificationManager';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canShowInstall, setCanShowInstall] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode || isIOSStandalone);
    };

    checkStandalone();

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured');
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setCanShowInstall(true);
    };

    // Detectar para iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // Para iOS Safari, sempre permitir instalação se não estiver instalado
    if (isIOS && isSafari && !isStandalone) {
      setCanShowInstall(true);
    }
    
    // Para outros navegadores compatíveis
    if (!isIOS && 'serviceWorker' in navigator) {
      // Mostrar botão após 2 segundos se não receber o evento
      const fallbackTimer = setTimeout(() => {
        if (!deferredPrompt && !isStandalone) {
          const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
          const isEdge = /Edge/.test(navigator.userAgent);
          const isFirefox = /Firefox/.test(navigator.userAgent);
          
          if (isChrome || isEdge || isFirefox) {
            setCanShowInstall(true);
          }
        }
      }, 2000);
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('App instalado com sucesso!');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setCanShowInstall(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone, deferredPrompt]);

  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (deferredPrompt) {
      // Para Chrome/Edge - Instalação direta
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('App instalado com sucesso!');
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error('Erro na instalação:', error);
      }
    } else if (isIOS && isSafari) {
      // Para iOS Safari - Mostrar instruções
      alert('📱 Para instalar o app:\n\n1. Toque no botão "Compartilhar" (ícone de seta para cima)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"\n\n🎉 Pronto! O app aparecerá na sua tela inicial!');
    } else {
      // Para outros navegadores - Recarregar para tentar capturar o evento
      window.location.reload();
    }
  };

  return (
    <header className="bg-gradient-to-r from-pastel-cream via-pastel-vanilla to-pastel-blush shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* Logo e Nome */}
        <div className="text-center mb-4">
          <div className="flex justify-center items-center mb-2 relative">
            {/* Botão de Notificações */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="absolute left-0 p-2 text-primary-600 hover:text-primary-700 hover:bg-white/50 rounded-full transition-colors"
              title="Gerenciar Notificações"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Botão de Instalação PWA */}
            {canShowInstall && !isStandalone && (
              <button
                onClick={handleInstallClick}
                className="absolute right-0 p-2 text-primary-600 hover:text-primary-700 hover:bg-white/50 rounded-full transition-colors"
                title="Instalar App na Tela Inicial"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            
            <div className="relative">
              {/* Logo SVG temporário */}
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pastel-peach rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pastel-mint rounded-full"></div>
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-800 mb-1">
            Sabores de Zissou
          </h1>
          <p className="text-primary-600 text-lg font-medium">
            Confeitaria e Panificadora Artesanal
          </p>
          <p className="text-primary-500 text-sm mt-1">
            Doces feitos com amor e ingredientes selecionados
          </p>
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
    </header>
  );
};

export default Header;