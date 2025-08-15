import { useState, useEffect, useRef } from "react";
import { SerialSelector } from "../utils/serial";
import { Header } from "../utils/header";

import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const CESIUM_ION_ACCESS_TOKEN: string = import.meta.env["VITE_CESIUM_ION_ACCESS_TOKEN"] || null;
if (CESIUM_ION_ACCESS_TOKEN) {
  Cesium.Ion.defaultAccessToken = CESIUM_ION_ACCESS_TOKEN;
}

const getOffsetPosition = (startPosition: Cesium.Cartesian3, east: number, north: number, up: number) => {
  const enuToFixed = Cesium.Transforms.eastNorthUpToFixedFrame(startPosition);
  const offsetVector = new Cesium.Cartesian3(east, north, up);
  const result = new Cesium.Cartesian3();

  return Cesium.Matrix4.multiplyByPoint(enuToFixed, offsetVector, result);
};

let cesiumViewer: Cesium.Viewer | null = null;
let trajectoryEntity: Cesium.Entity | null = null;

function updateTrajectory(newPositions: Cesium.Cartesian3[]) {
  if (!cesiumViewer)
    return;

  if (newPositions.length < 2)
    return;

  if (!trajectoryEntity || !trajectoryEntity.polyline) {
    trajectoryEntity = cesiumViewer.entities.add({
      name: 'Trajectory',
      polyline: {
        positions: newPositions,
        width: 5,
        material: Cesium.Color.RED,
        clampToGround: false
      },
    });
  }
  else {
    const polyline = trajectoryEntity.polyline as Cesium.PolylineGraphics;
    polyline.positions = new Cesium.ConstantProperty(newPositions);
  }
}

function Map() {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);

  // Mock trajectory
  const [seconds, setSeconds] = useState(0);
  const [linePositions, setLinePositions] = useState<Cesium.Cartesian3[]>([]);

  useEffect(() => {
    if (cesiumContainerRef.current) {
      if (!cesiumViewer) {
        cesiumViewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          timeline: false,  // Disables the timeline at the bottom
          animation: false, // Disables the animation control in the bottom left
        });
      }
      else {
        if (cesiumContainerRef.current.contains(cesiumViewer.container) === false) {
          cesiumContainerRef.current.appendChild(cesiumViewer.container);
        }
      }

      cesiumViewer.scene.globe.enableLighting = false;

      // Build mock positions
      let positions = [];
      const initial_position = Cesium.Cartesian3.fromDegrees(149.917516, -31.148837, 330);
      const num_positions = 100
      for (let i = 0; i < num_positions; i++) {
        positions.push(getOffsetPosition(initial_position, -i * 2, i * 1.5, (i / 3) * (-i + num_positions - 1)));
      }
      setLinePositions(() => positions);

      const offset = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(45),
        Cesium.Math.toRadians(-20),
        150
      );
      cesiumViewer.camera.lookAt(initial_position, offset);
    };

    return () => { };
  }, []);

  // Mock trajectory update
  useEffect(() => {
    if (seconds > 100)
      return;

    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
      updateTrajectory(linePositions.slice(0, seconds));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div className="card card-bordered card-compact shadow-md flex-grow">
      <div className="card-body flex flex-col h-0 p-0">
        <div ref={cesiumContainerRef} className="h-full w-full rounded-xl overflow-hidden" />
      </div>
    </div>
  );
}

export default function LiveMap() {
  return (
    <div className="flex flex-col p-5 space-y-5 h-full">
      <Header title="Live Map">
        <SerialSelector />
      </Header>
      <Map />
    </div>
  );
}
