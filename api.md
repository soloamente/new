
# Guida API Backend - Cruscotto Pratiche

Questa guida fornisce le informazioni essenziali per integrare il frontend con le API del backend.

## 1. Panoramica

Il sistema è **multi-tenant** basato su "Studi". Ogni utente appartiene a uno Studio (eccetto i superadmin).
Le risposte sono in formato JSON.

### Tipologie di Utenti (Ruoli)

Il sistema prevede 3 livelli di accesso:

1.  **DATAWEB**: Super Admin (Gestione globale).
2.  **AMMINISTRATORE_STUDIO**: Admin dello Studio (Gestisce utenti e pratiche del proprio studio).
3.  **OPERATORE**: Utente operativo (Gestisce le pratiche assegnate o del proprio studio).

---

## 2. Autenticazione (JWT)

Tutte le chiamate API (eccetto il login) richiedono l'header:
`Authorization: Bearer <access_token>`

### Login

**POST** `/api/auth/login`

- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Risposta (200 OK)**:
  ```json
  {
    "access_token": "eyJ0eXAi...",
    "token_type": "bearer",
    "expires_in": 3600
  }
  ```

### Utente Corrente

**POST** `/api/auth/me`

- **Risposta**: Restituisce i dati dell'utente loggato, incluso il `role` e `studio_id`.

### Refresh Token

**POST** `/api/auth/refresh`

- **Risposta**: Nuovo token.

### Logout

**POST** `/api/auth/logout`

---

## 3. Gestione Pratiche

Endpoint principale: `/api/practices`

### Elenco Pratiche

**GET** `/api/practices`

- Restituisce tutte le pratiche visibili all'utente (filtrate per Studio).
- Include le relazioni: `operator` (chi la gestisce) e `client` (cliente associato).

### Creazione Pratica

**POST** `/api/practices`

- **Body**:
  ```json
  {
    "assigned_to": 123, // ID Utente (Operatore)
    "client": "Mario Rossi", // Nome Cliente (Se nuovo, viene creato)
    "client_email": "m@r.it", // Opzionale
    "client_phone": "333...", // Opzionale
    "type": "Cessione Quote", // Tipo pratica
    "status": "assegnata", // Stati: assegnata, in lavorazione, conclusa, sospesa
    "notes": "Note opzionali"
  }
  ```
- **Logica**: Se il cliente esiste già (per nome nello stesso studio), viene aggiornato con email/telefono se forniti. Altrimenti ne viene creato uno nuovo.
- **Risposta (201 Created)**: Oggetto pratica creato.

### Dettaglio Pratica

**GET** `/api/practices/{id}`

### Modifica Pratica

**PUT** `/api/practices/{id}`

- **Body**: Stessi campi della creazione (tutti opzionali).
  ```json
  {
    "status": "in lavorazione",
    "notes": "Aggiornamento note..."
  }
  ```

---

## 4. Altre Risorse

CRUD standard disponibili per:

- **Clienti**: `/api/clients`
- **Utenti**: `/api/users` (Solo Admin)
- **Studi**: `/api/studios` (Solo SuperAdmin)

### Note Importanti

- **Errori**: In caso di errore (es. validazione), il server risponde con status 4xx/5xx e un JSON contenente `message` o `errors`.
- **Date**: Formato standard ISO o `Y-m-d H:i:s`.
