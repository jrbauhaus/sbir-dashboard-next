import { SBIRApiService } from '@/lib/sbirService';
import { DiscussionView } from '@/app/components/DiscussionView';

interface PageProps {
  params: { id: string };
}

export default async function DiscussPage({ params }: PageProps) {
  const sbirService = new SBIRApiService();
  const solicitation = await sbirService.getSolicitation(params.id);

  return <DiscussionView id={params.id} solicitation={solicitation} />;
} 