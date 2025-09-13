import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { OrderFormData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

interface OrderRequest extends OrderFormData {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_price?: number;
}

interface SavedOrder {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_price?: number;
  customer_name: string;
  customer_address: string;
  customer_whatsapp: string;
  delivery_date?: string;
  payment_method: string;
  notes?: string;
  status: 'pending' | 'sent' | 'delivered';
  created_at: string;
}

// Sistema de backup em memória e arquivo para quando não há banco de dados
let inMemoryOrders: SavedOrder[] = [];
const ordersFilePath = path.join(process.cwd(), '.next', 'cache', 'orders.json');

// Função para salvar pedidos em arquivo
function saveOrdersToFile(orders: SavedOrder[]) {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    console.log(`💾 ${orders.length} pedidos salvos em arquivo`);
  } catch (error) {
    console.error('❌ Erro ao salvar pedidos em arquivo:', error);
  }
}

// Função para carregar pedidos do arquivo
function loadOrdersFromFile(): SavedOrder[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf8');
      const orders = JSON.parse(data) as SavedOrder[];
      console.log(`📂 ${orders.length} pedidos carregados do arquivo`);
      return orders;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar pedidos do arquivo:', error);
  }
  return [];
}

// Inicializar pedidos na memória se estiver vazia
if (inMemoryOrders.length === 0) {
  inMemoryOrders = loadOrdersFromFile();
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    
    // Validar dados obrigatórios
    if (!body.product_id || !body.customer_name || !body.customer_address || !body.customer_whatsapp) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    const orderId = uuidv4();
    const orderData: SavedOrder = {
      id: orderId,
      product_id: body.product_id,
      product_name: body.product_name,
      product_image: body.product_image,
      product_price: body.product_price,
      customer_name: body.customer_name,
      customer_address: body.customer_address,
      customer_whatsapp: body.customer_whatsapp,
      delivery_date: body.delivery_date,
      payment_method: body.payment_method || 'pix',
      notes: body.observations,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    let savedOrder: SavedOrder = orderData;
    let saveMethod = 'localStorage';

    // Tentar salvar no Supabase primeiro
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('placeholder')) {
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            id: orderId,
            product_id: body.product_id,
            customer_name: body.customer_name,
            customer_address: body.customer_address,
            customer_whatsapp: body.customer_whatsapp,
            delivery_date: body.delivery_date || null,
            payment_method: body.payment_method || 'pix',
            notes: body.observations || null,
            status: 'pending'
          })
          .select()
          .single();

        if (!orderError && order) {
          savedOrder = { ...orderData, ...order } as SavedOrder;
          saveMethod = 'supabase';
          console.log('✅ Pedido salvo no Supabase:', order.id);
        } else {
          console.warn('⚠️ Erro no Supabase, usando fallback:', orderError?.message);
          throw new Error('Supabase failed');
        }
      } else {
        console.log('📝 Supabase não configurado, usando localStorage');
        throw new Error('Supabase not configured');
      }
    } catch (supabaseError) {
      // Fallback: Salvar em memória (servidor)
      console.log('💾 Salvando pedido em memória (servidor)...');
      
      // Adicionar ao array em memória
      inMemoryOrders.unshift(orderData);
      
      // Manter apenas os últimos 100 pedidos
      if (inMemoryOrders.length > 100) {
        inMemoryOrders = inMemoryOrders.slice(0, 100);
      }
      
      // Salvar em arquivo também
      saveOrdersToFile(inMemoryOrders);
      
      console.log(`📦 Total de pedidos: ${inMemoryOrders.length} (memória + arquivo)`);
      saveMethod = 'memory+file';
    }

    // Preparar mensagem para WhatsApp
    const message = formatWhatsAppMessage({ ...body, product_name: body.product_name });
    
    // Enviar para webhook do WhatsApp
    let webhookSent = false;
    const webhookUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL;
    
    if (webhookUrl && !webhookUrl.includes('webhook.site')) {
      try {
        console.log('📱 Enviando webhook para:', webhookUrl.substring(0, 30) + '...');
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: body.customer_whatsapp,
            message: message,
            image: body.product_image,
            order_id: orderId
          }),
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook enviado com sucesso!');
          webhookSent = true;
        } else {
          console.error('❌ Erro no webhook:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('❌ Erro ao enviar webhook:', webhookError);
      }
    } else {
      console.log('🔗 Webhook não configurado ou é URL de teste');
    }

    // Log detalhado do pedido para depuração
    console.log('📋 RESUMO DO PEDIDO:', {
      id: orderId,
      cliente: body.customer_name,
      whatsapp: body.customer_whatsapp,
      produto: body.product_name,
      endereco: body.customer_address,
      pagamento: body.payment_method,
      data_entrega: body.delivery_date,
      observacoes: body.observations,
      salvo_em: saveMethod,
      webhook_enviado: webhookSent,
      timestamp: new Date().toLocaleString('pt-BR')
    });

    return NextResponse.json(
      { 
        success: true, 
        order_id: orderId,
        saved_in: saveMethod,
        webhook_sent: webhookSent,
        message: `Pedido #${orderId.slice(0, 8)} recebido com sucesso! Entraremos em contato via WhatsApp.` 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro na API de pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Adicionar endpoint GET para listar pedidos (para o admin)
export async function GET(request: NextRequest) {
  try {
    // Garantir que temos os pedidos carregados
    if (inMemoryOrders.length === 0) {
      inMemoryOrders = loadOrdersFromFile();
    }
    
    console.log(`📦 Verificando pedidos - Memória tem: ${inMemoryOrders.length} pedidos`);
    
    // Tentar buscar do Supabase primeiro
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('placeholder')) {
        const { data: orders, error } = await supabaseAdmin
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && orders && orders.length > 0) {
          console.log(`📊 Buscados ${orders.length} pedidos do Supabase`);
          return NextResponse.json({ orders, source: 'supabase' });
        } else {
          console.log('⚠️ Supabase retornou vazio ou com erro, usando backup local');
        }
      } else {
        console.log('📝 Supabase não configurado, usando backup local');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar pedidos do Supabase:', error);
    }

    // Fallback: retornar pedidos da memória/arquivo
    console.log(`📦 Retornando ${inMemoryOrders.length} pedidos do backup local`);
    return NextResponse.json({ 
      orders: inMemoryOrders, 
      source: 'local-backup',
      message: inMemoryOrders.length > 0 
        ? `${inMemoryOrders.length} pedidos encontrados no backup local. Configure o Supabase para persistência em nuvem.`
        : 'Nenhum pedido encontrado. Faça alguns pedidos primeiro!' 
    });
  } catch (error) {
    console.error('❌ Erro na API de pedidos (GET):', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}

function formatWhatsAppMessage(data: OrderRequest): string {
  const deliveryInfo = data.delivery_date 
    ? `\n📅 *Data para entrega:* ${new Date(data.delivery_date).toLocaleDateString('pt-BR')}`
    : '';

  const priceInfo = data.product_price 
    ? `\n💰 *Preço:* R$ ${data.product_price.toFixed(2).replace('.', ',')}`
    : '';

  const paymentInfo = data.payment_method === 'pix' 
    ? '\n💳 *Pagamento:* PIX (Chave: 11981047422)'
    : '\n💳 *Pagamento:* Cartão (Levaremos a máquina)';

  const observationsInfo = data.observations 
    ? `\n📝 *Observações:* ${data.observations}`
    : '';

  return `🍰 *Novo Pedido - Sabores de Zissou*

🛍️ *Produto:* ${data.product_name}${priceInfo}

👤 *Cliente:* ${data.customer_name}
📱 *WhatsApp:* ${data.customer_whatsapp}
📍 *Endereço:* ${data.customer_address}${deliveryInfo}${paymentInfo}${observationsInfo}

⏰ *Pedido realizado em:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}

---
_Pedido realizado através do app Sabores de Zissou_`;
}