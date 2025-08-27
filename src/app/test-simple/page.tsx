export default function TestSimple() {
  return (
    <div>
      <h1>Test Simple Page</h1>
      <p>This is a simple test page without any authentication.</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}
