import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/userSchema.js';

dotenv.config();

const checkPassword = async () => {
  try {
    console.log('=== Verificación de Contraseña ===\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const userEmail = 'mblp66@gmail.com';
    const testPassword = 'Martita59?';

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.error(`❌ Usuario ${userEmail} no encontrado`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${user.email}`);
    console.log(`📝 Nombre: ${user.name}`);
    console.log(`🔑 Hash en DB: ${user.password}\n`);

    // Verificar si el hash es válido bcrypt
    const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    console.log(`Hash válido de bcrypt: ${isBcryptHash ? '✅ SÍ' : '❌ NO'}`);

    if (!isBcryptHash) {
      console.error('⚠️  El hash NO es de bcrypt. Puede estar corrupto.\n');
    }

    // Probar la contraseña
    console.log(`\nProbando contraseña: "${testPassword}"`);
    
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Resultado: ${isValid ? '✅ VÁLIDA' : '❌ INCORRECTA'}\n`);
      
      if (!isValid) {
        console.log('🔍 Intentando con otras variaciones...\n');
        
        // Probar variaciones comunes
        const variations = [
          'Martita59?',
          'martita59?',
          'MARTITA59?',
        ];
        
        for (const pass of variations) {
          const result = await bcrypt.compare(pass, user.password);
          console.log(`  "${pass}": ${result ? '✅ VÁLIDA' : '❌'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error al comparar contraseñas:', error.message);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

checkPassword();
