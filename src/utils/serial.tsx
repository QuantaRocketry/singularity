import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "../utils/error";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AiOutlineSetting } from "react-icons/ai";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function SerialSettings() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Settings">
            <AiOutlineSetting />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Serial Settings</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </Field>
            <Field>
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export function Serial() {
  return (
    <div className="flex flex-row gap-2">
      <SerialSelector />
      <SerialSettings />
    </div>
  );
}
