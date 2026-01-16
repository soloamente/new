Solo
soloamente
オンライン

これはチャンネル「#cruscotto-pratiche」の始まりです。
Sandro — 13:00

# Guida API Backend - Cruscotto Pratiche

Questa guida fornisce le informazioni essenziali per integrare il frontend con le API del backend.

## 1. Panoramica

Il sistema è **multi-tenant** basato su "Studi". Ogni utente appartiene a uno Studio (eccetto i superadmin).
展開
GUIDA_API.md
3 KB
Sandro — 13:17
URL BASE : https://cruscotto-pratiche-api-production.up.railway.app/
Sandro — 14:28
Utenti di Test (Seeder)
Tutti gli utenti hanno password: password

Super Admin (DATAWEB)
admin@dataweb.it

Studio Legale Rossi
Admin: admin.studiolegalerossi@example.com
Operatori:
op1.studiolegalerossi@example.com
op2.studiolegalerossi@example.com
op3.studiolegalerossi@example.com
op4.studiolegalerossi@example.com

Studio Notarile Bianchi
Admin: admin.studionotarilebianchi@example.com
Operatori:
op1.studionotarilebianchi@example.com
...
Sandro — 14:45

## 6. Schema Database (Frontend Reference)

Di seguito i modelli principali e i tipi di dati che ti puoi aspettare nelle risposte JSON.

### User (Utente)

| Campo | Tipo | Note |
| :---- | :--- | :--- |

展開
message.txt
3 KB
Sandro — 15:23
SuperAdmin ( DATAWEB ):
Gestione studi
Statistiche
Admin ( amministratore_studio ):
Gestione operatori
Tutte le pratiche
Statistiche
Operatore :
Le tue pratiche
Tutte le pratiche
Statistiche

﻿

## 6. Schema Database (Frontend Reference)

Di seguito i modelli principali e i tipi di dati che ti puoi aspettare nelle risposte JSON.

### User (Utente)

| Campo        | Tipo     | Note                                       |
| :----------- | :------- | :----------------------------------------- |
| `id`         | Integer  | ID univoco                                 |
| `name`       | String   | Nome completo                              |
| `email`      | String   | Email (login)                              |
| `role_id`    | Integer  | FK Ruolo (1=DATAWEB, 2=ADMIN, 3=OPERATORE) |
| `studio_id`  | Integer  | FK Studio di appartenenza                  |
| `status`     | String   | 'active' o altro                           |
| `created_at` | DateTime |                                            |

**Esempio JSON**:

```json
{
  "id": 5,
  "name": "Mario Rossi",
  "email": "mario@studio.it",
  "role_id": 3,
  "studio_id": 1,
  "status": "active"
}
```

### Studio

| Campo        | Tipo    | Note        |
| :----------- | :------ | :---------- |
| `id`         | Integer | ID univoco  |
| `name`       | String  | Nome Studio |
| `city`       | String  | CittÃ       |
| `vat_number` | String  | Partita IVA |

**Esempio JSON**:

```json
{
  "id": 1,
  "name": "Studio Legale Rossi",
  "city": "Milano",
  "vat_number": "12345678901"
}
```

### Practice (Pratica)

| Campo             | Tipo    | Note                                                 |
| :---------------- | :------ | :--------------------------------------------------- |
| `id`              | Integer | ID univoco                                           |
| `studio_id`       | Integer | FK Studio                                            |
| `assigned_to`     | Integer | FK Utente (Operatore)                                |
| `client_id`       | Integer | FK Cliente                                           |
| `practice_number` | String  | Numero formattato (es. "01/2025")                    |
| `year`            | Integer | Anno di riferimento                                  |
| `number`          | Integer | Progressivo annuale                                  |
| `type`            | String  | Tipo pratica (es. "Mutuo")                           |
| `status`          | String  | 'assegnata', 'in lavorazione', 'conclusa', 'sospesa' |
| `notes`           | String  | Testo libero (opzionale)                             |

**Esempio JSON**:

```json
{
  "id": 10,
  "practice_number": "05/2025",
  "year": 2025,
  "number": 5,
  "type": "Mutuo",
  "status": "in lavorazione",
  "client": { "id": 50, "name": "Luigi Verdi" },
  "operator": { "id": 3, "name": "Operatore 1" }
}
```

### Client (Cliente)

| Campo       | Tipo    | Note                            |
| :---------- | :------ | :------------------------------ |
| `id`        | Integer | ID univoco                      |
| `studio_id` | Integer | FK Studio                       |
| `name`      | String  | Nome completo / Ragione Sociale |
| `email`     | String  | Email contatto (opzionale)      |
| `phone`     | String  | Telefono (opzionale)            |

**Esempio JSON**:

```json
{
  "id": 50,
  "name": "Luigi Verdi",
  "email": "luigi@test.it",
  "phone": "+39 333 1234567"
}
```
