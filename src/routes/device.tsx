import { useEffect, useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AiOutlineUpload, AiOutlineDownload } from "react-icons/ai";
import { SerialSelector } from "../utils/serial";
import { showError } from "../utils/error";
import { DeviceSettings } from "../context/settings/Device";
import { DeploymentOptions, LoraOptions } from "../utils/options";
import { SettingsContext } from "../context/SettingsProvider";
import { Header } from "../utils/header";

function DeviceSelector() {
  const { deviceSettings, setDeviceSettings } = useContext(SettingsContext);
  const [deviceVariants, setDeviceVariants] = useState([""]);

  async function setDevice(device: string) {
    await invoke("set_device_variant", { device });
    invoke("get_device_settings")
      .then((s) => {
        setDeviceSettings(s as DeviceSettings);
      })
      .catch((e) => showError(e));
  }

  async function getDeviceVariants() {
    let board_options = await invoke("get_device_variants");
    board_options = (board_options as DeviceSettings[]).map(
      (b) => b.type as string
    );
    setDeviceVariants(board_options as string[]);
  }

  useEffect(() => {
    getDeviceVariants();
  }, []);

  return (
    <div className="join">
      <input
        className={"input input-bordered join-item w-40"}
        id="boardInput"
        value={deviceSettings ? deviceSettings.type : undefined}
        onChange={(e) => setDevice(e.currentTarget.value)}
        placeholder="Select a device..."
      />
      <div className="dropdown dropdown-end">
        <a
          tabIndex={0}
          role="button"
          className="btn btn-neutral join-item"
          onClick={() => {
            getDeviceVariants();
          }}
        >
          Device
        </a>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          {deviceVariants.map((p) => {
            return (
              <li>
                <a onClick={() => setDevice(p)}>{p}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Options() {
  const { deviceSettings } = useContext(SettingsContext);

  if (!deviceSettings) {
    return (
      <div className="flex flex-grow justify-center">
        <div className="content-center">
          Please select a device or download device settings from a connected
          device.
        </div>
      </div>
    );
  }

  return (
    <div>
      {deviceSettings && "lora" in deviceSettings.data && <LoraOptions />}
      {deviceSettings && "deployment" in deviceSettings.data && (
        <DeploymentOptions />
      )}
    </div>
  );
}

export default function Device() {
  const { deviceSettings, setDeviceSettings } = useContext(SettingsContext);

  async function upload() {
    console.log(deviceSettings);
    await invoke("upload_device_settings", { settings: deviceSettings }).catch(
      (e) => {
        showError(e);
      }
    );
  }

  async function download() {
    await invoke("download_device_settings")
      .then((settings) => {
        setDeviceSettings(settings as DeviceSettings);
      })
      .catch((e) => {
        showError(e);
      });
  }

  return (
    <div
      className="flex flex-col p-5 space-y-5 h-full overflow-scroll"
      style={{ position: "relative" }}
    >
      <Header title="Device Management">
        <DeviceSelector />
        <SerialSelector />
      </Header>
      <Options />
      <div
        className="join"
        style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem" }}
      >
        <button
          className="btn btn-neutral join-item"
          onClick={() => {
            download();
          }}
        >
          <AiOutlineDownload />
        </button>
        <button
          className="btn btn-neutral join-item"
          onClick={() => {
            upload();
          }}
        >
          <AiOutlineUpload />
        </button>
      </div>
    </div>
  );
}
