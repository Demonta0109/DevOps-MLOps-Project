import PredictionForm from "./components/PredictionForm";

export default function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Estimation de prix — Appartements Paris</h1>
        <p>Renseignez la surface, le nombre de pièces et la localisation pour obtenir une estimation.</p>
      </header>
      <PredictionForm />
    </main>
  );
}
