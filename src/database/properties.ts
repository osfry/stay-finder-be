import type { PostgrestFilterBuilder, PostgrestSingleResponse } from "@supabase/supabase-js";

import { sb } from "../lib/supabase.js";
import type { NewProperty, Property, PropertyKind, PropertyValidKey } from "../types/property.js";
import type { BasicSupabaseClient } from "../types/supabase.js";

const TABLE_NAME = "properties";

const SELECT_QUERY_LIST: PropertyValidKey[] = [
  "property_id",
  "title",
  "description",
  "location",
  "price_per_night",
  "max_guests",
  "kind",
  "created_at",
];

const SELECT_QUERY = SELECT_QUERY_LIST.join(", ");
const QUERY_ID = "property_id";
const QUERY_KIND = "kind";

type PropertyListFilter = Partial<{
  maxPrice: number;
  location: string;
  maxGuests: number;
  sort: "asc" | "desc";
}>;

function buildPropertiesFilter(query: PostgrestFilterBuilder<any, any, any, any>, filters: PropertyListFilter) {
  if (filters.sort) {
    query = query.order("price_per_night", { ascending: filters.sort === "asc" });
  }

  if (filters.maxPrice) {
    query = query.lte("price_per_night", filters.maxPrice);
  }

  if (filters.maxGuests) {
    query = query.lte("max_guests", filters.maxGuests);
  }

  if (filters.location && filters.location.trim().length > 2) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  return query;
}

export async function getProperties(filters: PropertyListFilter): Promise<Property[]> {
  const query = buildPropertiesFilter(sb.from(TABLE_NAME).select(SELECT_QUERY), filters);

  const { error, data } = await query;

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertiesByKind(kind: PropertyKind, filters: PropertyListFilter): Promise<Property[]> {
  const query = buildPropertiesFilter(sb.from(TABLE_NAME).select(SELECT_QUERY).eq(QUERY_KIND, kind), filters);

  const { error, data } = await query;

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertyById(propertyId: string): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_ID, propertyId)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function createProperty(client: BasicSupabaseClient, propertyBody: NewProperty) {
  const { error, data }: PostgrestSingleResponse<Property> = await client
    .from(TABLE_NAME)
    .insert(propertyBody)
    .select(SELECT_QUERY)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function updatePropertyById(
  client: BasicSupabaseClient,
  propertyId: string,
  property: Partial<Property>,
): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await client
    .from(TABLE_NAME)
    .update(property)
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function deletePropertyById(client: BasicSupabaseClient, propertyId: string) {
  const { error }: PostgrestSingleResponse<Property> = await client
    .from(TABLE_NAME)
    .delete()
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return;
  }
  throw error;
}
