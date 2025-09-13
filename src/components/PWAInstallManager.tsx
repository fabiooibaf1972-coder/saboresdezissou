'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Download, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallManagerProps {
  variant?: 'default' | 'discreet';
  className?: string;
}

const PWAInstallManager: React.FC<PWAInstallManagerProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isIOSStandalone;
      setIsStandalone(isInstalled);
      
      // Debug log
      console.log('PWA Status:', {
        isStandaloneMode,
        isIOSStandalone,
        isInstalled,
        userAgent: navigator.userAgent
      });
    };

    checkStandalone();

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured');
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    // Detectar para iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    console.log('Device Detection:', { isIOS, isSafari });
    
    // Para iOS Safari, sempre permitir instalação se não estiver instalado
    if (isIOS && isSafari && !isStandalone) {
      console.log('iOS Safari detected - enabling install option');
      setCanInstall(true);
    }
    
    // Para outros navegadores, verificar se suporta PWA
    if (!isIOS && 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      console.log('PWA support detected - waiting for beforeinstallprompt');
    }
    
    // Fallback: se não receber o evento em 3 segundos, mostrar para browsers compatíveis
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone && !isIOS) {
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        if (isChrome || isEdge || isFirefox) {
          console.log('Fallback: Enabling install for compatible browser');
          setCanInstall(true);
        }
      }
    }, 3000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setCanInstall(false);
      clearTimeout(fallbackTimer);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, [isStandalone, deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Edge - Instalação automática direta
      console.log('Iniciando instalação automática...');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('Resultado da instalação:', outcome);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setCanInstall(false);
        }
      } catch (error) {
        console.error('Erro na instalação:', error);
      }
    } else {
      // Para navegadores que não suportam beforeinstallprompt
      // Tentar instalar via manifest
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.ready;
          // Forçar instalação via manifest
          window.location.href = '/manifest.json';
        } catch (error) {
          console.error('Erro ao tentar instalar via manifest:', error);
        }
      }
    }
  };

  // Variante discreta
  if (variant === 'discreet') {
    console.log('Discreet variant - isStandalone:', isStandalone, 'canInstall:', canInstall);
    
    // Se já está instalado, não mostrar nada para ser mais discreto
    if (isStandalone) {
      return null;
    }

    // Se pode instalar, mostrar botão discreto mas visível
    if (canInstall) {
      return (
        <div className={`text-center ${className}`}>
          <button 
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 hover:border-primary-300"
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Instalar como app</span>
          </button>
          <p className="text-xs text-primary-500 mt-1">
            Acesso rápido sem navegador
          </p>
        </div>
      );
    }

    // Se não pode instalar, mostrar mensagem de debug em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`text-center ${className}`}>
          <p className="text-xs text-gray-400">
            PWA não disponível neste navegador
          </p>
        </div>
      );
    }

    return null;
  }

  // Variante padrão (original)
  // Se já está instalado, mostrar status
  if (isStandalone) {
    return (
      <div className={`text-center mb-4 ${className}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">App Instalado</span>
        </div>
      </div>
    );
  }

  // Se pode instalar, mostrar botão
  if (canInstall) {
    return (
      <div className={`text-center mb-4 ${className}`}>
        <Button 
          onClick={handleInstallClick}
          variant="outline"
          size="lg"
          className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800"
        >
          <Download className="w-5 h-5 mr-2" />
          Instalar App
        </Button>
        <p className="text-xs text-blue-600 mt-2">
          Acesso rápido e notificações offline
        </p>
      </div>
    );
  }

  return null;
};

export default PWAInstallManager;