type PropertyKind = "apartment" | "villa";

interface Property {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  property_id: string;
  kind: PropertyKind;
  created_at: string;
  user_id: string;
}

type NewProperty = Omit<Property, "property_id" | "created_at" | "user_id">;

type PropertyValidKey = keyof Property;
