import { SBIRApiService } from '@/lib/sbirService';
import { DiscussionView } from '@/app/components/DiscussionView';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function DiscussPage({ params }: Props) {
  const sbirService = new SBIRApiService();
  const solicitation = await sbirService.getSolicitation(params.id);

  return <DiscussionView id={params.id} solicitation={solicitation} />;
} 