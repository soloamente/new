# API Documentation - DATAWEB (SuperAdmin)

**Base URL**: `https://cruscotto-pratiche-api-production.up.railway.app/`

## 1. Autenticazione
Tutte le chiamate richiedono header: `Authorization: Bearer <token>` (eccetto Login).

### Login
**POST** `/api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", ... }`

### Profilo Utente
**POST** `/api/auth/me`
- **Response**: Dati utente corrente (role: `DATAWEB`).

### Logout
**POST** `/api/auth/logout`

---

## 2. Gestione Studi
### Elenco Studi
**GET** `/api/studios`
- **Response**: Array di oggetti Studio.
- **Campi Extra**: Ogni oggetto Studio include:
  - `admin`: Oggetto User (Amministratore dello studio).
  - `operators`: Array di oggetti User (Operatori dello studio).

### Crea Studio
**POST** `/api/studios`
- **Body**:
  ```json
  {
    "name": "Nome Studio",       // Obbligatorio, Univoco
    "city": "Milano",            // Opzionale
    "vat_number": "IT123..."     // Opzionale
  }
  ```
- **Response**: Oggetto Studio creato.

---

## 3. Gestione Utenti
### Elenco Utenti
**GET** `/api/users`
- **Response**: Tutti gli utenti del sistema.

### Crea Utente (Admin Studio)
**POST** `/api/users`
- **Descrizione**: Crea un nuovo Amministratore di Studio e contestualmente crea il relativo Studio.
- **Body**:
  ```json
  {
    "name": "Admin Name",
    "email": "admin@studio.it",
    "password": "password",
    "role_id": 2,                // 2 = AMMINISTRATORE_STUDIO
    "studio_name": "Nuovo Studio", // Obbligatorio: Crea il nuovo studio
    "studio_city": "Roma",         // Opzionale
    "studio_vat_number": "..."     // Opzionale
  }
  ```
- **Nota**: Non è possibile associare un Admin a uno studio esistente tramite questo endpoint. La creazione di un Admin implica sempre la creazione del suo Studio.
