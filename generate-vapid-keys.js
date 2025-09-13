import webpush from 'web-push';

console.log('🔑 Gerando chaves VAPID para notificações push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves VAPID geradas com sucesso!\n');

console.log('📋 Chaves para configurar no seu projeto:\n');

console.log('🔓 CHAVE PÚBLICA (usar no frontend):');
console.log(`"${vapidKeys.publicKey}"\n`);

console.log('🔐 CHAVE PRIVADA (usar no backend - MANTENHA SECRETA):');
console.log(`"${vapidKeys.privateKey}"\n`);

console.log('⚠️  IMPORTANTE:');
console.log('1. Substitua as chaves nos arquivos:');
console.log('   - src/app/api/notifications/test/route.ts');
console.log('   - src/app/api/notifications/send/route.ts');
console.log('   - src/components/NotificationManager.tsx');
console.log('');
console.log('2. NUNCA compartilhe a chave privada publicamente!');
console.log('3. Em produção, use variáveis de ambiente (.env)');
console.log('');

console.log('📝 Exemplo de configuração no .env.local:');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log(`VAPID_EMAIL="admin@sabores.com"`);