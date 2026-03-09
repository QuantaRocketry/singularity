import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SerialControlWidget } from "../components/header-widgets/serial-control";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function Page({
  title,
  hasSerialSelector = false,
  loaded = true,
  children,
  className,
}: React.ComponentProps<"div"> & {
  title: string;
  hasSerialSelector?: boolean;
  loaded?: boolean;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <header className="flex flex-row h-16 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 p-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1>{title}</h1>
          <div className="grow" />
          {hasSerialSelector && <SerialControlWidget />}
        </header>
        <main
          className={cn("grow overflow-y-auto p-4 pt-0 relative", className)}
        >
          {loaded ? (
            <>{children}</>
          ) : (
            <div className={"flex h-full w-full items-center"}>
              <Spinner className="size-8" />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
