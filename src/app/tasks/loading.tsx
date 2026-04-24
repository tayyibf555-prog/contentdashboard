import { PageSkeleton } from "@/components/ui/page-skeleton";
export default function Loading() {
  return <PageSkeleton eyebrow="Workflow" title="Tasks." cols={4} rows={2} />;
}
