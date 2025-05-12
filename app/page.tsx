import { SolicitationTable } from './components/SolicitationTable'; // Use relative import
import { Box } from '@mui/material'; // Import Box for layout
import { WaitlistForm } from '@/components/WaitlistForm'; // Import the new component
import { headers } from 'next/headers'; // Import headers

export const dynamic = 'force-dynamic';

// Revalidate the page data periodically (e.g., every hour)
// Or use { next: { revalidate: 3600 } } in fetch if using fetch API directly
// export const revalidate = 3600; // This will be handled by the fetch revalidate option

export default async function HomePage() {
  // const sbirService = new SBIRApiService();
  // const topics = await sbirService.getActiveTopics();

  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // const isVercelBuild = !!process.env.VERCEL; // Removed old logic
  // const baseUrl = isVercelBuild // Removed old logic
  //   ? 'http://localhost:3000' 
  //   : typeof window === 'undefined'
  //     ? 'http://localhost:3000' 
  //     : '';

  // const fetchUrl = `${baseUrl}/api/solicitations`; 
  // console.log('[DEBUG] Fetching topics from:', fetchUrl); 

  const res = await fetch(`${baseUrl}/api/solicitations`, {
    cache: 'no-store', // Ensures we always hit our API route, which has its own cache
  });

  if (!res.ok) {
    // const errorText = await res.text(); 
    // console.error(`[HomePage Server Component] Failed to load SBIR topics: ${res.status}, Response: ${errorText}`);
    throw new Error(`Failed to fetch solicitations: ${res.status}`); // Updated error message
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
