const ADDRESS_API_URL = "https://api-adresse.data.gouv.fr";

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];

  const response = await fetch(
    `${ADDRESS_API_URL}/search/?q=${encodeURIComponent(query)}&limit=5`
  );
  if (!response.ok) throw new Error("Erreur de géocodage");

  const data = await response.json();
  return data.features.map((feature) => ({
    label: feature.properties.label,
    postcode: feature.properties.postcode,
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
  }));
}

export async function reverseGeocode(lat, lon) {
  const response = await fetch(
    `${ADDRESS_API_URL}/reverse/?lon=${lon}&lat=${lat}`
  );
  if (!response.ok) throw new Error("Erreur de géocodage inverse");

  const data = await response.json();
  const feature = data.features[0];
  if (!feature) return null;

  return {
    label: feature.properties.label,
    postcode: feature.properties.postcode,
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
  };
}
