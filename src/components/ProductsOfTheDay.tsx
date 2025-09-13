'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import OrderForm from '@/components/OrderForm';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const ProductsOfTheDay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_daily_product', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Atualizar produtos quando a aba ganha foco
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchProducts();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Polling leve a cada 30 segundos para verificar novos produtos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
          Produtos do Dia
        </h2>
        <Loading size="lg" className="py-12" />
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
          Produtos do Dia
        </h2>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Nenhum produto do dia disponível no momento.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
        Produtos do Dia
      </h2>
      
      <div className="relative max-w-4xl mx-auto">
        {/* Carrossel */}
        <div className="relative overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="w-full flex-shrink-0">
                <Card className="mx-2">
                  <div className="relative">
                    {/* Imagem principal */}
                    <div className="aspect-video bg-gradient-to-br from-pastel-cream to-pastel-blush rounded-t-xl overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback se a imagem não carregar
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                        <div className="text-center text-primary-600">
                          <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">🍰</span>
                          </div>
                          <p className="text-sm">Imagem do produto</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navegação do carrossel de imagens do produto */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {product.images.map((_, idx) => (
                          <div
                            key={idx}
                            className="w-2 h-2 rounded-full bg-white/60"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl font-semibold text-primary-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {product.description}
                    </p>
                    
                    {product.ingredients && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-primary-700 text-sm mb-2">Ingredientes:</h4>
                        <p className="text-gray-600 text-sm">{product.ingredients}</p>
                      </div>
                    )}
                    
                    {product.show_price && product.price && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => setSelectedProduct(product)}
                      className="w-full"
                      size="lg"
                    >
                      Fazer Pedido
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Controles do carrossel */}
        {products.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 z-10 hover:shadow-xl border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6 text-primary-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 z-10 hover:shadow-xl border border-gray-200"
            >
              <ChevronRight className="w-6 h-6 text-primary-600" />
            </button>
            
            {/* Indicadores */}
            <div className="flex justify-center mt-6 gap-2">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === currentSlide ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal do formulário */}
      {selectedProduct && (
        <OrderForm
          product={selectedProduct}
          type="daily"
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

export default ProductsOfTheDay;