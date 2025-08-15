import "cesium/Build/Cesium/Widgets/widgets.css";
import OnlineMap from "./locator/online-map";
import OfflineMap from "./locator/offline-map";
import Page from "@/utils/page";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "@/utils/error";

export default function Locator() {
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [ionAccessToken, setIonAccessToken] = useState<string | undefined>(
    undefined,
  );

  const load_token = () => {
    invoke("get_cesium_ion_token")
      .then((token) => {
        setIsOnline(true);
        setIonAccessToken(token as string);
      })
      .catch((_e) => {
        setIsOnline(false);

        showError(
          <p>
            No Cesium Ion access token. Please set a token in the{" "}
            <b>
              <u>
                <a href="/settings">Settings</a>
              </u>
            </b>{" "}
            page.
          </p>,
        );
      });
  };

  useEffect(() => {
    if (window.navigator.onLine) {
      load_token();
    } else {
      setIsOnline(false);
    }
  }, [window.navigator.onLine]);

  useEffect(() => {
    load_token();
    setPageLoaded(true);
  }, []);

  return (
    <Page title="Map" hasSerialSelector loaded={pageLoaded}>
      <div className="h-full flex flex-row">
        {isOnline ? (
          <OnlineMap ionAccessToken={ionAccessToken} />
        ) : (
          <OfflineMap />
        )}
      </div>
    </Page>
  );
}
