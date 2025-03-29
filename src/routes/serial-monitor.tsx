import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { showError } from "../utils/error";
import { SerialSelector } from "../utils/serial";
import { Header } from "../utils/header";

function SerialStream() {
  const [content, setContent] = useState([""]);
  const [inputMessage, setInputMessage] = useState("");

  function appendContent(s: string) {
    setContent(content.concat([s]));
  }

  async function sendSerialMessage(s: string) {
    appendContent(s);
    setInputMessage("");
    invoke("send_serial_message", { message: s }).catch((e) => {
      showError(e);
    });
  }

  listen<string>("serial_message_received", () => {
    invoke("get_serial_content").then((c) => {
      setContent(c as string[]);
    });
  });

  useEffect(() => {
    invoke("get_serial_content").then((c) => {
      setContent(c as string[]);
    });
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [content]);

  return (
    <div className="card card-bordered card-compact shadow-md flex-grow">
      <div className="card-body flex flex-col h-0">
        <div ref={contentRef} className="flex-grow overflow-y-auto">
          {content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className="flex flex-row items-end">
          <form
            className="join mt-2 flex-grow"
            onSubmit={(e) => {
              e.preventDefault();
              sendSerialMessage(e.currentTarget.serialInput.value);
            }}
          >
            <input
              id="serialInput"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="input input-bordered join-item flex-grow"
              placeholder="Send a message..."
            />
            <button type="submit" className="btn btn-neutral join-item">
              Send
            </button>
          </form>

          <button
            className="btn btn-neutral ms-1"
            onClick={() =>
              (
                document.getElementById(
                  "serial-settings-modal"
                ) as HTMLDialogElement
              ).showModal()
            }
          >
            settings
          </button>
          <dialog id="serial-settings-modal" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Settings</h3>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Baud Rate</span>
                </div>
                <select
                  className="select select-bordered"
                  onChange={() => {
                    showError("unimplemented");
                  }}
                  defaultValue={0}
                >
                  <option disabled value={0}>
                    Select Baud Rate...
                  </option>
                  <option value={9600}>9600</option>
                  <option value={31250}>31250</option>
                  <option value={57600}>57600</option>
                  <option value={115200}>115200</option>
                  <option value={921600}>921600</option>
                </select>
              </label>
              <p className="py-4">
                Press ESC key or click the button below to close
              </p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
}

export default function SerialMonitor() {
  return (
    <div className="flex flex-col p-5 space-y-5 h-full">
      <Header title="Serial Monitor">
        <SerialSelector />
      </Header>
      <SerialStream />
    </div>
  );
}
