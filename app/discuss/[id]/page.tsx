import { SBIRApiService } from '@/lib/sbirService';
import { DiscussionView } from '@/app/components/DiscussionView';

export default async function DiscussPage({ params }: { params: { id: string } }) {
  const sbirService = new SBIRApiService();
  const solicitation = await sbirService.getSolicitation(params.id);

  return <DiscussionView id={params.id} solicitation={solicitation} />;
} 