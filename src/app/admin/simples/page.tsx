'use client';

import React, { useState, useEffect } from 'react';
import AdminLoginSimples from '@/components/AdminLoginSimples';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const AdminPageSimples: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Verificando autenticação...');
    const savedAuth = localStorage.getItem('admin_authenticated');
    console.log('💾 localStorage:', savedAuth);
    
    if (savedAuth === 'true') {
      console.log('✅ Usuário autenticado!');
      setIsAuthenticated(true);
    } else {
      console.log('❌ Usuário não autenticado');
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-vanilla flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginSimples />;
  }

  return (
    <div className="min-h-screen bg-pastel-vanilla p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary-800">
              🎉 PAINEL ADMIN - SABORES DE ZISSOU
            </CardTitle>
            <p className="text-gray-600">Login funcionando perfeitamente!</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-2">🛍️ Produtos</h3>
                  <p className="text-gray-600 mb-4">Gerenciar produtos da confeitaria</p>
                  <Button className="w-full">Gerenciar Produtos</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-2">📋 Pedidos</h3>
                  <p className="text-gray-600 mb-4">Visualizar e gerenciar pedidos</p>
                  <Button className="w-full">Ver Pedidos</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-2">🔔 Notificações</h3>
                  <p className="text-gray-600 mb-4">Configurar notificações push</p>
                  <Button className="w-full">Configurar</Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <Button onClick={handleLogout} variant="outline">
                🚪 Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPageSimples;