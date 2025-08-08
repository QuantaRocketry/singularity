import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { showError } from "../utils/error";
import { SerialSelector } from "../utils/serial";
import { Header } from "../utils/header";

import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// const CESIUM_ION_ACCESS_TOKEN = import.meta.env["CESIUM_ION_ACCESS_TOKEN"] || '';
// Cesium.Ion.defaultAccessToken = CESIUM_ION_ACCESS_TOKEN;

const getOffsetPosition = (startPosition: Cesium.Cartesian3, east: number, north: number, up: number) => {
  const enuToFixed = Cesium.Transforms.eastNorthUpToFixedFrame(startPosition);
  const offsetVector = new Cesium.Cartesian3(east, north, up);
  const result = new Cesium.Cartesian3();

  return Cesium.Matrix4.multiplyByPoint(enuToFixed, offsetVector, result);
};

function Map() {
  const cesiumContainerRef = useRef(null);

  useEffect(() => {
    // Ensure the container exists before initializing Cesium
    if (cesiumContainerRef.current) {
      const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        terrain: Cesium.Terrain.fromWorldBathymetry(),
        timeline: false,  // Disables the timeline at the bottom
        animation: false, // Disables the animation control in the bottom left
      });

      viewer.scene.globe.enableLighting = false;

      const position = Cesium.Cartesian3.fromDegrees(149.917516, -31.148837, 330);

      let linePositions = [];
      const num_positions = 100
      for (let i = 0; i < num_positions; i++) {
        linePositions.push(getOffsetPosition(position, -i*2, i*1.5, (i/3)*(-i+num_positions-1)));
      }

      viewer.entities.add({
        name: 'Trajectory',
        polyline: {
          positions: linePositions,
          width: 5,
          material: Cesium.Color.RED,
          clampToGround: false
        },
      });

      const offset = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(45),
        Cesium.Math.toRadians(-20),
        150
      );

      viewer.camera.lookAt(position, offset);

      return () => {
        viewer.destroy();
      };
    }
  }, []);

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
