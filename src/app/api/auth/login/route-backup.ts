import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Tentativa de login:', { email, password });

    // Login de emergência - funciona sem Supabase
    if (email === 'admin@sabores.com' && password === 'admin123') {
      console.log('✅ Login de emergência bem-sucedido!');
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login realizado com sucesso (modo emergência)',
          user: {
            id: '123',
            email: 'admin@sabores.com',
            name: 'Admin Sabores'
          }
        },
        { status: 200 }
      );
    }

    // Tentar conectar com Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      console.log('📊 Resultado Supabase:', { adminUser, error });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (adminUser && adminUser.password_hash === password) {
        return NextResponse.json(
          { 
            success: true, 
            message: 'Login realizado com sucesso',
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name
            }
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );

    } catch (supabaseError) {
      console.error('❌ Erro Supabase:', supabaseError);
      
      // Fallback para login de emergência
      if (email === 'admin@sabores.com' && password === 'admin123') {
        return NextResponse.json(
          { 
            success: true, 
            message: 'Login realizado com sucesso (fallback - configure o Supabase)',
            user: {
              id: '123',
              email: 'admin@sabores.com',
              name: 'Admin Sabores'
            }
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Erro de conexão: ${(supabaseError as Error).message}. Configure o .env.local com as credenciais do Supabase.`
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erro interno: ${(error as Error).message}`
      },
      { status: 500 }
    );
  }
}