import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "../utils/error";

export function SerialSelector() {
  const [portSelect, setPortSelect] = useState("");
  const [ports, setPorts] = useState([""]);
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

  return (
    <div className="join">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendPort(portSelect);
        }}
      >
        <input
          className={
            "input input-bordered join-item w-40" +
            (portConnected ? "" : " input-error")
          }
          id="portInput"
          value={portSelect}
          onChange={(e) => setPortSelect(e.currentTarget.value)}
          placeholder="Select a port..."
        />
      </form>
      <div className="dropdown dropdown-end">
        <a
          tabIndex={0}
          role="button"
          className="btn btn-neutral join-item"
          onClick={() => {
            getAvailablePorts();
          }}
        >
          Port
        </a>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          {ports.map((p, index) => {
            return (
              <li key={index}>
                <a onClick={() => sendPort(p)}>{p}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
