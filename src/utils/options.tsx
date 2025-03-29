import { useContext } from "react";
import { DeviceSettings } from "../context/settings/Device";
import { SettingsContext } from "../context/SettingsProvider";
import { showError } from "./error";

export function LoraOptions() {
  const { deviceSettings, setDeviceSettings } = useContext(SettingsContext);

  if (!deviceSettings || !("lora" in deviceSettings.data)) {
    showError("Failed to load LoRa settings.");
    return <div>Failed to load LoRa settings.</div>; // Or handle other cases
  }

  const loraSettings = deviceSettings.data.lora;

  const updateLoRaSetting = (key: keyof typeof loraSettings, value: any) => {
    if (setDeviceSettings) {
      if (deviceSettings && "lora" in deviceSettings.data) {
        setDeviceSettings({
          ...deviceSettings,
          data: {
            lora: {
              ...deviceSettings.data.lora,
              [key]: value,
            },
          },
        } as DeviceSettings);
      }
    }
  };

  return (
    <div>
      <div className="card card-bordered card-compact shadow-md">
        <div className="card-body flex flex-column">
          <h1 className="text-lg">LoRa</h1>
          <div className="divider m-0" />

          {/* Frequency */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Frequency (Hz)</span>
            </div>
            <input
              id="frequency-input"
              type="number"
              placeholder="Enter Frequency..."
              className="input input-bordered w-full max-w-xs"
              pattern="[0-9]*"
              onChange={(event) => {
                updateLoRaSetting("frequency", event.target.value);
              }}
              value={
                loraSettings.frequency ? loraSettings.frequency : undefined
              }
            />
          </label>

          {/* Spreading Factor */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Spreading Factor</span>
            </div>
            <select
              id="spread-factor-input"
              className="select select-bordered"
              defaultValue={loraSettings.spreading_factor}
              onChange={(event) => {
                updateLoRaSetting("spreading_factor", event.target.value);
              }}
            >
              <option disabled value={0}>
                Select Spreading Factor...
              </option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
            </select>
          </label>

          {/* Bandwidth */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Bandwidth</span>
            </div>
            <select
              id="bandwidth-input"
              className="select select-bordered"
              defaultValue={loraSettings.bandwidth}
              onChange={(event) => {
                updateLoRaSetting("bandwidth", event.target.value);
              }}
            >
              <option disabled value={0}>
                Select Bandwidth...
              </option>
              <option value={7800}>7.8 KHz</option>
              <option value={10400}>10.4 KHz</option>
              <option value={15600}>15.6 KHz</option>
              <option value={20800}>20.8 KHz</option>
              <option value={31250}>31.25 KHz</option>
              <option value={41700}>41.7 KHz</option>
              <option value={62500}>62.5 KHz</option>
              <option value={125000}>125 KHz</option>
              <option value={250000}>250 KHz</option>
              <option value={500000}>500 KHz</option>
            </select>
          </label>

          {/* Coding Rate */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Coding Rate</span>
            </div>
            <select
              id="cr-input"
              className="select select-bordered"
              defaultValue={loraSettings.coding_rate}
              onChange={(event) => {
                updateLoRaSetting("coding_rate", event.target.value);
              }}
            >
              <option disabled value={0}>
                Select Coding Rate...
              </option>
              <option value={5}>4/5</option>
              <option value={6}>4/6</option>
              <option value={7}>4/7</option>
              <option value={8}>4/8</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export function DeploymentOptions() {
  const { deviceSettings, setDeviceSettings } = useContext(SettingsContext);

  if (!deviceSettings || !("deployment" in deviceSettings.data)) {
    showError("Failed to load Deployment settings.");
    return <div>Failed to load Deployment settings.</div>; // Or handle other cases
  }

  const deploymentSettings = deviceSettings.data.deployment;

  const updateDeploymentSetting = (
    key: keyof typeof deploymentSettings,
    value: any
  ) => {
    if (setDeviceSettings) {
      if (deviceSettings && "deployment" in deviceSettings.data) {
        setDeviceSettings({
          ...deviceSettings,
          data: {
            deployment: {
              ...deviceSettings.data.deployment,
              [key]: value,
            },
          },
        } as DeviceSettings);
      }
    }
  };

  // export interface DeploymentSettings {
  //   apogee: boolean;
  //   main: boolean;
  //   apogee_delay: number;
  //   main_altitude: number;
  // }

  return (
    <div>
      <div className="card card-bordered card-compact shadow-md">
        <div className="card-body flex flex-column">
          <h1 className="text-lg">Deployment</h1>
          <div className="divider m-0" />

          {/* Apogee Toggle */}
          <div className="flex flex-row space-x-3">
            <h2 className="text-balance">Deploy Drogue at Apogee</h2>
            <input
              type="checkbox"
              defaultChecked
              className="toggle toggle-success toggle-sm"
              checked={deploymentSettings.apogee}
              onChange={(e) => {
                updateDeploymentSetting("apogee", e.target.checked);
              }}
            />
          </div>

          {/* Apogee Delay */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Apogee Delay (seconds)</span>
            </div>
            <input
              id="delay-input"
              type="number"
              placeholder="Enter Delay..."
              className="input input-bordered w-full max-w-xs"
              pattern="[0-9]*"
              onChange={(event) => {
                updateDeploymentSetting("apogee_delay", event.target.value);
              }}
              value={
                deploymentSettings.apogee_delay
                  ? deploymentSettings.apogee_delay
                  : undefined
              }
            />
          </label>

          <div className="divider m-0" />

          {/* Main Toggle */}
          <div className="flex flex-row space-x-3">
            <h2 className="text-balance">Deploy Main</h2>
            <input
              type="checkbox"
              defaultChecked
              className="toggle toggle-success toggle-sm"
              checked={deploymentSettings.main}
              onChange={(e) => {
                updateDeploymentSetting("main", e.target.checked);
              }}
            />
          </div>

          {/* Main Altitude */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Main Deployment Altitude (metres)
              </span>
            </div>
            <input
              id="main-alt-input"
              type="number"
              placeholder="Enter Altitude..."
              className="input input-bordered w-full max-w-xs"
              pattern="[0-9]*"
              onChange={(event) => {
                updateDeploymentSetting("main_altitude", event.target.value);
              }}
              value={
                deploymentSettings.main_altitude
                  ? deploymentSettings.main_altitude
                  : undefined
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}
