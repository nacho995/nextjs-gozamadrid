"use strict";(()=>{var e={};e.id=2378,e.ids=[2378],e.modules={2364:(e,a,o)=>{o.a(e,async(e,r)=>{try{o.d(a,{A:()=>c});var t=o(87984),i=o(21572),n=o.n(i),s=o(8665),l=o(19610),d=e([t]);t=(d.then?(await d)():d)[0];class p{constructor(){this.openai=new t.OpenAI({apiKey:process.env.OPENAI_API_KEY}),this.transporter=n().createTransport({host:process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.EMAIL_PORT||"587"),secure:"true"===process.env.EMAIL_SECURE,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}})}async generateEmailContent(e,a=[]){let o=["Consejos para aumentar el valor de su propiedad","Tendencias actuales del mercado inmobiliario en Madrid","Los mejores barrios para invertir en Madrid","C\xf3mo preparar su propiedad para la venta","Reformas que aumentan el valor de su propiedad","El proceso de venta de una propiedad paso a paso","Aspectos legales a considerar al vender una propiedad","C\xf3mo determinar el precio adecuado para su propiedad","Las ventajas de trabajar con un agente inmobiliario premium","Fotograf\xeda y presentaci\xf3n: claves para vender su propiedad","Consejos para negociar el mejor precio para su propiedad","Servicios exclusivos de Real Estate Goza Madrid","El mercado de lujo en Madrid: caracter\xedsticas y oportunidades","C\xf3mo maximizar el retorno de inversi\xf3n en propiedades","Preguntas frecuentes al vender una propiedad de lujo"],r=o.filter(e=>!a.includes(e)),t=r.length>0?r[Math.floor(Math.random()*r.length)]:o[Math.floor(Math.random()*o.length)],i=e.tipoPropiedad||"propiedad",n=e.zonaPropiedad||"Madrid",s=`
    Escribe un email de marketing para un cliente interesado en la valoraci\xf3n de su ${i} en ${n}.
    
    El tema del email es: "${t}".
    
    El email debe:
    1. Dirigirse a ${e.nombre} personalmente
    2. Ser amigable pero profesional
    3. Proporcionar informaci\xf3n valiosa sobre el tema
    4. Incluir un p\xe1rrafo que mencione que Marta Goza est\xe1 disponible para una consulta personalizada
    5. Terminar con una llamada a la acci\xf3n clara
    
    El contenido debe ser breve (m\xe1ximo 300 palabras), atractivo y transmitir exclusividad.
    Escribe solo el contenido del email, sin asunto.
    `;try{let a=(await this.openai.chat.completions.create({model:"gpt-4o",messages:[{role:"system",content:"Eres un experto en marketing inmobiliario de lujo. Escribes contenido elegante, persuasivo y exclusivo."},{role:"user",content:s}],max_tokens:600,temperature:.7})).choices[0].message.content.trim();return{subject:`${e.nombre}, ${t}`,content:a,topic:t}}catch(e){throw console.error("Error al generar contenido con OpenAI:",e),e}}async sendPersonalizedEmail(e){try{let{subject:a,content:o,topic:r}=await this.generateEmailContent(e,e.ultimosTemasEnviados||[]),t=`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://gozamadrid.com/logo.png" alt="Real Estate Goza Madrid" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="border-top: 3px solid #D4AF37; border-bottom: 3px solid #D4AF37; padding: 20px 0; margin-bottom: 20px;">
            <h2 style="color: #000; margin-bottom: 20px; font-size: 22px;">${a}</h2>
            
            <div style="line-height: 1.6; margin-bottom: 25px;">
              ${o.replace(/\n/g,"<br>")}
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center;">
              <img src="https://gozamadrid.com/marta.jpeg" alt="Marta Goza" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
              <div>
                <p style="margin: 0; font-weight: bold;">Marta Goza</p>
                <p style="margin: 5px 0 0; font-size: 14px;">Asesora Inmobiliaria Premium</p>
                <p style="margin: 5px 0 0; color: #D4AF37;">+34 919 012 103</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
            <p>Real Estate Goza Madrid | Calle de Azulinas, 28036 Madrid</p>
            <p>
              <a href="https://gozamadrid.com" style="color: #D4AF37; text-decoration: none;">gozamadrid.com</a> | 
              <a href="mailto:marta@gozamadrid.com" style="color: #D4AF37; text-decoration: none;">marta@gozamadrid.com</a>
            </p>
            <p>
              Si desea dejar de recibir estos emails, <a href="https://gozamadrid.com/unsubscribe?email=${e.email}" style="color: #D4AF37; text-decoration: none;">haga clic aqu\xed</a>.
            </p>
          </div>
        </div>
      `,i={from:`"Real Estate Goza Madrid" <${process.env.EMAIL_USER}>`,to:e.email,subject:a,html:t};await this.transporter.sendMail(i),await (0,l.A)();let n=[...e.ultimosTemasEnviados||[],r];return n.length>5&&(n=n.slice(-5)),await s.A.findByIdAndUpdate(e._id,{$inc:{emailsEnviados:1},ultimoContacto:new Date,ultimosTemasEnviados:n}),!0}catch(e){throw console.error("Error al enviar email personalizado:",e),e}}async sendDailyEmails(){try{await (0,l.A)();let e=await s.A.find({estado:"activo"});console.log(`Enviando emails diarios a ${e.length} contactos...`);let a=await Promise.allSettled(e.map(e=>this.sendPersonalizedEmail(e))),o=a.filter(e=>"fulfilled"===e.status).length,r=a.filter(e=>"rejected"===e.status).length;return console.log(`Emails enviados: ${o} exitosos, ${r} fallidos`),{succeeded:o,failed:r}}catch(e){throw console.error("Error al enviar emails diarios:",e),e}}}let c=new p;r()}catch(e){r(e)}})},8025:(e,a,o)=>{o.a(e,async(e,r)=>{try{o.r(a),o.d(a,{default:()=>s});var t=o(2364),i=o(90972),n=e([t,i]);async function s(e,a){if("POST"!==e.method)return a.status(405).json({error:"M\xe9todo no permitido"});try{let o=e.headers[i.SIGNATURE_HEADER_NAME],r=process.env.CRON_SECRET;if(r&&!(o&&("function"==typeof i.isValidSignature&&(0,i.isValidSignature)(o,r)||o===r)))return a.status(401).json({error:"No autorizado"});console.log("Iniciando env\xedo de emails diarios...");let n=await t.A.sendDailyEmails();return a.status(200).json({success:!0,emailsEnviados:n.succeeded,emailsFallidos:n.failed,timestamp:new Date().toISOString()})}catch(e){return console.error("Error al enviar emails diarios:",e),a.status(500).json({error:"Error al enviar emails diarios",details:e.message})}}[t,i]=n.then?(await n)():n,r()}catch(e){r(e)}})},8665:(e,a,o)=>{o.d(a,{A:()=>n});var r=o(56037),t=o.n(r);let i=new(t()).Schema({nombre:{type:String,required:[!0,"Por favor, proporcione un nombre"],trim:!0},email:{type:String,required:[!0,"Por favor, proporcione un email"],unique:!0,trim:!0,lowercase:!0,match:[/^\S+@\S+\.\S+$/,"Por favor, use un email v\xe1lido"]},telefono:{type:String,trim:!0},tipoPropiedad:{type:String,enum:["Piso","Chalet","\xc1tico","Villa","D\xfaplex","Otro"]},zonaPropiedad:String,rangoValor:String,intereses:{type:[String],default:["valoraci\xf3n"]},ultimoContacto:{type:Date,default:Date.now},emailsEnviados:{type:Number,default:0},estado:{type:String,enum:["activo","inactivo","pausado"],default:"activo"},ultimosTemasEnviados:{type:[String],default:[]},createdAt:{type:Date,default:Date.now},updatedAt:{type:Date,default:Date.now}});i.pre("save",function(e){this.updatedAt=Date.now(),e()});let n=t().models.Contact||t().model("Contact",i)},8667:(e,a)=>{Object.defineProperty(a,"A",{enumerable:!0,get:function(){return o}});var o=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})},19610:(e,a,o)=>{o.d(a,{A:()=>s});var r=o(56037),t=o.n(r);let i=process.env.MONGODB_URI;if(!i)throw Error("Por favor, define la variable de entorno MONGODB_URI dentro de .env.local");let n=global.mongoose;n||(n=global.mongoose={conn:null,promise:null});let s=async function(){return n.conn||(n.promise||(n.promise=t().connect(i,{bufferCommands:!1}).then(e=>e)),n.conn=await n.promise),n.conn}},21572:e=>{e.exports=require("nodemailer")},33480:(e,a,o)=>{e.exports=o(75600)},47076:(e,a,o)=>{o.a(e,async(e,r)=>{try{o.r(a),o.d(a,{config:()=>p,default:()=>d,routeModule:()=>c});var t=o(33480),i=o(8667),n=o(86435),s=o(8025),l=e([s]);s=(l.then?(await l)():l)[0];let d=(0,n.M)(s,"default"),p=(0,n.M)(s,"config"),c=new t.PagesAPIRouteModule({definition:{kind:i.A.PAGES_API,page:"/api/enviar-emails-diarios",pathname:"/api/enviar-emails-diarios",bundlePath:"",filename:""},userland:s});r()}catch(e){r(e)}})},56037:e=>{e.exports=require("mongoose")},75600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},86435:(e,a)=>{Object.defineProperty(a,"M",{enumerable:!0,get:function(){return function e(a,o){return o in a?a[o]:"then"in a&&"function"==typeof a.then?a.then(a=>e(a,o)):"function"==typeof a&&"default"===o?a:void 0}}})},87984:e=>{e.exports=import("openai")},90972:e=>{e.exports=import("@vercel/edge-config")}};var a=require("../../webpack-api-runtime.js");a.C(e);var o=a(a.s=47076);module.exports=o})();