import { prisma } from "@/lib/db";

export default async function OrganizerDashboard(){
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      // get linked bookings (speaker + amount)
      // @ts-ignore
      bookings: { include: { speaker: { include: { user: true } } } }
    }
  });

  return (
    <div>
      <h1>Organizer — Dashboard</h1>
      <div className="card">
        <p>Overview of events and bookings</p>
      </div>
      {events.map(ev => (
        <div className="card" key={ev.id}>
          <h3>{ev.title}</h3>
          <p><b>Date:</b> {new Date(ev.date).toLocaleString("en-IN")} &nbsp; • &nbsp; <b>Budget:</b> ₹ {ev.budgetINR?.toLocaleString("en-IN")}</p>
          <div>
            <b>Bookings:</b>
            { /* @ts-ignore */ }
            {(ev.bookings||[]).length === 0 ? <p>None yet.</p> : (
              <ul>
                { /* @ts-ignore */ }
                {ev.bookings.map((b:any)=>(
                  <li key={b.id}>
                    Speaker: <b>{b.speaker?.user?.name || "Unknown"}</b> — Amount: ₹ {b.amountINR.toLocaleString("en-IN")} — Status: {b.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
