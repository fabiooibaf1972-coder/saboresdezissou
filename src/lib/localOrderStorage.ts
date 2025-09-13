'use client';

// Sistema de backup para pedidos quando Supabase não está configurado
export class LocalOrderStorage {
  private static STORAGE_KEY = 'sabores_pedidos';

  static saveOrder(order: any): string {
    try {
      const orders = this.getOrders();
      const orderId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newOrder = {
        ...order,
        id: orderId,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      orders.unshift(newOrder);
      
      // Manter apenas os últimos 100 pedidos
      if (orders.length > 100) {
        orders.splice(100);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
      
      console.log('💾 Pedido salvo localmente:', {
        id: orderId,
        cliente: order.customer_name,
        produto: order.product_name
      });

      return orderId;
    } catch (error) {
      console.error('Erro ao salvar pedido localmente:', error);
      throw new Error('Erro ao salvar pedido');
    }
  }

  static getOrders(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar pedidos locais:', error);
      return [];
    }
  }

  static getOrderById(id: string): any | null {
    const orders = this.getOrders();
    return orders.find(order => order.id === id) || null;
  }

  static updateOrderStatus(id: string, status: 'pending' | 'sent' | 'delivered'): boolean {
    try {
      const orders = this.getOrders();
      const orderIndex = orders.findIndex(order => order.id === id);
      
      if (orderIndex >= 0) {
        orders[orderIndex].status = status;
        orders[orderIndex].updated_at = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }
  }

  static clearOrders(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportOrders(): string {
    const orders = this.getOrders();
    return JSON.stringify(orders, null, 2);
  }

  static getOrdersCount(): number {
    return this.getOrders().length;
  }

  static getPendingOrdersCount(): number {
    return this.getOrders().filter(order => order.status === 'pending').length;
  }
}

export default LocalOrderStorage;