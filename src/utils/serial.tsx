import { SerialSettingsDialog } from "@/components/header-widgets/serial-settings-dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { showError } from "../utils/error";

export function SerialSelector() {
  const [portSelect, setPortSelect] = useState<string | undefined>(undefined);
  const [ports, setPorts] = useState<string[]>([]);
  const [portConnected, setPortConnected] = useState(true);

  async function sendPort(p: string) {
    setPortSelect(p);
    invoke("set_port", { port: p })
      .then(() => {
        setPortConnected(true);
      })
      .catch((e) => {
        showError(e);
        setPortConnected(false);
      });
  }

  async function getAvailablePorts() {
    invoke("get_ports").then((v) => {
      setPorts(v as string[]);
    });
  }

  async function getActivePort() {
    invoke("get_active_port")
      .then((p) => {
        setPortSelect(p as string);
      })
      .catch((_) => {
        setPortSelect("");
      });
  }

  useEffect(() => {
    getActivePort();
    getAvailablePorts();
  }, []);

  useEffect(() => {}, [portSelect, ports]);

  return (
    <FieldGroup className="min-w-3xs">
      <Field>
        <Select
          onValueChange={(value) => {
            sendPort(value);
          }}
          value={portSelect}
        >
          <SelectTrigger aria-invalid={!portConnected}>
            <SelectValue placeholder="Select a port" />
          </SelectTrigger>
          <SelectContent position={"popper"}>
            <SelectGroup>
              {ports.length === 0 && (
                <SelectItem disabled value="null">
                  No ports available
                </SelectItem>
              )}
              {ports.map((port, index) => (
                <SelectItem key={index} value={port}>
                  {port}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}

export function Serial() {
  return (
    <div className="flex flex-row gap-2">
      <SerialSelector />
      <SerialSettingsDialog />
    </div>
  );
}
