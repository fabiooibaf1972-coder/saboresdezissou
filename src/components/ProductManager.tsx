'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Label from '@/components/ui/Label';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, Edit, Trash2, Package, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

interface ProductManagerProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  loading: boolean;
}

const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  onProductsChange, 
  loading 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    price: '',
    show_price: false,
    images: [] as string[],
    is_daily_product: false,
    is_custom_product: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ingredients: '',
      price: '',
      show_price: false,
      images: [],
      is_daily_product: false,
      is_custom_product: false,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    console.log('🔧 Iniciando edição do produto:', product.id, product.name);
    
    setFormData({
      name: product.name,
      description: product.description || '',
      ingredients: product.ingredients || '',
      price: product.price?.toString() || '',
      show_price: product.show_price || false,
      images: product.images || [],
      is_daily_product: product.is_daily_product,
      is_custom_product: product.is_custom_product,
    });
    setEditingProduct(product);
    setShowForm(true);
    
    console.log('📋 Dados carregados no formulário:', {
      id: product.id,
      name: product.name,
      is_daily: product.is_daily_product,
      is_custom: product.is_custom_product
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        price: formData.price ? parseFloat(formData.price) : null,
        show_price: formData.show_price,
        images: formData.images,
        is_daily_product: formData.is_daily_product,
        is_custom_product: formData.is_custom_product,
      };

      console.log('📦 Dados para salvar:', productData);

      if (editingProduct) {
        console.log('🔄 Atualizando produto:', editingProduct.id);
        // Atualizar produto existente
        try {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id);

          if (error) {
            console.error('❌ Erro no Supabase:', error);
            throw new Error('Erro ao atualizar produto: ' + error.message);
          }
          console.log('✅ Produto atualizado no Supabase');
        } catch (supabaseError) {
          console.warn('⚠️ Supabase não disponível, usando localStorage:', supabaseError);
          // Fallback para localStorage
          const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
          const updatedStoredProducts = storedProducts.map((p: any) => 
            p.id === editingProduct.id 
              ? { 
                  ...p, 
                  ...productData,
                  updated_at: new Date().toISOString()
                }
              : p
          );
          localStorage.setItem('products', JSON.stringify(updatedStoredProducts));
          console.log('✅ Produto atualizado no localStorage');
        }

        // Atualizar localmente
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                ...productData,
                updated_at: new Date().toISOString()
              }
            : p
        );
        onProductsChange(updatedProducts);
        console.log('✅ Lista de produtos atualizada localmente');
      } else {
        console.log('🆕 Criando novo produto');
        // Criar novo produto
        const newProduct = {
          id: Date.now().toString(),
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

          if (error) {
            throw new Error('Erro ao criar produto: ' + error.message);
          }

          onProductsChange([data, ...products]);
          console.log('✅ Novo produto criado no Supabase:', data.id);
        } catch (supabaseError) {
          console.warn('⚠️ Supabase não disponível, usando localStorage:', supabaseError);
          // Fallback para localStorage
          const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
          const updatedStoredProducts = [newProduct, ...storedProducts];
          localStorage.setItem('products', JSON.stringify(updatedStoredProducts));
          onProductsChange([newProduct, ...products]);
          console.log('✅ Novo produto criado no localStorage:', newProduct.id);
        }
      }

      const successMessage = editingProduct 
        ? `✅ Produto "${formData.name}" atualizado com sucesso!\n\n📝 Alterações aplicadas:\n• Nome: ${formData.name}\n• Produto do dia: ${formData.is_daily_product ? 'Sim' : 'Não'}\n• Sob encomenda: ${formData.is_custom_product ? 'Sim' : 'Não'}` 
        : `✅ Produto "${formData.name}" criado com sucesso!\n\n💡 Dica: Se você marcou como "Produto do Dia", ele aparecerá na página principal em alguns segundos ou quando você trocar de aba.`;
      
      alert(successMessage);
      resetForm();
    } catch (error) {
      console.error('❌ Erro completo ao salvar produto:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      const errorMessage = error instanceof Error 
        ? `❌ Erro ao salvar produto:\n\n${error.message}\n\n🔧 Verifique a conexão e tente novamente.`
        : '❌ Erro desconhecido ao salvar produto';
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      // Deletar no Supabase
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) {
          throw new Error('Erro ao excluir produto: ' + error.message);
        }
      } catch (supabaseError) {
        console.warn('Supabase não disponível, usando localStorage:', supabaseError);
        // Fallback para localStorage
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedStoredProducts = storedProducts.filter((p: any) => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(updatedStoredProducts));
      }

      // Remover localmente
      const updatedProducts = products.filter(p => p.id !== productId);
      onProductsChange(updatedProducts);
      
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir produto');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold text-primary-800">
          Gerenciar Produtos
        </h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome do produto"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredientes</Label>
                <Textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Liste os ingredientes do produto"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="show_price"
                      checked={formData.show_price}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Exibir preço</span>
                  </label>
                </div>
              </div>

              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={3}
                disabled={submitting}
              />

              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_daily_product"
                    checked={formData.is_daily_product}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Produto do Dia</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_custom_product"
                    checked={formData.is_custom_product}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Produto Sob Encomenda</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum produto cadastrado</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Produto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-lg font-semibold text-primary-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {product.description || 'Sem descrição'}
                </p>
                
                {product.ingredients && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                    <strong>Ingredientes:</strong> {product.ingredients}
                  </p>
                )}
                
                {product.show_price && product.price && (
                  <div className="text-primary-600 font-semibold mb-3">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {product.is_daily_product && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      Produto do Dia
                    </span>
                  )}
                  {product.is_custom_product && (
                    <span className="px-2 py-1 bg-pastel-mint text-primary-700 text-xs rounded-full">
                      Sob Encomenda
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Criado: {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManager;