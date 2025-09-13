'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DynamicLogoProps {
  className?: string;
  size?: number;
  fallback?: string;
}

const DynamicLogo: React.FC<DynamicLogoProps> = ({ 
  className = "", 
  size = 32,
  fallback = "🍰"
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Carregar logo das configurações
    const loadLogo = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const { config } = await response.json();
          setLogoUrl(config.siteLogo);
        }
      } catch {
        // Fallback para localStorage ou padrão (apenas no cliente)
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const savedLogo = localStorage.getItem('SITE_LOGO');
          setLogoUrl(savedLogo || '/icon-192x192.png');
        } else {
          setLogoUrl('/icon-192x192.png');
        }
      }
    };

    loadLogo();
  }, []);

  if (!logoUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-primary-500 text-white rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.6 }}>{fallback}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt="Logo"
        fill
        className="object-contain"
        onError={() => setLogoUrl(null)}
      />
    </div>
  );
};

export default DynamicLogo;