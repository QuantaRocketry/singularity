import themes from "@/utils/themes";
import { useSettingsContext } from "@/context/SettingsProvider";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeSelector() {
  const { setTheme, theme: currentTheme } = useSettingsContext();

  return (
    <Field className="w-fit">
      <FieldLabel>Theme</FieldLabel>
      <Select
        onValueChange={(value) => {
          setTheme(value);
        }}
        value={currentTheme}
      >
        <SelectTrigger>
          <SelectValue placeholder={currentTheme} />
        </SelectTrigger>
        <SelectContent position={"popper"}>
          <SelectGroup>
            {themes.length === 0 && (
              <SelectItem disabled value="null">
                No ports available
              </SelectItem>
            )}
            {themes.map((t, index) => (
              <SelectItem key={index} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
