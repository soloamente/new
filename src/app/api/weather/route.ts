import { NextRequest, NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * API route per ottenere i dati meteo da OpenWeatherMap
 * GET /api/weather?lat={latitude}&lon={longitude}
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica che la chiave API sia configurata
    if (!OPENWEATHER_API_KEY) {
      console.error("OPENWEATHER_API_KEY non configurata");
      return NextResponse.json(
        { error: "Configurazione API meteo mancante" },
        { status: 500 }
      );
    }

    // Ottieni latitudine e longitudine dai query params
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitudine e longitudine sono richieste" },
        { status: 400 }
      );
    }

    // Chiama l'API di OpenWeatherMap
    const url = new URL(OPENWEATHER_API_URL);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("appid", OPENWEATHER_API_KEY);
    url.searchParams.set("units", "metric"); // Usa Celsius
    url.searchParams.set("lang", "it"); // Lingua italiana

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache per 5 minuti
    });

    if (!response.ok) {
      // Prova a ottenere i dati di errore
      let errorData: { message?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        try {
          const text = await response.text();
          errorData = { message: text || "Errore sconosciuto" };
        } catch {
          errorData = { message: "Errore sconosciuto" };
        }
      }
      
      console.error("Errore API OpenWeatherMap:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      // Messaggi di errore più specifici
      let errorMessage = "Errore nel recupero dei dati meteo";
      if (response.status === 401) {
        errorMessage = "Chiave API non valida";
      } else if (response.status === 429) {
        errorMessage = "Troppe richieste, riprova più tardi";
      } else if (response.status === 404) {
        errorMessage = "Posizione non trovata";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Errore nella route meteo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
