'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import SimpleNotificationManager from '@/components/SimpleNotificationManager';
import NotificationManager from '@/components/NotificationManager';
import { Settings, Globe, Key, Image, Save, Upload, Bell } from 'lucide-react';

interface SystemConfig {
  webhookUrl: string;
  adminEmail: string;
  adminPassword: string;
  siteLogo: string;
  appIcon: string;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    webhookUrl: '',
    adminEmail: '',
    adminPassword: '',
    siteLogo: '',
    appIcon: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const { config: serverConfig } = await response.json();
        setConfig({
          ...serverConfig,
          adminPassword: '' // Sempre vazio por segurança
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Fallback para localStorage (apenas no cliente)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const currentConfig = {
          webhookUrl: localStorage.getItem('WEBHOOK_URL') || '',
          adminEmail: localStorage.getItem('ADMIN_EMAIL') || 'admin@sabores.com',
          adminPassword: '',
          siteLogo: localStorage.getItem('SITE_LOGO') || '/icon-192x192.png',
          appIcon: localStorage.getItem('APP_ICON') || '/icon-512x512.png'
        };
        setConfig(currentConfig);
      } else {
        setConfig({
          webhookUrl: '',
          adminEmail: 'admin@sabores.com',
          adminPassword: '',
          siteLogo: '/icon-192x192.png',
          appIcon: '/icon-512x512.png'
        });
      }
    }
  };

  const handleChange = (field: keyof SystemConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field: 'siteLogo' | 'appIcon', file: File) => {
    if (!file) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro no servidor: ${response.status}`);
      }

      const { url } = await response.json();
      handleChange(field, url);
      
      setMessage({ type: 'success', text: 'Imagem enviada com sucesso!' });
    } catch (error) {
      console.error('Erro no upload:', error);
      
      // Fallback: usar URL local temporária
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          handleChange(field, dataUrl);
          setMessage({ type: 'success', text: 'Imagem carregada localmente (modo offline)' });
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao enviar imagem' });
      }
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        // Limpar senha do estado após salvar
        setConfig(prev => ({ ...prev, adminPassword: '' }));
        
        // Recarregar página se necessário para aplicar mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Erro ao salvar via API, tentando fallback localStorage:', error);
      
      // Fallback: salvar no localStorage
      try {
        if (config.webhookUrl) {
          localStorage.setItem('WEBHOOK_URL', config.webhookUrl);
        }
        if (config.adminEmail) {
          localStorage.setItem('ADMIN_EMAIL', config.adminEmail);
        }
        if (config.adminPassword) {
          localStorage.setItem('ADMIN_PASSWORD', config.adminPassword);
        }
        if (config.siteLogo) {
          localStorage.setItem('SITE_LOGO', config.siteLogo);
        }
        if (config.appIcon) {
          localStorage.setItem('APP_ICON', config.appIcon);
        }
        
        setMessage({ type: 'success', text: 'Configurações salvas localmente (modo offline)' });
        
        // Limpar senha do estado após salvar
        setConfig(prev => ({ ...prev, adminPassword: '' }));
        
        // Recarregar página para aplicar mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (localError) {
        console.error('Erro no fallback localStorage:', localError);
        setMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };



  const testWebhook = async () => {
    if (!config.webhookUrl) {
      setMessage({ type: 'error', text: 'Informe a URL do webhook primeiro' });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhookUrl: config.webhookUrl })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao testar webhook' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary-600" />
        <h2 className="font-display text-2xl font-bold text-primary-800">
          Configurações do Sistema
        </h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configuração do WhatsApp Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhook">URL do Webhook *</Label>
            <Input
              id="webhook"
              value={config.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://api.whatsapp.com/webhook/..."
              type="url"
            />
            <p className="text-sm text-gray-600 mt-1">
              Configure seu webhook do WhatsApp Business para receber os pedidos automaticamente
            </p>
          </div>
          
          <Button 
            onClick={testWebhook}
            disabled={loading || !config.webhookUrl}
            variant="secondary"
          >
            🧪 Testar Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Admin Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Credenciais do Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminEmail">Email do Admin</Label>
            <Input
              id="adminEmail"
              value={config.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              type="email"
              placeholder="admin@sabores.com"
            />
          </div>
          
          <div>
            <Label htmlFor="adminPassword">Nova Senha do Admin</Label>
            <Input
              id="adminPassword"
              value={config.adminPassword}
              onChange={(e) => handleChange('adminPassword', e.target.value)}
              type="password"
              placeholder="Digite uma nova senha (deixe vazio para manter atual)"
            />
            <p className="text-sm text-gray-600 mt-1">
              Deixe vazio para manter a senha atual
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo and Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo e Ícones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo do Site */}
          <div>
            <Label>Logo do Site</Label>
            <div className="flex items-center gap-4 mt-2">
              {config.siteLogo && (
                <img 
                  src={config.siteLogo} 
                  alt="Logo atual" 
                  className="w-16 h-16 object-contain bg-gray-100 rounded-lg p-2"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('siteLogo', file);
                  }}
                  className="hidden"
                  id="siteLogo"
                />
                <label
                  htmlFor="siteLogo"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Alterar Logo
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Recomendado: PNG transparente, 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Ícone do App */}
          <div>
            <Label>Ícone do App PWA</Label>
            <div className="flex items-center gap-4 mt-2">
              {config.appIcon && (
                <img 
                  src={config.appIcon} 
                  alt="Ícone atual" 
                  className="w-16 h-16 object-contain bg-gray-100 rounded-lg p-2"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('appIcon', file);
                  }}
                  className="hidden"
                  id="appIcon"
                />
                <label
                  htmlFor="appIcon"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Alterar Ícone PWA
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Recomendado: PNG, 512x512px, bordas arredondadas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveConfig}
          disabled={loading}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Gerenciador de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações e Promoções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationManager isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;