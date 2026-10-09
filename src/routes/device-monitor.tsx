import { EmptyPage } from "@/components/empty-page";
import { SerialControlWidget } from "@/components/header-widgets/serial-control";
import Page from "@/utils/page";

export default function DeviceMonitor() {
  return (
    <Page
      title="Device Monitor"
      widgets={[<SerialControlWidget />]}
      className="h-full w-full items-center content-center"
    >
      <EmptyPage />
    </Page>
  );
}
