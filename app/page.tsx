import { SolicitationTable } from './components/SolicitationTable'; // Use relative import
import { Box } from '@mui/material'; // Import Box for layout
import { WaitlistForm } from '@/components/WaitlistForm'; // Import the new component

// Revalidate the page data periodically (e.g., every hour)
// Or use { next: { revalidate: 3600 } } in fetch if using fetch API directly
// export const revalidate = 3600; // This will be handled by the fetch revalidate option

export default async function HomePage() {
  // const sbirService = new SBIRApiService();
  // const topics = await sbirService.getActiveTopics();

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/solicitations`, {
    next: { revalidate: 3600 }, // Revalidates this specific fetch every hour
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    console.error(`[HomePage Server Component] Failed to load SBIR topics: ${res.status}, ${await res.text()}`);
    throw new Error(`Failed to load SBIR topics: ${res.status}`);
  }
 
  const topics = await res.json();

  // Log fetched data on the server
  console.log(`[HomePage Server Component] Fetched ${Array.isArray(topics) ? topics.length : '0'} active topics from API.`);

  return (
    <main>
      {/* ADDED: Waitlist form styled as a top banner */}
      <Box sx={{
          bgcolor: 'primary.dark', // Use theme color (adjust if needed)
          color: 'common.white',
          textAlign: 'center',
          py: 2 // Vertical padding (adjust as needed)
          // Add px if horizontal padding is desired inside the banner
      }}>
        <WaitlistForm />
      </Box>

      {/* Header with Logo */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        pt: { xs: 2, sm: 3 }, 
        pb: { xs: 1, sm: 2 },
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none'
      }}>
        <Box
          component="img"
          src="/sbir_dasboard-logo.png"
          alt="SBIR Dashboard Logo"
          sx={{ 
            height: '50px', 
            width: 'auto',
            filter: 'none'
          }}
        />
      </Box>

      {/* Main content table */}
      <SolicitationTable topics={topics} />
    </main>
  );
}
