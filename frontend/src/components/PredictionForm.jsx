import { useState } from "react";
import AddressSearch from "./AddressSearch";
import LocationMap from "./LocationMap";
import { apiClient } from "../api/client";

const initialFormState = {
  surface: "",
  pieces: "",
};

export default function PredictionForm() {
  const [form, setForm] = useState(initialFormState);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressSelect(suggestion) {
    setLocation(suggestion);
  }

  function handleMapLocationChange(newLocation) {
    setLocation(newLocation);
  }

  const isFormValid =
    Number(form.surface) > 0 && Number(form.pieces) > 0 && location?.postcode;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!isFormValid) {
      setError(
        "Merci de renseigner la surface, le nombre de pièces et une localisation avec code postal."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const prediction = await apiClient.predict({
        surface: Number(form.surface),
        pieces: Number(form.pieces),
        lat: location.lat,
        lon: location.lon,
        code_postal: location.postcode,
      });
      setResult(prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="surface">Surface (m²)</label>
        <input
          id="surface"
          name="surface"
          type="number"
          min="1"
          value={form.surface}
          onChange={handleFieldChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="pieces">Nombre de pièces</label>
        <input
          id="pieces"
          name="pieces"
          type="number"
          min="1"
          value={form.pieces}
          onChange={handleFieldChange}
          required
        />
      </div>

      <AddressSearch onSelect={handleAddressSelect} />
      <LocationMap position={location} onLocationChange={handleMapLocationChange} />

      {location && (
        <p className="location-summary">
          Localisation : {location.label ?? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`}
          {location.postcode ? ` (${location.postcode})` : " — code postal introuvable"}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Estimation en cours..." : "Estimer le prix"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-card">
          <span className="result-label">Prix estimé</span>
          <span className="result-value">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(result.prix_estime)}
          </span>
        </div>
      )}
    </form>
  );
}
