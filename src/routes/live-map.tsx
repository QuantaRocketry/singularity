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

      const positions = [[0., 0., 0.],
      [1., 1., 33.],
      [2., 2., 65.33333333],
      [3., 3., 97.],
      [4., 4., 128.],
      [5., 5., 158.33333333],
      [6., 6., 188.],
      [7., 7., 217.],
      [8., 8., 245.33333333],
      [9., 9., 273.],
      [10., 10., 300.],
      [11., 11., 326.33333333],
      [12., 12., 352.],
      [13., 13., 377.],
      [14., 14., 401.33333333],
      [15., 15., 425.],
      [16., 16., 448.],
      [17., 17., 470.33333333],
      [18., 18., 492.],
      [19., 19., 513.],
      [20., 20., 533.33333333],
      [21., 21., 553.],
      [22., 22., 572.],
      [23., 23., 590.33333333],
      [24., 24., 608.],
      [25., 25., 625.],
      [26., 26., 641.33333333],
      [27., 27., 657.],
      [28., 28., 672.],
      [29., 29., 686.33333333],
      [30., 30., 700.],
      [31., 31., 713.],
      [32., 32., 725.33333333],
      [33., 33., 737.],
      [34., 34., 748.],
      [35., 35., 758.33333333],
      [36., 36., 768.],
      [37., 37., 777.],
      [38., 38., 785.33333333],
      [39., 39., 793.],
      [40., 40., 800.],
      [41., 41., 806.33333333],
      [42., 42., 812.],
      [43., 43., 817.],
      [44., 44., 821.33333333],
      [45., 45., 825.],
      [46., 46., 828.],
      [47., 47., 830.33333333],
      [48., 48., 832.],
      [49., 49., 833.],
      [50., 50., 833.33333333],
      [51., 51., 833.],
      [52., 52., 832.],
      [53., 53., 830.33333333],
      [54., 54., 828.],
      [55., 55., 825.],
      [56., 56., 821.33333333],
      [57., 57., 817.],
      [58., 58., 812.],
      [59., 59., 806.33333333],
      [60., 60., 800.],
      [61., 61., 793.],
      [62., 62., 785.33333333],
      [63., 63., 777.],
      [64., 64., 768.],
      [65., 65., 758.33333333],
      [66., 66., 748.],
      [67., 67., 737.],
      [68., 68., 725.33333333],
      [69., 69., 713.],
      [70., 70., 700.],
      [71., 71., 686.33333333],
      [72., 72., 672.],
      [73., 73., 657.],
      [74., 74., 641.33333333],
      [75., 75., 625.],
      [76., 76., 608.],
      [77., 77., 590.33333333],
      [78., 78., 572.],
      [79., 79., 553.],
      [80., 80., 533.33333333],
      [81., 81., 513.],
      [82., 82., 492.],
      [83., 83., 470.33333333],
      [84., 84., 448.],
      [85., 85., 425.],
      [86., 86., 401.33333333],
      [87., 87., 377.],
      [88., 88., 352.],
      [89., 89., 326.33333333],
      [90., 90., 300.],
      [91., 91., 273.],
      [92., 92., 245.33333333],
      [93., 93., 217.],
      [94., 94., 188.],
      [95., 95., 158.33333333],
      [96., 96., 128.],
      [97., 97., 97.],
      [98., 98., 65.33333333],
      [99., 99., 33.],
      [100., 100., 0.]]

      let linePositions = [];
      for (let i = 0; i < positions.length; i++) {
        linePositions.push(getOffsetPosition(position, positions[i][0], positions[i][1], positions[i][2]));
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
