import { useState } from "react";
// import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Page from "@/utils/page";
import PlotCard from "@/components/cards/plot";
export default function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <Page
      title="Home">
      <div>
        <div className="flex flex-col">
          <h1>Welcome to Tauri!</h1>

          <div className="join" >
            <input
              className="input input-bordered join-item"
              id="greet-input"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <button className="btn btn-primary join-item" onClick={() => { greet() }}>Greet</button>
          </div>

          <p>{greetMsg}</p>

          <PlotCard />
        </div>
      </div>
    </Page>
  );
}
