'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthProvider: Verificando autenticação salva...');
    
    // Verificar se existe uma sessão salva (apenas no cliente)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedAuth = localStorage.getItem('admin_authenticated');
      console.log('💾 localStorage admin_authenticated:', savedAuth);
      
      if (savedAuth === 'true') {
        console.log('✅ Usuário já autenticado pelo localStorage');
        setIsAuthenticated(true);
      } else {
        console.log('❌ Nenhuma autenticação salva encontrada');
      }
    }
    
    console.log('🏁 AuthProvider: Carregamento inicial concluído');
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔑 AuthContext.login chamado com:', { email });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log('📊 AuthContext: Resposta da API:', result);

      if (response.ok && result.success) {
        console.log('✅ AuthContext: Login bem-sucedido, atualizando estado...');
        setIsAuthenticated(true);
        
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true');
          console.log('💾 localStorage atualizado para true');
        }
        
        return true;
      }
      
      console.log('❌ AuthContext: Login falhou');
      return false;
    } catch (error) {
      console.error('💥 Erro no AuthContext.login:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Fazendo logout...');
    setIsAuthenticated(false);
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
      console.log('💾 localStorage limpo');
    }
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
  };

  console.log('🗺 AuthContext: Estado atual:', { isAuthenticated, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};