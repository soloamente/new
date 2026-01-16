# API Documentation - OPERATORE

**Base URL**: `https://cruscotto-pratiche-api-production.up.railway.app/`

## 1. Autenticazione
Tutte le chiamate richiedono header: `Authorization: Bearer <token>` (eccetto Login).

### Login
**POST** `/api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", ... }`

### Profilo Utente
**POST** `/api/auth/me`
- **Response**: Dati utente corrente (role: `OPERATORE`).

---

## 2. Gestione Pratiche
### Elenco Pratiche (Tutte)
**GET** `/api/practices`
- **Response**: Tutte le pratiche dello studio.

### Elenco Pratiche (Mie)
**GET** `/api/practices?assigned_to_me=true`
- **Response**: Solo le pratiche assegnate a te.

### Crea Pratica
**POST** `/api/practices`
- **Body**:
  ```json
  {
    "assigned_to": 5,            // ID Operatore (Puoi mettere il tuo ID)
    "client": "Cliente SRL",     // Nome Cliente (Obbligatorio)
    "client_email": "info@c.it", // Opzionale
    "client_phone": "333...",    // Opzionale
    "type": "Consulenza",        // Obbligatorio
    "status": "assegnata",       // Obbligatorio
    "notes": "..."               // Opzionale
  }
  ```

### Modifica Pratica
**PUT** `/api/practices/{id}`
- **Body**: Stessi campi della creazione (tutti opzionali).

### Dettaglio Pratica
**GET** `/api/practices/{id}`

---

## 3. Gestione Clienti
### Elenco Clienti
**GET** `/api/clients`
- **Query Param**: `?search=nome` (Opzionale).
- **Response**: Elenco clienti dello studio.
