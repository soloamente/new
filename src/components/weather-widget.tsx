"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  day: string;
  date: string;
  condition: string;
  temperature: number;
  icon: string;
  city: string;
}

interface WeatherWidgetProps {
  className?: string;
}

// Funzione per ottenere l'icona meteo in base al codice OpenWeatherMap
function getWeatherIcon(iconCode: string) {
  // OpenWeatherMap icon codes: https://openweathermap.org/weather-conditions
  const icon = iconCode.slice(0, 2); // Prendi i primi 2 caratteri (es. "01", "02", etc.)
  
  switch (icon) {
    case "01": // clear sky
      return Sun;
    case "02": // few clouds
      return CloudSun;
    case "03": // scattered clouds
    case "04": // broken clouds
      return Cloud;
    case "09": // shower rain
    case "10": // rain
      return CloudRain;
    case "11": // thunderstorm
      return CloudRain;
    case "13": // snow
      return CloudSnow;
    case "50": // mist
      return Cloud;
    default:
      return Sun;
  }
}

// Funzione per tradurre la condizione meteo in italiano
function translateCondition(condition: string): string {
  const translations: Record<string, string> = {
    "clear sky": "Sereno",
    "few clouds": "Poco nuvoloso",
    "scattered clouds": "Nuvoloso",
    "broken clouds": "Molto nuvoloso",
    "shower rain": "Pioggia",
    "rain": "Pioggia",
    "thunderstorm": "Temporale",
    "snow": "Neve",
    "mist": "Nebbia",
    "fog": "Nebbia",
    "haze": "Foschia",
  };
  
  return translations[condition.toLowerCase()] || condition;
}

// Funzione per formattare la data
function formatDate(date: Date): { day: string; date: string } {
  const days = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];
  
  const months = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ];
  
  const dayIndex = date.getDay();
  const monthIndex = date.getMonth();
  const day = days[dayIndex]!; // getDay() always returns 0-6
  const dayNum = date.getDate();
  const month = months[monthIndex]!; // getMonth() always returns 0-11
  const year = date.getFullYear();
  
  return {
    day,
    date: `${dayNum} ${month}, ${year}`,
  };
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Assicura che il componente venga renderizzato solo sul client
    setIsMounted(true);

    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);

        // Ottieni la posizione dell'utente
        let latitude: number;
        let longitude: number;

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error("Geolocalizzazione non supportata"));
                return;
              }
              
              navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                  // Gestisci errori di geolocalizzazione
                  let errorMessage = "Errore di geolocalizzazione";
                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      errorMessage = "Permesso di geolocalizzazione negato";
                      break;
                    case error.POSITION_UNAVAILABLE:
                      errorMessage = "Posizione non disponibile";
                      break;
                    case error.TIMEOUT:
                      errorMessage = "Timeout nella geolocalizzazione";
                      break;
                  }
                  reject(new Error(errorMessage));
                },
                { 
                  timeout: 10000, 
                  maximumAge: 300000, // Cache per 5 minuti
                  enableHighAccuracy: false // Non richiedere alta precisione per essere più veloce
                }
              );
            }
          );
          ({ latitude, longitude } = position.coords);
          console.log("Posizione ottenuta da geolocalizzazione:", { latitude, longitude });
        } catch (geoError) {
          // Se la geolocalizzazione fallisce, prova a ottenere la posizione tramite IP
          console.warn("Geolocalizzazione fallita, provo geolocalizzazione IP:", geoError);
          try {
            const ipResponse = await fetch("/api/geolocation");
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              if (ipData.latitude && ipData.longitude) {
                latitude = ipData.latitude;
                longitude = ipData.longitude;
                console.log("Posizione ottenuta da IP:", { latitude, longitude });
              } else {
                throw new Error("Dati di geolocalizzazione IP non validi");
              }
            } else {
              throw new Error("Errore nel recupero della posizione IP");
            }
          } catch (ipError) {
            // Se anche la geolocalizzazione IP fallisce, usa una posizione di default (Roma)
            console.warn("Geolocalizzazione IP fallita, uso posizione di default:", ipError);
            latitude = 41.9028; // Roma
            longitude = 12.4964;
          }
        }

        // Chiama l'API meteo
        const response = await fetch(
          `/api/weather?lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = 
            errorData.error || 
            `Errore ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Verifica che i dati siano validi
        if (!data.weather || !Array.isArray(data.weather) || !data.main) {
          throw new Error("Dati meteo non validi");
        }

        // Formatta i dati
        const now = new Date();
        const { day, date } = formatDate(now);
        const IconComponent = getWeatherIcon(data.weather[0].icon);
        const condition = translateCondition(data.weather[0].description);

        // Converti da Celsius a Fahrenheit
        const tempFahrenheit = Math.round((data.main.temp * 9) / 5 + 32);

        setWeather({
          day,
          date,
          condition,
          temperature: tempFahrenheit,
          icon: data.weather[0].icon,
          city: data.name || "Posizione sconosciuta",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
        console.error("Errore nel recupero del meteo:", errorMessage, err);
        setError(errorMessage);
        
        // Fallback: mostra data e giorno anche senza meteo
        const now = new Date();
        const { day, date } = formatDate(now);
        setWeather({
          day,
          date,
          condition: "—",
          temperature: 0, // 0°F nel fallback
          icon: "01d",
          city: "Posizione sconosciuta",
        });
        
        // Annuncia l'errore agli screen reader
        if (typeof window !== "undefined") {
          const announcement = document.createElement("div");
          announcement.setAttribute("role", "alert");
          announcement.setAttribute("aria-live", "assertive");
          announcement.className = "sr-only";
          announcement.textContent = `Errore nel caricamento del meteo: ${errorMessage}`;
          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 1000);
        }
      } finally {
        setIsLoading(false);
      }
    }

    // Esegui il fetch solo dopo il mount
    fetchWeather();
  }, []); // Esegui solo una volta al mount

  // Non renderizzare nulla sul server per evitare hydration mismatch
  if (!isMounted) {
    return (
      <div
        role="region"
        aria-label="Widget meteo"
        className={cn(
          "flex items-center gap-3 rounded-lg",
          className
        )}
      >
        <div className="h-12 w-12 rounded bg-sidebar-secondary" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 rounded bg-sidebar-secondary" />
          <div className="h-3 w-32 rounded bg-sidebar-secondary" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        role="region"
        aria-label="Widget meteo"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          "flex items-center gap-3 rounded-lg",
          className
        )}
      >
        <div className="h-12 w-12 animate-pulse rounded bg-sidebar-secondary" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 animate-pulse rounded bg-sidebar-secondary" />
          <div className="h-3 w-32 animate-pulse rounded bg-sidebar-secondary" />
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const IconComponent = getWeatherIcon(weather.icon);

  return (
    <div
      role="region"
      aria-label="Widget meteo"
      className={cn(
        "flex items-start gap-3 rounded-lg",
        className
      )}
    >
      {/* Icona meteo */}
      <div className="shrink-0">
        <IconComponent
          size={48}
          className="text-sidebar-primary"
          strokeWidth={1.5}
          aria-label={`Icona meteo: ${weather.condition}`}
        />
      </div>

      {/* Informazioni meteo */}
      <div className="flex flex-col gap-0.5">
        {/* Giorno della settimana - più prominente */}
        <div className="text-sidebar-primary text-base font-semibold leading-none">
          {weather.day}
        </div>

        {/* Data - più piccola e grigio chiaro */}
        <div className="text-sidebar-secondary text-sm leading-none">
          {weather.date}
        </div>

        {/* Condizione e temperatura - stessa riga */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sidebar-secondary text-sm leading-none">
            {weather.condition}
          </span>
          {weather.temperature > 0 && (
            <>
              {/* Piccola icona sole come separatore */}
              {/* <Sun
                size={12}
                className="text-sidebar-secondary"
                strokeWidth={2}
                aria-hidden="true"
              /> */}
               <span className="text-sidebar-secondary size-1 bg-sidebar-secondary rounded-full" aria-hidden="true" />
       
              <span className="text-sidebar-secondary text-sm leading-none">
                {weather.temperature}°C
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
