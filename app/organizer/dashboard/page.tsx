import { prisma } from "@/lib/db";

export default async function OrganizerDashboard(){
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      bookings: { include: { speaker: { include: { user: true } } } },
      shortlists: true
    } as any
  });
  const speakers = await prisma.speaker.findMany({ include: { user: true }});

  return (
    <div>
      <h1>Organizer — Dashboard</h1>
      <div className="card">
        <p>Overview of events and bookings</p>
      </div>
      <div className="card">
        <h3>All Speakers (copy ID to shortlist)</h3>
        {speakers.length===0 ? <p>No speakers onboarded yet.</p> : (
          <ul>
            {speakers.map(s => (<li key={s.id}><b>{s.user?.name || "Unnamed"}</b> — ID: <code>{s.id}</code> — Topics: {s.topics ? JSON.parse(s.topics).join(", ") : "None"}</li>))}
          </ul>
        )}
      </div>
      {events.map((ev:any) => (
        <div className="card" key={ev.id}>
          <h3>{ev.title}</h3>
          <p><b>Date:</b> {new Date(ev.date).toLocaleString("en-IN")} &nbsp; • &nbsp; <b>Budget:</b> ₹ {ev.budgetINR?.toLocaleString("en-IN")}</p>
          <div>
            <b>Bookings:</b>
            {(ev.bookings||[]).length === 0 ? <p>None yet.</p> : (
              <ul>
                {ev.bookings.map((b:any)=>(
                  <li key={b.id}>
                    Speaker: <b>{b.speaker?.user?.name || "Unknown"}</b> — Amount: ₹ {b.amountINR.toLocaleString("en-IN")} — Status: {b.status}
                    {" "}• <a href={`/api/invoices/${b.id}`} target="_blank">Invoice PDF</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <hr/>
          <h4>Shortlists</h4>
          {(ev.shortlists||[]).length===0 ? <p>None</p> : (
            <ul>
              {ev.shortlists.map((s:any)=> <li key={s.id}><code>{s.speakerId}</code> — {s.status}</li>)}
            </ul>
          )}
          <form action="/api/shortlists" method="post" style={{marginTop:12}}>
            <input type="hidden" name="__json" value="1" />
            <label>Shortlist Speaker ID</label>
            <input name="speakerId" placeholder="speakerId"/>
            <input type="hidden" name="eventId" value={ev.id}/>
            <button type="submit">Add to Shortlist</button>
          </form>
          <form action="/api/bookings" method="post" style={{marginTop:12}}>
            <input type="hidden" name="__json" value="1" />
            <label>Confirm Booking with Speaker ID</label>
            <input name="speakerId" placeholder="speakerId"/>
            <label>Amount (₹)</label>
            <input name="amountINR" type="number" defaultValue={ev.budgetINR || 0}/>
            <input type="hidden" name="eventId" value={ev.id}/>
            <button type="submit">Create Pending Booking</button>
          </form>
          <p style={{fontSize:12,opacity:0.7,marginTop:6}}>After creating a pending booking, use an API client or small UI to POST /api/bookings/confirm with the bookingId to mark confirmed and auto-generate an invoice, then POST /api/payouts/queue to queue a 90% payout.</p>
        </div>
      ))}
    </div>
  );
}
