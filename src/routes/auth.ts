import { Hono } from "hono";
import { authValidator } from "../validators/authValidator.js";

const auth = new Hono({
  strict: false,
});

auth.post("/register", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const sb = c.get("supabase");
    const { error, data } = await sb.auth.signUp({
      email,
      password,
    });
    if (!error) {
      return c.json(
        {
          user: data.user,
        },
        201,
      );
    }
    throw error;
  } catch (e: any) {
    console.warn("Error in registering", e);
    return c.json(
      {
        message: e?.message,
      },
      400,
    );
  }
});

auth.post("/login", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const sb = c.get("supabase");
    const { error, data } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      return c.json({
        user: data.user,
      });
    }
    throw error;
  } catch (e: any) {
    console.warn("Error in registering", e);
    return c.json(
      {
        message: e?.message,
      },
      400,
    );
  }
});

auth.post("/logout", async (c) => {
  try {
    const sb = c.get("supabase");
    const { error } = await sb.auth.signOut();
    if (error) {
      throw error;
    }
    return c.json({ message: "logged out" });
  } catch (e: any) {
    console.warn("Error in logging out", e);
    return c.json({ message: e?.message }, 400);
  }
});

auth.get("/me", (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "unauthorized" }, 401);
  }

  return c.json({ user });
});

export default auth;
