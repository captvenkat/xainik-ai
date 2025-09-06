export default function Home() {
  return (
    <div>
      <h1>Welcome to Xainik</h1>
      <p>Organizer → create events. Speakers → onboard & list topics. Donors → support the mission.</p>
      <div className="card">
        <h3>What works now</h3>
        <ul>
          <li>Organizer: Create events</li>
          <li>Speaker: Google login, profile update, topics</li>
          <li>Booking: Link speaker ↔ event (API)</li>
          <li>Donations: Tiers + PDF receipt</li>
          <li>Admin: Alerts stub + media health</li>
        </ul>
      </div>
    </div>
  );
}