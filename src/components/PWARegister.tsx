'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode || isIOSStandalone);
    };

    checkStandalone();

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      // Mostrar prompt imediatamente se PWA pode ser instalado
      // Desabilitado para usar versão discreta no footer
      // setTimeout(() => {
      //   if (!isStandalone) {
      //     setShowInstallPrompt(true);
      //   }
      // }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('PWA foi instalado');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso!');
      } else {
        console.log('Instalação cancelada pelo usuário');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erro na instalação do PWA:', error);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Mostrar novamente em 24 horas (apenas no cliente)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  // Não mostrar se já estiver instalado
  if (isStandalone) {
    return null;
  }

  // Verificar se foi dispensado recentemente (apenas no cliente)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (timeDiff < oneDayInMs) {
        return null;
      }
    }
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-primary-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🍰</span>
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 text-sm">
                Instalar Sabores de Zissou
              </h3>
              <p className="text-xs text-gray-600">
                Adicione o app à sua tela inicial
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 text-sm py-2"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="text-sm py-2 px-3"
            size="sm"
          >
            Agora não
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Acesso rápido sem navegador • Notificações push
        </p>
      </div>
    </div>
  );
}