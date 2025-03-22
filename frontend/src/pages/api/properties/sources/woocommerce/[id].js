import handler from '@/pages/api/properties/sources/woocommerce';

export default async function idHandler(req, res) {
  // Asegurarse de que el ID esté en query
  req.query = {
    ...req.query,
    id: req.query.id
  };
  
  return handler(req, res);
} 