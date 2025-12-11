# API Documentation - AMMINISTRATORE STUDIO

**Base URL**: `https://cruscotto-pratiche-api.onrender.com/`

## 1. Autenticazione
Tutte le chiamate richiedono header: `Authorization: Bearer <token>` (eccetto Login).

### Login
**POST** `/api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", ... }`

### Profilo Utente
**POST** `/api/auth/me`
- **Response**: Dati utente corrente (role: `AMMINISTRATORE_STUDIO`).

---

## 2. Gestione Utenti (Operatori)
### Elenco Operatori
**GET** `/api/users`
- **Response**: Restituisce solo gli **Operatori** del tuo studio.

### Crea Operatore
**POST** `/api/users`
- **Body**:
  ```json
  {
    "name": "Mario Rossi",
    "email": "mario@studio.it",
    "password": "password",
    "role_id": 3                 // 3 = OPERATORE (Obbligatorio)
  }
  ```
- **Note**: Lo `studio_id` viene assegnato automaticamente (lo stesso dell'admin).

---

## 3. Gestione Pratiche
### Elenco Pratiche
**GET** `/api/practices`
- **Response**: Tutte le pratiche dello studio.
- **Include**: `operator`, `client`.

### Crea Pratica
**POST** `/api/practices`
- **Body**:
  ```json
  {
    "assigned_to": 5,            // ID Operatore (Obbligatorio)
    "client": "Cliente SRL",     // Nome Cliente (Obbligatorio)
    "client_email": "info@c.it", // Opzionale
    "client_phone": "333...",    // Opzionale
    "type": "Consulenza",        // Obbligatorio
    "status": "assegnata",       // Obbligatorio: assegnata, in lavorazione, conclusa, sospesa
    "notes": "..."               // Opzionale
  }
  ```
- **Note**: Se il cliente non esiste, viene creato.

### Modifica Pratica
**PUT** `/api/practices/{id}`
- **Body**: Stessi campi della creazione (tutti opzionali).

### Dettaglio Pratica
**GET** `/api/practices/{id}`

---

## 4. Gestione Clienti
### Elenco Clienti
**GET** `/api/clients`
- **Query Param**: `?search=nome` (Opzionale, per filtrare).
- **Response**: Elenco clienti dello studio.
