# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## Widget Meteo

Il widget meteo nella sidebar richiede una chiave API di OpenWeatherMap per funzionare.

### Configurazione

1. Registrati su [OpenWeatherMap](https://openweathermap.org/api) e ottieni una chiave API gratuita
2. Aggiungi la variabile d'ambiente nel file `.env`:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Il widget:
- Mostra il giorno della settimana, la data, la condizione meteo e la temperatura
- Utilizza la geolocalizzazione del browser per determinare la posizione
- Richiede il permesso di geolocalizzazione all'utente al primo utilizzo
- Mostra un fallback con solo data e giorno se la geolocalizzazione non è disponibile

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
