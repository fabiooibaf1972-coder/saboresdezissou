'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Info } from 'lucide-react';

const PWAInstallDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOSStandalone: (window.navigator as any).standalone === true,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasBeforeInstallPrompt: 'BeforeInstallPromptEvent' in window,
      platform: (navigator as any).platform || 'unknown',
      isOnline: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
    };
    
    setDebugInfo(info);
    console.log('PWA Debug Info:', info);
  }, []);

  const handleForceInstall = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      alert('🍰 Para instalar o Sabores de Zissou:\n\n1. Toque no botão "Compartilhar" (⬆️) na barra inferior\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"\n\n✨ Pronto! O app aparecerá na sua tela inicial!');
    } else {
      alert('🍰 Para instalar o Sabores de Zissou:\n\nNo menu do navegador (⋮), procure por:\n• "Instalar app"\n• "Adicionar à tela inicial"\n• "Instalar Sabores de Zissou"\n\n✨ Depois é só seguir as instruções!');
    }
  };

  return (
    <div className="text-center mt-3">
      {/* Botão de instalação sempre visível para teste */}
      <button 
        onClick={handleForceInstall}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 hover:border-primary-300"
      >
        <Smartphone className="w-4 h-4" />
        <span>📱 Instalar como app</span>
      </button>
      
      <div className="mt-2">
        <p className="text-xs text-primary-500">
          Acesso rápido sem navegador
        </p>
        
        {/* Botão de debug */}
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 rounded mt-1"
        >
          <Info className="w-3 h-3" />
          Debug
        </button>
      </div>
      
      {/* Info de debug */}
      {showDebug && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg text-left">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PWAInstallDebug;