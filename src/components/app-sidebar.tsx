import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Settings,
  MapPinned,
  ChartSpline,
  TestTubeDiagonal,
  Home,
} from "lucide-react";
import { AiOutlineUsb } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const items = [
  {
    title: "Serial Monitor",
    url: "/",
    icon: AiOutlineUsb,
  },
  {
    title: "Map",
    url: "/locator",
    icon: MapPinned,
  },
  {
    title: "Metrics",
    url: "/metrics",
    icon: ChartSpline,
  },
  {
    title: "Device",
    url: "/device",
    icon: TestTubeDiagonal,
  },
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Singularity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
