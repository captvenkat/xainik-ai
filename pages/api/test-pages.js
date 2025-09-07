export default function handler(req, res) {
  res.status(200).json({ 
    message: "Pages Router API is working!",
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
