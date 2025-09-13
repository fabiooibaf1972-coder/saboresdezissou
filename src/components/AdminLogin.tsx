'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'admin@sabores.com',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🚀 INICIANDO LOGIN:', { email: formData.email });
    console.log('📋 Dados do formulário:', formData);

    try {
      console.log('📡 Fazendo requisição para API...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📊 Status da resposta:', response.status);
      console.log('📊 Response OK:', response.ok);

      const result = await response.json();
      console.log('📊 Resultado completo da API:', result);

      if (response.ok && result.success) {
        console.log('✅ Login bem-sucedido! Redirecionando...');
        setError('');
        
        // Forçar recarga da página para atualizar o contexto
        console.log('🔄 Recarregando página...');
        window.location.href = '/admin';
      } else {
        console.log('❌ Erro no login:', result);
        setError(result.error || 'Erro desconhecido no login');
      }
    } catch (error) {
      console.error('💥 Erro na requisição:', error);
      setError(`Erro de conexão: ${(error as Error).message}`);
    }
    
    console.log('🏁 Finalizando processo de login');
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-pastel-vanilla flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
          <p className="text-gray-600">Sabores de Zissou</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@sabores.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mb-2"
              size="lg"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            
            {/* Botão de teste para debug */}
            <Button
              type="button"
              onClick={async () => {
                console.log('🧪 TESTE: Verificando API...');
                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@sabores.com', password: 'admin123' })
                  });
                  const result = await response.json();
                  console.log('🧪 TESTE - Resposta:', result);
                  alert(`Teste API: ${result.success ? 'SUCESSO' : 'FALHA'} - ${result.message || result.error}`);
                } catch (error) {
                  console.error('🧪 TESTE - Erro:', error);
                  alert(`Erro no teste: ${error}`);
                }
              }}
              variant="outline"
              className="w-full text-sm"
              size="sm"
            >
              🧪 Testar API
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;