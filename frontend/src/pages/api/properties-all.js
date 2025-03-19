import { getPropertyPosts } from "@/pages/api";

export default async function handler(req, res) {
  try {
    console.log("[properties-all] Iniciando petición de propiedades combinadas");
    
    // Obtener todas las propiedades (WooCommerce y MongoDB)
    const allProperties = await getPropertyPosts();
    
    // Contar propiedades por fuente
    const mongoProperties = allProperties.filter(p => p.source === "mongodb");
    const wooProperties = allProperties.filter(p => p.source === "woocommerce");
    
    console.log(`[properties-all] Total propiedades: ${allProperties.length} (MongoDB: ${mongoProperties.length}, WooCommerce: ${wooProperties.length})`);
    
    // Devolver respuesta
    res.status(200).json({
      success: true,
      properties: allProperties,
      count: allProperties.length,
      sources: {
        mongodb: mongoProperties.length,
        woocommerce: wooProperties.length
      }
    });
  } catch (error) {
    console.error("[properties-all] Error al obtener propiedades:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      properties: []
    });
  }
} 