// Run this script to geocode all addresses and generate the houses data
// Usage: node scripts/geocode-addresses.js YOUR_GOOGLE_MAPS_API_KEY

const https = require('https');

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('❌ Please provide your Google Maps API key as an argument');
  console.error('Usage: node scripts/geocode-addresses.js YOUR_GOOGLE_MAPS_API_KEY');
  process.exit(1);
}

const addresses = [
  "6109 Dedham Lane, Austin, TX 78739",
  "10508 Galsworthy Lane, Austin, TX 78739",
  "10842 Redmond Rd, Austin, TX 78739",
  "6502 Needham Lane, Austin, TX 78739",
  "10840 Redmond Rd, Austin, TX 78739",
  "6900 Hansa Loop, Austin, TX 78739",
  "6405 Needham Lane, Austin, TX 78739",
  "10105 Hibiscus Valley, Austin, TX 78739",
  "5113 Hibiscus Valley, Austin, TX 78739",
  "6406 Danvers Ct, Austin, TX 78739",
  "10823 Redmond Rd, Austin, TX 78739",
  "11301 Larue Belle Ln, Austin, TX 78739",
  "10904 Grassmere Ct, Austin, TX 78739",
  "9529 Hopeland Dr, Austin, TX 78749",
  "7912 Ladera Verde Drive, Austin, TX 78739",
  "7505 Doswell Lane, Austin, TX 78739",
  "7217 Lapin Lane, Austin, TX 78739",
  "7109 Doswell Lane, Austin, TX 78739",
  "6321 Carrington Lane, Austin, TX 78749",
  "6207 Back Bay Ln, Austin, TX 78739",
  "5904 Gorham Glen, Austin, TX 78739",
  "5817 Anselm Ct, Austin, TX 78739",
  "5380 Austral Loop, Austin, TX 78739",
  "5340 Austral Loop, Austin, TX 78739",
  "5309 Mandevilla Drive, Austin, TX 78739",
  "5124 Bluestar, Austin, TX 78739",
  "4525 Hibiscus Valley Drive, Austin, TX 78739",
  "11404 Viridian Lane, Austin, TX 78739",
  "11008 Pairnoy Lane, Austin, TX 78739",
  "10801 Redmond Cove, Austin, TX 78739",
  "11404 Maggiore Dr, Austin, TX 78739",
  "11108 Blissfield Cove, Austin, TX 78739",
  "11008 Marden Dr, Austin, TX 78739",
  "10801 Maelin Dr, Austin, TX 78739",
  "10208 Snapdragon Dr, Austin, TX 78739",
  "5209 Globe Mallow Dr, Austin, TX 78739",
  "7208 Tanaqua Ln, Austin, TX 78739",
  "10020 Broomflower Dr, Austin, TX 78739",
  "9221 Hopeland Dr, Austin, TX 78749",
  "9201 Hopeland Dr, Austin, TX 78749",
  "5620 Gorham Glen Ln, Austin, TX 78739",
  "11100 Pairnoy Ln, Austin, TX 78739",
  "11513 Hollister Dr, Austin, TX 78739",
];

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'OK' && json.results[0]) {
            const location = json.results[0].geometry.location;
            resolve({ lat: location.lat, lng: location.lng });
          } else {
            console.error(`⚠️  Failed to geocode: ${address} - ${json.status}`);
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🎄 Geocoding addresses for Christmas Lights Map...\n');
  
  const houses = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    process.stdout.write(`[${i + 1}/${addresses.length}] ${address}... `);
    
    const coords = await geocodeAddress(address);
    
    if (coords) {
      houses.push({
        id: String(i + 1),
        number: i + 1,
        address,
        lat: coords.lat,
        lng: coords.lng,
      });
      console.log(`✅ ${coords.lat}, ${coords.lng}`);
    } else {
      console.log('❌ FAILED');
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Generate the TypeScript file
  const tsContent = `// Pre-loaded house data with geocoded coordinates
// Generated on ${new Date().toISOString()}

export interface House {
  id: string;
  number: number;
  address: string;
  lat: number;
  lng: number;
}

export const houses: House[] = ${JSON.stringify(houses, null, 2)};
`;

  require('fs').writeFileSync('src/data/houses.ts', tsContent);
  
  console.log(`\n✅ Successfully geocoded ${houses.length}/${addresses.length} addresses!`);
  console.log('📁 Updated src/data/houses.ts');
}

main().catch(console.error);

