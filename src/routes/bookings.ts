import { Hono } from "hono";
import { bookingOptionalValidator, bookingValidator } from "../validators/bookingValidator.js";
import {
  createBooking,
  deleteBookingById,
  getBookingById,
  getBookings,
  updateBookingById,
} from "../database/bookings.js";

const bookings = new Hono({ strict: false });

bookings.get("/", async (c) => {
  try {
    const bookings = await getBookings();
    return c.json(bookings);
  } catch (e) {
    console.warn("Error in fetching bookings from SB database", e);
    return c.json([]);
  }
});

// individuell GET hämta en Booking om den finns baserat på ID annars null 404
bookings.get("/:id", async (c) => {
  const bookingId = c.req.param("id");
  try {
    const booking = await getBookingById(bookingId);
    return c.json(booking);
  } catch (e) {
    console.warn("Error in fetching booking from SB database", e);
    return c.json(null, 404);
  }
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
bookings.post("/", bookingValidator, async (c) => {
  const bookingBody: NewBooking = c.req.valid("json");
  try {
    const booking = await createBooking(bookingBody);
    return c.json(booking, 201);
  } catch (e) {
    console.warn("Error in inserting booking into SB DB", e);
    return c.json(e, 500);
  }
});

// Extra: "Updaterande" av en Booking PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
bookings.patch("/:id", bookingOptionalValidator, async (c) => {
  const bookingId = c.req.param("id");
  const bookingBody: Partial<Booking> = c.req.valid("json");
  try {
    const booking = await updateBookingById(bookingId, bookingBody);
    return c.json(booking);
  } catch (e) {
    console.warn("Error updating booking in SB DB", e);
    return c.json(null, 404);
  }
});

// Extra: "bortagning" av en Booking DELETE om den finns tänk en GET som sedan tar bort 200/204
bookings.delete("/:id", async (c) => {
  const bookingId = c.req.param("id");
  try {
    await deleteBookingById(bookingId);
    return c.json(null, 200);
  } catch (e) {
    console.warn("Error in deleting booking", e);
    return c.json(null, 404);
  }
});

export default bookings;
