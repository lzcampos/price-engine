import { NICHE_KEYS, type NicheKey } from "./types.js";

/** Exact-match aliases (English and Spanish free-text niches map to internal keys). */
const ALIASES: Record<string, NicheKey> = {
  lifestyle: "lifestyle",
  fitness: "fitness",
  cocina: "cooking",
  cooking: "cooking",
  food: "food",
  gastronomía: "food",
  gastronomia: "food",
  recetas: "food",
  wellness: "wellness",
  wellbeing: "wellness",
  bienestar: "wellness",
  "salud mental": "mental_health",
  "mental health": "mental_health",
  mental_health: "mental_health",
  psicología: "mental_health",
  psicologia: "mental_health",
  finance: "finance",
  finanzas: "finance",
  "finanzas personales": "finance",
  fintech: "finance",
  tech: "tech",
  tecnología: "tech",
  tecnologia: "tech",
  gaming: "gaming",
  videojuegos: "gaming",
  beauty: "beauty",
  belleza: "beauty",
  travel: "travel",
  viajes: "travel",
};

export function normalizeNicheKey(raw: string): NicheKey {
  const key = raw.trim().toLowerCase();
  if ((NICHE_KEYS as readonly string[]).includes(key)) {
    return key as NicheKey;
  }
  const direct = ALIASES[key];
  if (direct) return direct;

  if (key.includes("mental health") || key.includes("salud mental")) {
    return "mental_health";
  }
  if (
    key.includes("wellbeing") ||
    key.includes("wellness") ||
    key.includes("bienestar")
  ) {
    return "wellness";
  }
  if (
    key.includes("gastronom") ||
    key.includes("receta") ||
    key.includes("cocina") ||
    key.includes("food") ||
    key.includes("cooking")
  ) {
    return "food";
  }
  if (
    key.includes("gaming") ||
    key.includes("videojuego") ||
    key.includes("esports")
  ) {
    return "gaming";
  }
  if (
    key.includes("finance") ||
    key.includes("finanz") ||
    key.includes("fintech") ||
    key.includes("invers")
  ) {
    return "finance";
  }
  if (key.includes("fitness")) return "fitness";
  if (key.includes("viaje") || key.includes("travel")) return "travel";
  if (key.includes("bellez") || key.includes("beauty")) return "beauty";
  if (key.includes("tech") || key.includes("tecnolog")) return "tech";

  return "other";
}
