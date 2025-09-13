'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import Link from 'next/link';

const CustomProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_custom_product', true)
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

  if (loading) {
    return (
      <section>
        <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
          Produtos Sob Encomenda
        </h2>
        <Loading size="lg" className="py-12" />
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section>
        <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
          Produtos Sob Encomenda
        </h2>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Nenhum produto sob encomenda disponível no momento.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-8">
        Produtos Sob Encomenda
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/produto/${product.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-pastel-mint to-pastel-lavender rounded-t-xl overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                  <div className="text-center text-primary-600 group-hover:scale-110 transition-transform">
                    <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-xl">🧁</span>
                    </div>
                    <p className="text-xs">Imagem do produto</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-display text-lg font-semibold text-primary-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {product.description}
                </p>
                {product.show_price && product.price && (
                  <div className="text-primary-600 font-semibold">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CustomProducts;