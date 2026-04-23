import { PageSkeleton } from "@/components/ui/page-skeleton";
export default function Loading() {
  return <PageSkeleton eyebrow="Operations" title="Tracked accounts." cols={3} rows={3} />;
}
