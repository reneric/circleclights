export async function geocodeAddress(
  address: string,
  geocoder: google.maps.Geocoder
): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        console.warn(`Geocoding failed for address: ${address}`, status);
        resolve(null);
      }
    });
  });
}

export async function geocodeAddresses(
  addresses: string[],
  geocoder: google.maps.Geocoder,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map<string, { lat: number; lng: number }>();
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const coords = await geocodeAddress(address, geocoder);
    if (coords) {
      results.set(address, coords);
    }
    onProgress?.(i + 1, addresses.length);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }
  
  return results;
}

