import { Hono } from "hono";

import {
  propertyOptionalValidator,
  propertyParamValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";
import {
  createProperty,
  deletePropertyById,
  getProperties,
  getPropertiesByKind,
  getPropertiesByUser,
  getPropertyById,
  updatePropertyById,
} from "../database/properties.js";
import { requireAuth } from "../middleware/auth.js";
import type { User } from "@supabase/supabase-js";
import type { NewProperty, Property } from "../types/property.js";

const properties = new Hono({ strict: false });

function parseSort(value: string | undefined): "asc" | "desc" | undefined {
  return value === "asc" || value === "desc" ? value : undefined;
}

properties.get("/", async (c) => {
  try {
    const properties = await getProperties({
      maxPrice: Number(c.req.query("maxprice")) || undefined,
      location: c.req.query("location"),
      maxGuests: Number(c.req.query("maxguests")) || undefined,
      sort: parseSort(c.req.query("sort")),
    });
    return c.json(properties);
  } catch (e) {
    console.warn("Error in fetching properties from SB database", e);
    return c.json([]);
  }
});

// GET: properties either properties/kind/villa/ | properties/kind/appartment/
// If not neither of those 400
// Filter properties based on the kind
// Extra add all previous search filtering from GET: properties
properties.get("/kind/:kind", propertyParamValidator, async (c) => {
  const kind = c.req.valid("param").kind;
  try {
    const properties = await getPropertiesByKind(kind, {
      maxPrice: Number(c.req.query("maxprice")) || undefined,
      location: c.req.query("location"),
      maxGuests: Number(c.req.query("maxguests")) || undefined,
      sort: parseSort(c.req.query("sort")),
    });
    return c.json(properties);
  } catch (e) {
    console.warn("Error in fetching properties from SB database", e);
    return c.json([]);
  }
});

properties.get("/mine", requireAuth, async (c) => {
  const user = c.get("user") as User;
  try {
    return c.json(await getPropertiesByUser(c.get("supabase"), user.id));
  } catch (e) {
    console.warn("Error in fetching user properties from SB database", e);
    return c.json([]);
  }
});

// individuell GET hämta en Property om den finns baserat på ID annars null 404
properties.get("/:id", async (c) => {
  const propertyId = c.req.param("id");
  try {
    const property = await getPropertyById(propertyId);
    return c.json(property);
  } catch (e) {
    console.warn("Error in fetching property from SB database", e);
    return c.json(null, 404);
  }
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
properties.post("/", requireAuth, propertyValidator, async (c) => {
  const propertyBody: Omit<NewProperty, "user_id"> = c.req.valid("json");
  const sb = c.get("supabase");
  const user = c.get("user") as User;
  try {
    const property = await createProperty(sb, { ...propertyBody, user_id: user.id });
    return c.json(property, 201);
  } catch (e) {
    console.warn("error in inserting property into SB DB", e);
    return c.json(e, 500);
  }
});

// Extra: "Updaterande" av en Property PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
properties.patch("/:id", requireAuth, propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  const { user_id: _ignored, ...propertyBody }: Partial<Property> = c.req.valid("json");
  try {
    const property = await updatePropertyById(c.get("supabase"), propertyId, propertyBody);
    return c.json(property);
  } catch (e) {
    console.log("Error updating property in SB DB", e);
    return c.json({ message: "Property not found or you are not allowed to update it" }, 404);
  }
});

// Extra: "bortagning" av en Property DELETE om den finns tänk en GET som sedan tar bort 200/204
properties.delete("/:id", requireAuth, async (c) => {
  const propertyId = c.req.param("id") as string;
  try {
    await deletePropertyById(c.get("supabase"), propertyId);
    return c.json({ message: "Property deleted" }, 200);
  } catch (e) {
    console.warn("Error in deleting property", e);
    return c.json({ message: "Property not found or you are not allowed to delete it" }, 404);
  }
});
export default properties;
