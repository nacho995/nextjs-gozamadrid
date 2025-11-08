import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/userSchema.js';

dotenv.config();

const createTestUser = async () => {
  try {
    console.log('=== Crear Usuario de Prueba ===\n');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI no está configurado en .env');
      process.exit(1);
    }

    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const testUser = {
      name: 'Test User',
      email: 'test@gozamadrid.com',
      password: 'TestPassword123!',
      role: 'USER'
    };

    // Verificar si ya existe
    const existing = await User.findOne({ email: testUser.email });
    if (existing) {
      console.log(`⚠️  Usuario ${testUser.email} ya existe. Eliminando...\n`);
      await User.deleteOne({ email: testUser.email });
    }

    console.log('Creando usuario de prueba:');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Password: ${testUser.password}`);
    console.log(`  (El hook pre-save hasheará la contraseña)\n`);

    const user = new User(testUser);
    await user.save();

    console.log('✅ Usuario creado exitosamente');
    console.log(`Hash generado: ${user.password.substring(0, 30)}...\n`);

    console.log('🧪 Ahora puedes probar login con:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}\n`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

createTestUser();
