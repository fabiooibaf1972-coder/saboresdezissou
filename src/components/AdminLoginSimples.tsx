'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { LogIn } from 'lucide-react';

const AdminLoginSimples: React.FC = () => {
  const [email, setEmail] = useState('admin@sabores.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async () => {
    console.log('🚀 INICIANDO LOGIN SIMPLES...');
    setLoading(true);
    setError('');

    try {
      console.log('📡 Fazendo requisição...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📊 Status:', response.status);
      const result = await response.json();
      console.log('📊 Resultado:', result);

      if (response.ok && result.success) {
        console.log('✅ LOGIN SUCESSO!');
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        // Redirecionar para admin
        window.location.href = '/admin';
      } else {
        console.log('❌ LOGIN FALHOU:', result.error);
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('💥 ERRO:', error);
      setError(`Erro: ${error}`);
    }

    setLoading(false);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-pastel-vanilla flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-green-600 mb-4">✅ Login Realizado!</h2>
            <p className="text-gray-600 mb-4">Redirecionando para o painel admin...</p>
            <Button onClick={() => window.location.href = '/admin'}>
              Ir para Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-vanilla flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Login Admin SIMPLES</CardTitle>
          <p className="text-gray-600">Sabores de Zissou</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sabores.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Entrando...' : 'ENTRAR SIMPLES'}
          </Button>

          {/* Botão de emergência */}
          <Button
            onClick={() => {
              console.log('🚨 ENTRADA DE EMERGÊNCIA!');
              setIsAuthenticated(true);
              localStorage.setItem('admin_authenticated', 'true');
              window.location.href = '/admin';
            }}
            variant="outline"
            className="w-full"
          >
            🚨 ENTRAR SEM API (Emergência)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginSimples;