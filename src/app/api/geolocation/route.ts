import { NextRequest, NextResponse } from "next/server";

/**
 * API route per ottenere la posizione geografica basata sull'IP
 * GET /api/geolocation
 * 
 * Usa un servizio gratuito di geolocalizzazione IP come fallback
 * quando la geolocalizzazione del browser non è disponibile
 */
export async function GET(request: NextRequest) {
  try {
    // Ottieni l'IP del client dalla richiesta
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || request.ip || "";

    // Usa ip-api.com (servizio gratuito, max 45 richieste/minuto)
    // Alternativa: usare ipapi.co o altri servizi simili
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip || ""}?fields=status,message,lat,lon,city,country`
    );

    if (!geoResponse.ok) {
      throw new Error("Errore nel servizio di geolocalizzazione IP");
    }

    const data = await geoResponse.json();

    if (data.status === "fail") {
      throw new Error(data.message || "Errore nella geolocalizzazione IP");
    }

    if (!data.lat || !data.lon) {
      throw new Error("Coordinate non disponibili");
    }

    return NextResponse.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || "Posizione sconosciuta",
      country: data.country || "",
    });
  } catch (error) {
    console.error("Errore nella geolocalizzazione IP:", error);
    return NextResponse.json(
      { error: "Impossibile determinare la posizione" },
      { status: 500 }
    );
  }
}
