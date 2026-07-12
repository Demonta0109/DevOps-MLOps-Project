import NavBar from "../components/NavBar";
import PredictionForm from "../components/PredictionForm";

export default function Estimate() {
  return (
    <main className="app">
      <NavBar />
      <header className="app-header">
        <h1>Estimation de prix — Appartements Paris</h1>
        <p>Renseignez la surface, le nombre de pièces et la localisation pour obtenir une estimation.</p>
      </header>
      <PredictionForm />
    </main>
  );
}
