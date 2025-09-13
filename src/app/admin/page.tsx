'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { LogIn, Settings, Package, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@sabores.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar se já está logado
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro de conexão');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Admin Sabores de Zissou
            </CardTitle>
            <p className="text-gray-600 mt-2">🍰 Confeitaria Artesanal</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sabores.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Senha</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 font-medium">Credenciais válidas:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📧 admin@sabores.com / admin123</p>
                <p>👤 admin / admin</p>
                <p>🍰 sabores / 123456</p>
              </div>
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              {loading ? '⏳ Entrando...' : '🔐 ENTRAR NO ADMIN'}
            </Button>
            
            {/* BOTÃO DE EMERGÊNCIA */}
            <Button
              onClick={() => {
                setIsAuthenticated(true);
                localStorage.setItem('admin_authenticated', 'true');
              }}
              variant="outline"
              className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-medium"
            >
              🚑 FORÇAR ENTRADA (Emergência)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PAINEL ADMIN
  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminPage;