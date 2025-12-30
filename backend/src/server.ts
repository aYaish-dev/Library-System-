import app from "./app";
import { runHoldExpirySweep } from "./jobs/holdExpiry.job";
import { runReservationExpiry } from "./jobs/reservationExpiry.job";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
setInterval(() => {
  runHoldExpirySweep().catch(console.error);
}, 60_000); // every 60s
setInterval(async () => {
  try {
    const r = await runReservationExpiry();
    if (r.expired > 0) console.log("Reservation expiry job:", r);
  } catch (e) {
    console.error("Reservation expiry job error:", e);
  }
}, 10 * 60 * 1000); // every 10 minutes
