# Contact Management System – MERN Stack

A **Contact Management System** built with **MongoDB, Express, React, Node.js** (MERN stack).

Features **add, update, delete, search, filter contacts** with a modern UI.

---

## Table of Contents

- [Demo](#demo)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Backend Setup](#backend-setup)  
- [Frontend Setup](#frontend-setup)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [File-by-File Instructions](#file-by-file-instructions)  

---

## Demo

- Clean dashboard for contacts  
- Add new contacts with **status**  
- Filter by status and search by name/company  
- Smooth updates without page reload  
- 5-second loading animation on load

---

## Features

- Add, update, delete contacts  
- Filter by **Interested, Follow-up, Closed**  
- Search by **name** or **company**  
- Status changes update UI instantly  
- Modern card-style responsive layout  
- Loading animation for smooth UX

---

## Tech Stack

- **Frontend:** React, Axios, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB (Atlas or local)  
- **Others:** npm, CORS

---

## Installation

### Backend Setup

```
cd backend
npm init -y
npm install express mongoose cors dotenv nodemon
```
Express is a Node.js framework that makes it easy to create servers, handle routes, and manage HTTP requests.

Mongoose is a library that connects Node.js to MongoDB and lets you define data models easily.

CORS is a middleware that allows your frontend to access backend APIs from a different origin.

Dotenv is a library that loads environment variables from a .env file to keep sensitive info safe.

Nodemon is a tool that automatically restarts your Node.js server whenever backend code changes.



- Create a `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=<Your MongoDB Atlas URI>
```

- Run the backend server:

```
npm run dev
```

- Server runs on **http://localhost:5000**

---

### Frontend Setup

```bash
npm create vite@latest frontend
cd frontend
npm install
npm install axios
npm install tailwindcss @tailwindcss/vite
```

- Configure the Vite plugin

### File name - *vite.config.js*

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

- Import Tailwind CSS

### File name - *index.css*

@import "tailwindcss";

- Run the frontend:

```bash
npm run dev
```

- Frontend runs on **http://localhost:5173** (Vite default)

---

## Usage

1. Open the app in your browser.  
2. Add a new contact with **name, company, email, phone, status**.  
3. Filter contacts by **status** dropdown.  
4. Search contacts by **name or company**.  
5. Update the **status** of a contact directly from the card.  
6. Delete contacts using the **Delete** button.  
7. Enjoy smooth UX with **1-second minimum loading**.

---

## Folder Structure

```
simple-crm/
├── backend/
│   ├── models/           # Mongoose schema
│   ├── routes/           # Express routes
│   ├── server.js         # Entry point
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/   # ContactForm.jsx, ContactList.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
```

---

## File-by-File Instructions

### Backend Files

1. **server.js**

```
backend/server.js
```
- Contains Express setup, MongoDB connection, and route mounting.

2. **models/Contact.js**

```
backend/models/Contact.js
```
- Define the **Contact schema** with `name, company, email, phone, status`.

3. **routes/contactRoutes.js**

```
backend/routes/contactRoutes.js
```
- Contains **GET, POST, PUT, DELETE** routes for contacts.

---

### Frontend Files

1. **App.jsx**

```
frontend/src/App.jsx
```
- Main React component. Handles **state, filters, search, loading**. Renders `ContactForm` and `ContactList`.

2. **components/ContactForm.jsx**

```
frontend/src/components/ContactForm.jsx
```
- Form to **add new contacts**. Updates local state immediately.

3. **components/ContactList.jsx**

```
frontend/src/components/ContactList.jsx
```
- Displays **all contacts in cards**. Handles **status change** and **delete**. Uses `loading` state to prevent flicker.

4. **main.jsx**

```
frontend/src/main.jsx
```
- Entry point of React app. Renders `<App />` into the DOM.

### Notes

- **MongoDB Atlas recommended** for easy setup.  
- No authentication yet - CRM for demo/tutorial purposes.  
- UI is built with **Tailwind CSS** for quick styling.  
- Works best on **modern browsers**.