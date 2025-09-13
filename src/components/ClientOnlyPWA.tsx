'use client';

import { useEffect, useState } from 'react';
import PWARegister from '@/components/PWARegister';

export default function ClientOnlyPWA() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <PWARegister />;
}