import nodemailer from 'nodemailer';
import { promisify } from 'util';
import fs from 'fs';

// Cargar variables de entorno dinámicamente si no están disponibles
const loadEnvVariables = async () => {
    if (!process.env.EMAIL_HOST) {
        try {
            console.log('⚠️ Variables de entorno no encontradas, intentando cargar de .env');
            const envFile = await promisify(fs.readFile)('.env', 'utf8');
            const envVars = envFile.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(line => line.split('=', 2))
                .reduce((acc, [key, value]) => {
                    acc[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '');
                    return acc;
                }, {});
            
            // Establecer las variables en process.env
            Object.keys(envVars).forEach(key => {
                if (!process.env[key]) process.env[key] = envVars[key];
            });
            console.log('✅ Variables de entorno cargadas dinámicamente');
        } catch (err) {
            console.error('❌ Error al intentar cargar .env:', err.message);
        }
    }
};

// Crear un singleton para el transporter
let transporter = null;

// Función para crear el transporter si no existe
const getTransporter = async () => {
    if (transporter) return transporter;
    
    await loadEnvVariables();
    
    // Verificar que tenemos las variables necesarias
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error(`❌ Faltan variables de entorno: ${missingVars.join(', ')}`);
        throw new Error(`Faltan variables de entorno: ${missingVars.join(', ')}`);
    }
    
    // Crear transporter con configuración robusta
    try {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false // Permite conexiones a servidores con certificados autofirmados
            },
            debug: true, // Habilitar logs de depuración
            logger: true  // Registrar información sobre el transporte
        });
        
        console.log('✅ Transporter creado correctamente con las siguientes configuraciones:');
        console.log({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT === '465',
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD ? '******' : 'no configurado'
        });
        
        return transporter;
    } catch (error) {
        console.error('❌ Error al crear transporter:', error);
        throw error;
    }
};

// Función para enviar email
const sendEmail = async (options) => {
    // Verificar opciones mínimas
    if (!options.to || !options.subject || !options.html) {
        throw new Error('Faltan opciones requeridas para enviar email (to, subject, html)');
    }
    
    try {
        const transport = await getTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Goza Madrid" <info@gozamadrid.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            ...options  // Permitir otras opciones que se pasen
        };
        
        console.log(`📧 Enviando email a: ${options.to}`);
        const info = await transport.sendMail(mailOptions);
        console.log(`✅ Email enviado: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Error al enviar email a ${options.to}:`, error);
        throw error;
    }
};

// Exportar tanto el transporter como la función sendEmail para flexibilidad
export default {
    transporter: null, // Se establecerá bajo demanda con getTransporter
    getTransporter,
    sendEmail
};

