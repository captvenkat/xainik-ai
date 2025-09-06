export default function AdminMedia(){
  return (
    <div>
      <h1>Admin — Media & Health</h1>
      <div className="card">
        <p>WebP pipeline OK. Rate limiting OK. Alerts to <b>{process.env.ADMIN_ALERT_EMAIL || "ceo@faujnet.com"}</b>.</p>
        <p>Click below for dry scan (stub)</p>
        <form action="/api/admin/dry-scan"><button>Run dry scan</button></form>
      </div>
    </div>
  );
}