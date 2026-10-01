import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import { sb } from "../lib/supabase.js";

const TABLE_NAME = "bookings";
const QUERY_ID = "booking_id";

export async function getBookings(): Promise<Booking[]> {
  const { error, data } = await sb.from(TABLE_NAME).select();

  if (!error) {
    return data as any as Booking[];
  }
  throw error;
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const { error, data }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .select()
    .eq(QUERY_ID, bookingId)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function createBooking(bookingBody: NewBooking): Promise<Booking> {
  const { error, data }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .insert(bookingBody)
    .select()
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function updateBookingById(bookingId: string, booking: Partial<Booking>): Promise<Booking> {
  const { error, data }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .update(booking)
    .eq(QUERY_ID, bookingId)
    .select()
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function deleteBookingById(bookingId: string) {
  const { error } = await sb.from(TABLE_NAME).delete().eq(QUERY_ID, bookingId);

  if (!error) {
    return;
  }
  throw error;
}
