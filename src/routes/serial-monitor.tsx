import { useState, useEffect, useRef } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";

function SerialSelector(){
  const [portSelect, setPortSelect] = useState("");
  const [ports, setPorts] = useState(["/dev/usb1", "/dev/usb2"])

  async function sendPort(p: string) {
    setPortSelect(p);
  }

  async function getAvailablePorts() {
    await invoke("get-available-ports").then((v)=> {setPorts(v as string[] )});
  }

  return (
    <div className="join">
      <form onSubmit={(e) => {
        e.preventDefault();
        sendPort(portSelect)
      }}>
        <input
          className="input input-bordered join-item"
          id="portInput"
          value={portSelect}
          onChange={(e) => setPortSelect(e.currentTarget.value)}
          placeholder="Enter a port..."
        />
      </form>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-neutral join-item">Port</div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {ports.map((p)=>{return <li><a onClick={(e) => sendPort(p)}>{p}</a></li>})}
        </ul>
      </div>
    </div>
  )
}


function SerialStream() {
  const [content, setContent] = useState("A\nA\nA\nA\nA\nA\nA");
  const [inputMessage, setInputMessage] = useState("");
  
  async function sendSerialMessage(s: string) {
    setContent(content + '\n' + s)
    setInputMessage("");
  }

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
          {content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <form className="join mt-2"
          onSubmit={(e)=>{e.preventDefault();sendSerialMessage(e.currentTarget.serialInput.value)}}
        >
          <input
            id="serialInput"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="input input-bordered join-item flex-grow"
            placeholder="Send a message..."
          />
          <button
            type="submit"
            className="btn btn-neutral join-item"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SerialMonitor() {
  return (
    <div className="flex flex-col p-5 space-y-5 h-full">
      <div className="card card-bordered card-compact shadow-md">
        <div className="card-body flex flex-row items-center" >
          <h1 className="text-xl ml-2">Serial Monitor</h1>
          <div className="flex-grow" />
          <SerialSelector />
        </div>
      </div>
      <SerialStream />
    </div>
  );
}
