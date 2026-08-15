import * as THREE from 'three';

export type CameraViewMode = 'follow' | 'top';

export type CameraPose = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  distance: number;
};

export type CameraSnapshot = {
  position: [number, number, number];
  target: [number, number, number];
  distance: number;
};

export const DEFAULT_CAMERA_DISTANCE = 8;
export const CAMERA_STORAGE_KEY = 'dinodash-camera-pose-v1';
