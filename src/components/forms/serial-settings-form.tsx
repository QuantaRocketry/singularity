import { Field, FieldGroup, FieldTitle } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const baud_rates = ["9600", "115200", "2000000"];

const serialSettingsFormSchema = z.object({
  baudRate: z.enum(baud_rates),
});

export type SerialSettingsValues = z.infer<typeof serialSettingsFormSchema>;

export function SerialSettingsForm({
  id,
  onSubmit,
  defaultValues,
}: {
  id: string;
  onSubmit: (data: SerialSettingsValues) => void;
  defaultValues?: Partial<SerialSettingsValues>;
}) {
  const form = useForm<SerialSettingsValues>({
    resolver: zodResolver(serialSettingsFormSchema),
    values: {
      baudRate: defaultValues?.baudRate || "115200",
    },
  });

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="baudRate"
          control={form.control}
          render={({ field }) => (
            <Field orientation={"responsive"}>
              <FieldTitle>Baud Rate</FieldTitle>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent position={"popper"}>
                  <SelectGroup>
                    {baud_rates.map((br, index) => (
                      <SelectItem key={index} value={br.toString()}>
                        {br}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
