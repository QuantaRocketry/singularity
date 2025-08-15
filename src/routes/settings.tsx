import Page from "@/utils/page";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "@/utils/error";
import { useEffect, useState } from "react";
import { ThemeSelector } from "./settings/theme-selector";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Settings() {
  const [keyInput, setKeyInput] = useState<string | undefined>(undefined);
  const [showKey, setShowKey] = useState(false); // New state
  const [pageLoaded, setPageLoaded] = useState(false);

  async function handleSumbit(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload
    invoke("set_cesium_ion_token", { token: keyInput }).catch((e) => {
      showError(e);
    });
  }

  async function getSettings() {
    invoke("get_cesium_ion_token")
      .then((token) => {
        setKeyInput(token as string);
        setPageLoaded(true);
      })
      .catch((e) => {
        showError(
          <>
            <p>Failed to retrieve settings.</p>
            <p>{e}</p>
          </>,
        );
      });
  }

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <Page title="Settings" loaded={pageLoaded}>
      <form className="gap-4 max-w-2xl px-4 py-8" onSubmit={handleSumbit}>
        <FieldGroup>
          <ThemeSelector />
          <FieldSet>
            <FieldGroup>
              <Field className="w-fit">
                <FieldLabel htmlFor="input-cesium-api-key">
                  Cesium API Key
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="input-cesium-api-key"
                    type={showKey ? "text" : "password"}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="sk-..."
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeIcon /> : <EyeOffIcon />}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field>
            <div>
              <Button type="submit">Submit</Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </Page>
  );
}
