'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Label from '@/components/ui/Label';
import { X, MessageCircle } from 'lucide-react';
import type { Product, OrderFormData } from '@/types';

interface OrderFormProps {
  product: Product;
  type: 'daily' | 'custom';
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ product, type, onClose }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_address: '',
    customer_whatsapp: '',
    delivery_date: type === 'custom' ? '' : undefined,
    payment_method: 'pix'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        product_price: product.show_price ? product.price : undefined,
        ...formData
      };

      console.log('📦 Enviando pedido:', {
        cliente: orderData.customer_name,
        produto: orderData.product_name,
        whatsapp: orderData.customer_whatsapp
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar pedido');
      }

      console.log('✅ Pedido enviado com sucesso:', result);
      
      setSubmitStatus({
        type: 'success',
        message: result.message || 'Pedido enviado com sucesso! Entraremos em contato em breve via WhatsApp.'
      });
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar pedido:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar pedido. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Formatar telefone automaticamente
    if (name === 'customer_whatsapp') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Fazer Pedido</CardTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>
        
        <CardContent>
          {/* Status do envio */}
          {submitStatus && (
            <div className={`mb-4 p-3 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : submitStatus.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              <p className="text-sm font-medium">
                {submitStatus.type === 'success' && '✅ '}
                {submitStatus.type === 'error' && '❌ '}
                {submitStatus.type === 'info' && '📝 '}
                {submitStatus.message}
              </p>
              {submitStatus.type === 'success' && (
                <p className="text-xs mt-1">
                  Esta janela fechará automaticamente em alguns segundos...
                </p>
              )}
            </div>
          )}

          {/* Informações do produto */}
          <div className="mb-6 p-4 bg-pastel-cream rounded-lg">
            <h3 className="font-display font-semibold text-primary-800 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">
              {product.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Nome Completo *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="customer_address">Endereço de Entrega *</Label>
              <Textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade..."
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="customer_whatsapp">WhatsApp *</Label>
              <Input
                id="customer_whatsapp"
                name="customer_whatsapp"
                value={formData.customer_whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            {type === 'custom' && (
              <div>
                <Label htmlFor="delivery_date">Data para Entrega</Label>
                <Input
                  id="delivery_date"
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date || ''}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div>
              <Label htmlFor="payment_method">Método de Pagamento *</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="pix"
                    checked={formData.payment_method === 'pix'}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">PIX - Chave: 11981047422</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Cartão - Levaremos a máquina</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações (opcional)</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations || ''}
                onChange={handleChange}
                placeholder="Alguma observação especial sobre o pedido? Ex: sem açúcar, cor específica, etc."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use este campo para especificar detalhes especiais do seu pedido
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  'Enviando...'
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Pedido
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderForm;