import { SBIRApiService } from '@/lib/sbirService';
import { DiscussionView } from '@/app/components/DiscussionView';

export default async function DiscussPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const sbirService = new SBIRApiService();
  const solicitation = await sbirService.getSolicitation(id);

  return <DiscussionView id={id} solicitation={solicitation} />;
} 