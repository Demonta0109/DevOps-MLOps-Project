import { useEffect, useRef, useState } from "react";
import { searchAddress } from "../api/geocoding";

const DEBOUNCE_MS = 300;

export default function AddressSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
        setIsOpen(true);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(suggestion) {
    setQuery(suggestion.label);
    setIsOpen(false);
    onSelect(suggestion);
  }

  return (
    <div className="address-search">
      <label htmlFor="address-input">Adresse</label>
      <input
        id="address-input"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Tapez une adresse à Paris..."
        autoComplete="off"
      />
      {error && <p className="error-text">{error}</p>}
      {isOpen && suggestions.length > 0 && (
        <ul className="address-suggestions">
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.lat}-${suggestion.lon}`}>
              <button type="button" onMouseDown={() => handleSelect(suggestion)}>
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
