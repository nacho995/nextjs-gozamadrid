"use strict";(()=>{var e={};e.id=8630,e.ids=[8630],e.modules={8665:(e,o,t)=>{t.d(o,{A:()=>i});var r=t(56037),a=t.n(r);let d=new(a()).Schema({nombre:{type:String,required:[!0,"Por favor, proporcione un nombre"],trim:!0},email:{type:String,required:[!0,"Por favor, proporcione un email"],unique:!0,trim:!0,lowercase:!0,match:[/^\S+@\S+\.\S+$/,"Por favor, use un email v\xe1lido"]},telefono:{type:String,trim:!0},tipoPropiedad:{type:String,enum:["Piso","Chalet","\xc1tico","Villa","D\xfaplex","Otro"]},zonaPropiedad:String,rangoValor:String,intereses:{type:[String],default:["valoraci\xf3n"]},ultimoContacto:{type:Date,default:Date.now},emailsEnviados:{type:Number,default:0},estado:{type:String,enum:["activo","inactivo","pausado"],default:"activo"},ultimosTemasEnviados:{type:[String],default:[]},createdAt:{type:Date,default:Date.now},updatedAt:{type:Date,default:Date.now}});d.pre("save",function(e){this.updatedAt=Date.now(),e()});let i=a().models.Contact||a().model("Contact",d)},8667:(e,o)=>{Object.defineProperty(o,"A",{enumerable:!0,get:function(){return t}});var t=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})},19610:(e,o,t)=>{t.d(o,{A:()=>n});var r=t(56037),a=t.n(r);let d=process.env.MONGODB_URI;if(!d)throw Error("Por favor, define la variable de entorno MONGODB_URI dentro de .env.local");let i=global.mongoose;i||(i=global.mongoose={conn:null,promise:null});let n=async function(){return i.conn||(i.promise||(i.promise=a().connect(d,{bufferCommands:!1}).then(e=>e)),i.conn=await i.promise),i.conn}},21572:e=>{e.exports=require("nodemailer")},28692:(e,o,t)=>{t.r(o),t.d(o,{config:()=>m,default:()=>u,routeModule:()=>f});var r={};t.r(r),t.d(r,{default:()=>c});var a=t(33480),d=t(8667),i=t(86435),n=t(21572),s=t.n(n),l=t(19610),p=t(8665);async function c(e,o){if("POST"!==e.method)return o.status(405).json({error:"M\xe9todo no permitido"});try{await (0,l.A)();let{nombre:t,telefono:r,email:a,tipoPropiedad:d,zonaPropiedad:i,rangoValor:n,mensaje:c}=e.body;if(!t||!r||!a)return o.status(400).json({error:"Faltan campos requeridos"});let u=s().createTransport({host:process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.EMAIL_PORT||"587"),secure:"true"===process.env.EMAIL_SECURE,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}}),m={from:`"Formulario Web Propiedades Lujo" <${process.env.EMAIL_USER}>`,to:"marta@gozamadrid.com",subject:`Nueva solicitud de valoraci\xf3n: ${t}`,text:`
        Nombre: ${t}
        Tel\xe9fono: ${r}
        Email: ${a}
        Tipo de propiedad: ${d||"No especificado"}
        Zona de la propiedad: ${i||"No especificada"}
        Rango de valor: ${n||"No especificado"}
        
        Mensaje:
        ${c||"No hay mensaje adicional"}
      `,html:`
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #000; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Nueva Solicitud de Valoraci\xf3n</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nombre:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${t}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tel\xe9fono:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${r}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${a}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tipo de propiedad:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${d||"No especificado"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Zona:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${i||"No especificada"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Rango de valor:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${n||"No especificado"}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #000;">Mensaje:</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${c||"No hay mensaje adicional"}</p>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
            Este email ha sido enviado desde el formulario de contacto de la p\xe1gina de propiedades de lujo.
          </div>
        </div>
      `};await u.sendMail(m);try{let e=await p.A.findOne({email:a});e?(e.nombre=t,e.telefono=r,d&&(e.tipoPropiedad=d),i&&(e.zonaPropiedad=i),n&&(e.rangoValor=n),e.ultimoContacto=new Date,await e.save()):await p.A.create({nombre:t,email:a,telefono:r,tipoPropiedad:d,zonaPropiedad:i,rangoValor:n,intereses:["valoraci\xf3n"],estado:"activo"})}catch(e){console.error("Error al guardar contacto en la base de datos:",e)}return o.status(200).json({success:!0,message:"Email enviado correctamente"})}catch(e){return console.error("Error al enviar email:",e),o.status(500).json({error:"Error al enviar el email",details:e.message})}}let u=(0,i.M)(r,"default"),m=(0,i.M)(r,"config"),f=new a.PagesAPIRouteModule({definition:{kind:d.A.PAGES_API,page:"/api/enviar-contacto",pathname:"/api/enviar-contacto",bundlePath:"",filename:""},userland:r})},33480:(e,o,t)=>{e.exports=t(75600)},56037:e=>{e.exports=require("mongoose")},75600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},86435:(e,o)=>{Object.defineProperty(o,"M",{enumerable:!0,get:function(){return function e(o,t){return t in o?o[t]:"then"in o&&"function"==typeof o.then?o.then(o=>e(o,t)):"function"==typeof o&&"default"===t?o:void 0}}})}};var o=require("../../webpack-api-runtime.js");o.C(e);var t=o(o.s=28692);module.exports=t})();