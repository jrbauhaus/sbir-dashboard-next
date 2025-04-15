import { SBIRApiService } from '@/lib/sbirService';
import { SolicitationTable } from './components/SolicitationTable'; // Use relative import
import { Box } from '@mui/material'; // Import Box for layout

// Revalidate the page data periodically (e.g., every hour)
// Or use { next: { revalidate: 3600 } } in fetch if using fetch API directly
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const sbirService = new SBIRApiService();
  const solicitations = await sbirService.getActiveSolicitationsWithTopics('DOD');

  // Log fetched data on the server
  console.log(`[HomePage Server Component] Fetched ${solicitations.length} solicitations`);

  return (
    <main>
      {/* --- Header --- (Consider moving to a layout component) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 2, sm: 3, md: 4 }, mb: 4, bgcolor: 'grey.900' }}>
         {/* Assuming logo is in public folder */}
         <Box
           component="img"
           src="/sbir_dasboard-logo.png" // Make sure this path is correct in public/
           alt="SBIR Dashboard Logo"
           sx={{ maxHeight: '60px', width: 'auto' }}
         />
       </Box>

      {/* Render the client component, passing data */}
      <SolicitationTable solicitations={solicitations} />
    </main>
  );
}
