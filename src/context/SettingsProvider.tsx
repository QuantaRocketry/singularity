import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { DeviceSettings } from "./settings/Device";
import { SerialSettings } from "./settings/Serial";

interface SettingsContextInterface {
  theme: string;
  setTheme: (theme: string) => void;
  deviceSettings: DeviceSettings | undefined;
  setDeviceSettings: Dispatch<SetStateAction<DeviceSettings | undefined>>;
  serialSettings: SerialSettings | undefined;
  setSerialSettings: Dispatch<SetStateAction<SerialSettings | undefined>>;
}

export const SettingsContext = createContext<SettingsContextInterface>({
  theme: localStorage.getItem("theme") || "dark",
  setTheme: () => { },
  deviceSettings: undefined,
  setDeviceSettings: () => { },
  serialSettings: undefined,
  setSerialSettings: () => { },
});

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [deviceSettings, setDeviceSettings] = useState<
    DeviceSettings | undefined
  >(undefined);
  const [serialSettings, setSerialSettings] = useState<
    SerialSettings | undefined
  >(undefined);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{ theme, setTheme, deviceSettings, setDeviceSettings, serialSettings, setSerialSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
