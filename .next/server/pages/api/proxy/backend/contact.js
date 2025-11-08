"use strict";(()=>{var e={};e.id=8781,e.ids=[8781],e.modules={8667:(e,o)=>{Object.defineProperty(o,"A",{enumerable:!0,get:function(){return t}});var t=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})},26219:(e,o,t)=>{t.r(o),t.d(o,{config:()=>c,default:()=>d,routeModule:()=>l});var a={};t.r(a),t.d(a,{default:()=>n});var i=t(33480),s=t(8667),r=t(86435);async function n(e,o){if(o.setHeader("Access-Control-Allow-Origin","*"),o.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS"),o.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization"),"OPTIONS"===e.method)return o.status(200).end();if("POST"!==e.method)return o.status(405).json({error:"M\xe9todo no permitido. Solo se permite POST."});try{if(console.log("[Contact Proxy] Datos recibidos:",e.body?Object.keys(e.body):"Sin datos"),!e.body||!e.body.email)return o.status(400).json({error:"Datos incompletos",message:"El email es obligatorio"});let t="Nuevo contacto desde la web",a="";"visit"===e.body.type?(t="Nueva solicitud de visita de propiedad",a=`
        Nueva solicitud de visita
        
        Propiedad: ${e.body.propertyTitle||"No especificada"}
        ID Propiedad: ${e.body.propertyId||"No especificado"}
        Fecha de visita: ${e.body.visitDate||"No especificada"}
        Hora de visita: ${e.body.visitTime||"No especificada"}
        Nombre: ${e.body.name||"No especificado"}
        Email: ${e.body.email}
        Tel\xe9fono: ${e.body.phone||"No especificado"}
        Mensaje: ${e.body.message||"No especificado"}
      `):"offer"===e.body.type?(t="Nueva oferta para propiedad",a=`
        Nueva oferta recibida
        
        Propiedad: ${e.body.propertyTitle||"No especificada"}
        ID Propiedad: ${e.body.propertyId||"No especificado"}
        Oferta: ${e.body.offerAmount||"No especificada"} ${e.body.offerLabel||""}
        Nombre: ${e.body.name||"No especificado"}
        Email: ${e.body.email}
        Tel\xe9fono: ${e.body.phone||"No especificado"}
        Mensaje: ${e.body.message||"No especificado"}
      `):a=`
        Nuevo mensaje de contacto
        
        Nombre: ${e.body.name||"No especificado"}
        Email: ${e.body.email}
        Tel\xe9fono: ${e.body.phone||"No especificado"}
        Mensaje: ${e.body.message||"No especificado"}
      `;let i={name:e.body.name||"Cliente Web",email:e.body.email,message:a,subject:t,_template:"box"};console.log("[Contact Proxy] Enviando a formsubmit.co");let s=await fetch("https://formsubmit.co/ajax/marta@gozamadrid.com",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(i)});if(s.ok){let e=await s.json();return console.log("[Contact Proxy] Respuesta:",e),o.status(200).json({success:!0,message:"Solicitud procesada correctamente"})}if(console.log("[Contact Proxy] Fallo en formsubmit, intentando con alternativa"),(await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({access_key:"4b1ed8d4-53e7-4e8e-b9f2-f46a8513da87",subject:t,from_name:e.body.name||"Cliente Web",email:e.body.email,message:a})})).ok)return o.status(200).json({success:!0,message:"Solicitud procesada con servicio alternativo"});return o.status(500).json({error:"No se pudo procesar la solicitud",message:"Intente m\xe1s tarde o contacte directamente"})}catch(e){return console.error("[Contact Proxy] Error general:",e),o.status(500).json({error:"Error general al procesar la solicitud",message:"Intente m\xe1s tarde"})}}let d=(0,r.M)(a,"default"),c=(0,r.M)(a,"config"),l=new i.PagesAPIRouteModule({definition:{kind:s.A.PAGES_API,page:"/api/proxy/backend/contact",pathname:"/api/proxy/backend/contact",bundlePath:"",filename:""},userland:a})},33480:(e,o,t)=>{e.exports=t(75600)},75600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},86435:(e,o)=>{Object.defineProperty(o,"M",{enumerable:!0,get:function(){return function e(o,t){return t in o?o[t]:"then"in o&&"function"==typeof o.then?o.then(o=>e(o,t)):"function"==typeof o&&"default"===t?o:void 0}}})}};var o=require("../../../../webpack-api-runtime.js");o.C(e);var t=o(o.s=26219);module.exports=t})();