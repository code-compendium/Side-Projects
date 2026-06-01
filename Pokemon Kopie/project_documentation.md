# Pokemon Project

## Purpose

This project is a simple Pokemon web application that allows users to view and search for Pokemon. It uses the PokeAPI to fetch Pokemon data and displays it in a user-friendly interface. The project is built using React and Vite, and it uses the PokeAPI to fetch Pokemon data and displays it in a user-friendly interface.

## Features

- View Pokemon data
- Search Pokemon by name
- View Pokemon details
- View Pokemon images
- View Pokemon types

## Tech Stack

- React
- Vite
- PokeAPI
- CSS

## Installation

```bash
npm create vite@latest my-pokemon-app -- --template react
cd my-pokemon-app
npm install
npm run dev
```

## Steps:

- 1. [Create HomePage.jsx](#1-create-homepagejsx)
- 2. [CSS Structure](#2-css-structure)
- 3. [pokemonApi.js](#3-pokemonapijs)

## 1. HomePage.jsx

Create `HomePage.jsx` in the `pages` folder and import it in the `App.jsx`

## 2. CSS Structure

In the styles folder, create `reset.css`, `variables.css` and `globals.css` and import them in `main.jsx` in that order

```css
/* `variables.css` */
:root {
  --color-background: #f5f5f5;
  --color-text: #222;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  --border-radius: 12px;
}
```

```css
/* `globals.css` */
@import "./variables.css";

body {
  background: var(--color-background);
  color: var(--color-text);

  font-family: Arial, sans-serif;
}
```

## 3. pokemonApi.js

Learning goal:

- Async/Await
- Fetch
- Error handling
- Guard clauses
- Separation UI & Data
- Why fetches don't belong in random components

In the `api` folder create `pokemonApi.js` with the following basic data:

```js
const API_BASE_URL = "https://pokeapi.co/api/v2";

export { API_BASE_URL };
```

Add additional code to `pokemonApi.js`to fetch the first 20 pokemon data.

```js
const API_BASE_URL = "https://pokeapi.co/api/v2";

export async function getPokemonList() {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=20`);

  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon list");
  }
  return response.json();
}

export { API_BASE_URL };
```

Add additional code to `HomePage.jsx` to fetch the first 20 pokemon data for **testing** purposes.

```jsx
import { useEffect } from "react";
import { getPokemonList } from "../api/pokemonApi";

export default function HomePage() {
  useEffect(() => {
    async function loadPokemon() {
      try {
        const data = await getPokemonList();

        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPokemon();
  }, []);

  return (
    <main>
      <h1>Pokédex</h1>
    </main>
  );
}
```

Note: try/catch block here because the `pokemonApi.js` throws errors and the `HomePage.jsx` decides what to do with it. This keeps the responsibilities separated. The `HomePage.jsx` could decide to show a toast, a banner, or just log the error to the console.
