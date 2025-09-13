'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import OrderForm from '@/components/OrderForm';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const ProductDetail: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Erro ao buscar produto:', error);
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const nextImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-pastel-vanilla">
        <div className="container mx-auto px-4 py-8">
          <Loading size="lg" className="py-20" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-pastel-vanilla">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-primary-800 mb-4">
              Produto não encontrado
            </h1>
            <p className="text-gray-600 mb-6">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pastel-vanilla">
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-primary-700 hover:text-primary-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                {/* Imagem principal */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-br from-pastel-rose to-pastel-lavender flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                  <div className="text-center text-primary-600">
                    <div className="w-32 h-32 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">🎂</span>
                    </div>
                    <p className="text-sm">Imagem do produto</p>
                  </div>
                </div>

                {/* Controles de navegação */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-primary-600" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-primary-600" />
                    </button>
                    
                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex ? 'bg-white' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(0, 3).map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Imagem ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-pastel-mint to-pastel-peach flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-lg">🍰</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary-800 mb-4">
                {product.name}
              </h1>
              
              {product.show_price && product.price && (
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
              
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {product.description}
              </p>
              
              {product.ingredients && (
                <div className="mb-4">
                  <h3 className="font-display text-lg font-semibold text-primary-800 mb-2">
                    Ingredientes
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold text-primary-800 mb-3">
                  Informações Importantes
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Produto feito sob encomenda</li>
                  <li>• Prazo mínimo: 3 dias úteis</li>
                  <li>• Personalizações disponíveis</li>
                  <li>• Ingredientes selecionados</li>
                  <li>• Entrega disponível na região</li>
                </ul>
              </CardContent>
            </Card>

            {/* Botão de Pedido */}
            <Button
              onClick={() => setShowOrderForm(true)}
              size="lg"
              className="w-full"
            >
              Fazer Pedido Personalizado
            </Button>
          </div>
        </div>
      </div>

      {/* Modal do formulário */}
      {showOrderForm && (
        <OrderForm
          product={product}
          type="custom"
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </main>
  );
};

export default ProductDetail;