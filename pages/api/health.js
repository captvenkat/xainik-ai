export default function handler(req, res) {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: "Pages Router API is working!",
    method: req.method
  });
}
