export default function RouteErrorBoundary({ error }) {
  const is404 = error?.message?.includes("Not found") || error?.status === 404;

  return (
    <div className="route-error">
      <h2>{is404 ? "404 — Pokémon niet gevonden" : "Er ging iets mis"}</h2>
      <p>{error?.message || "Onbekende fout"}</p>
      <a href="/">← Terug naar overzicht</a>
    </div>
  );
}
