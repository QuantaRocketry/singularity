import { Header } from "../utils/header";
import { SerialSelector } from "../utils/serial";

export default function Metrics() {
  return (
    <div className="flex flex-col p-5 space-y-5 h-full">
      <Header title="Metrics">
        <SerialSelector />
      </Header>
    </div>
  );
}
