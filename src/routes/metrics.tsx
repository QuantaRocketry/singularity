import { EmptyPage } from "@/components/empty-page";
import Page from "@/utils/page";

export default function Metrics() {
  return (
    <Page
      title="Metrics"
      hasSerialSelector
      className="h-full w-full items-center content-center"
    >
      <EmptyPage />
    </Page>
  );
}
