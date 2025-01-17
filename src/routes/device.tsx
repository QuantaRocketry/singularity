import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { AiOutlineUpload, AiOutlineHome, AiOutlineExperiment, AiOutlineUsb, AiOutlineDownload } from "react-icons/ai";
import { SerialSelector } from "../utils/serial";
import { showError } from "../utils/error";

function Header() {

  function BoardSelector() {
    const [boardSelect, setBoardSelect] = useState("");
    const [boardVariants, setBoardVarients] = useState([""])

    async function setBoard(board: string) {
      setBoardSelect(board);
      invoke("set_board_variant", { variant: board });
    }

    async function getBoardVariants() {
      let board_options = await invoke("get_board_variants");
      setBoardVarients(board_options as string[])
    }

    useEffect(() => {
      getBoardVariants();
      invoke("get_board_variant").then((b) => { setBoardSelect(b as string); })
    }, []);

    return (
      <div className="join">
        <form onSubmit={(e) => {
          e.preventDefault();
          setBoard(boardSelect)
        }}>
          <input
            className={"input input-bordered join-item w-40"}
            id="boardInput"
            value={boardSelect}
            onChange={(e) => setBoardSelect(e.currentTarget.value)}
            placeholder="Select a board..."
          />
        </form>
        <div className="dropdown dropdown-end">
          <a tabIndex={0} role="button" className="btn btn-neutral join-item" onClick={() => { getBoardVariants() }}>Board</a>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            {boardVariants.map((p) => { return <li><a onClick={(e) => setBoard(p)}>{p}</a></li> })}
          </ul>
        </div>

      </div>
    )
  }

  return (
    <div className="card card-bordered card-compact shadow-md">
      <div className="card-body flex flex-row items-center" >
        <h1 className="text-2xl">Device Management</h1>
        <div className="flex-grow" />
        <BoardSelector />
        <SerialSelector />
      </div>
    </div>
  )
}

function Options() {
  const [boardSelect, setBoardSelect] = useState(undefined);

  return (
    <div>
      <div className="card card-bordered card-compact shadow-md">
        <div className="card-body flex flex-column" >
          <h1 className="text-lg">LoRa</h1>
          <div className="divider m-0" />

          {/* Frequency */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Frequency (MHz)</span>
            </div>
            <input id="frequency-input" type="number" placeholder="Enter Frequency..." className="input input-bordered w-full max-w-xs" pattern="[0-9]*" />
          </label>

          {/* Spreading Factor */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Spreading Factor</span>
            </div>
            <select id="spread-factor-input" className="select select-bordered" defaultValue={0}>
              <option disabled value={0}>Select Spreading Factor...</option>
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
            <select id="bandwidth-input" className="select select-bordered" defaultValue={0}>
              <option disabled value={0}>Select Bandwidth...</option>
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
            </select >
          </label >
        </div >
      </div >
    </div >
  )
}

export default function Device() {
  async function upload() {
    let spreading_factor = Number((document.getElementById("spread-factor-input") as HTMLInputElement).value);
    let bandwidth = Number((document.getElementById("bandwidth-input") as HTMLInputElement).value);
    let frequency = Number((document.getElementById("frequency-input") as HTMLInputElement).value);
    let settings = {
      deployment: {
        apogee: false,
        apogee_delay: 0,
        main: false,
        main_altitude: 0,
      },
      lora: {
        frequency,
        bandwidth,
        spreading_factor,
        sync_word: 0,
        coding_rate: 0,
      },
    };
    console.log(settings);
    await invoke('upload_board_settings', { settings })
      .catch((e) => { showError(e); });
  }

  async function download() {
    await invoke('download_board_settings')
      .then((settings) => { showError(JSON.stringify(settings)) })
      .catch((e) => { showError(e); })
  }

  return (
    <div className="flex flex-col p-5 space-y-5 h-full overflow-scroll" style={{ position: "relative" }}>
      <Header />
      <Options />
      <div className="join" style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem" }} >
        <button className="btn btn-neutral join-item" onClick={() => { download() }}>
          <AiOutlineDownload />
        </button >
        <button className="btn btn-neutral join-item" onClick={() => { upload() }}>
          <AiOutlineUpload />
        </button >
      </div>
    </div>
  );
}
