import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 LOGIN ATTEMPT:', { email, env: process.env.NODE_ENV });

    // CREDENCIAIS VÁLIDAS - HARDCODED PARA SEMPRE FUNCIONAR
    const validCredentials = [
      { email: 'admin@sabores.com', password: 'admin123', name: 'Administrador Principal' },
      { email: 'admin', password: 'admin', name: 'Admin Simples' },
      { email: 'sabores', password: '123456', name: 'Sabores Admin' }
    ];

    // VERIFICAR CREDENCIAIS
    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (validUser) {
      console.log('✅ LOGIN SUCESSO:', validUser.email);
      
      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: 'admin-123',
          email: validUser.email,
          name: validUser.name
        }
      }, { status: 200 });
    }

    console.log('❌ CREDENCIAIS INVÁLIDAS');
    return NextResponse.json({
      success: false,
      error: 'Email ou senha incorretos. Tente: admin@sabores.com / admin123'
    }, { status: 401 });

  } catch (error) {
    console.error('💥 ERRO GERAL:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}