import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/userSchema.js';

dotenv.config();

const fixUserPassword = async () => {
  try {
    console.log('=== Script de Reparación de Contraseña ===\n');
    
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const userEmail = 'mblp66@gmail.com';
    const newPassword = 'Martita59?';

    console.log(`Buscando usuario: ${userEmail}`);
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.error(`❌ Usuario ${userEmail} no encontrado`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${user.email}`);
    console.log(`Hash actual en DB: ${user.password.substring(0, 30)}...\n`);

    console.log(`Actualizando contraseña a: "${newPassword}"`);
    console.log('(El hook pre-save la hasheará automáticamente)\n');

    // Actualizar contraseña (el hook pre-save la hasheará)
    user.password = newPassword;
    await user.save();

    console.log('✅ Contraseña actualizada exitosamente');
    console.log(`Nuevo hash en DB: ${user.password.substring(0, 30)}...\n`);

    console.log('✅ Ahora puedes hacer login con:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Contraseña: ${newPassword}\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

fixUserPassword();
