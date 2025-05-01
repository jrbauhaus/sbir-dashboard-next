import { SBIRApiService } from '@/lib/sbirService';
import { SolicitationTable } from './components/SolicitationTable'; // Use relative import
import { Box } from '@mui/material'; // Import Box for layout
import { WaitlistForm } from '@/components/WaitlistForm'; // Import the new component

// Revalidate the page data periodically (e.g., every hour)
// Or use { next: { revalidate: 3600 } } in fetch if using fetch API directly
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const sbirService = new SBIRApiService();
  const topics = await sbirService.getActiveTopics();

  // Log fetched data on the server
  console.log(`[HomePage Server Component] Fetched ${topics.length} active topics`);

  return (
    <main>
      {/* Header */}
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

      {/* Main content - ADD WaitlistForm HERE */}
      <Box sx={{ px: 2, pt: 2 }}> {/* Add some padding */} 
        <WaitlistForm />
      </Box>
      <SolicitationTable topics={topics} />
    </main>
  );
}
