'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro apenas no lado do cliente
    if (typeof window !== 'undefined') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-pastel-vanilla min-h-screen">
        <div className="min-h-screen bg-gradient-to-br from-pastel-cream via-pastel-vanilla to-pastel-blush flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl font-bold text-red-300 mb-4">⚠️</div>
              <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">
                Algo deu errado
              </h1>
              <p className="text-primary-600">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}