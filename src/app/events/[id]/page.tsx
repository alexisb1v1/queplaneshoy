import EventDetailPage from "../../features/events/ui/event-detail-page";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailPage id={id} />;
}
