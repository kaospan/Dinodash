import * as THREE from 'three';
import { CAMERA_STORAGE_KEY, type CameraSnapshot } from './cameraTypes';

function isSnapshot(value: unknown): value is CameraSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<CameraSnapshot>;
  return Array.isArray(v.position) && v.position.length === 3 &&
    Array.isArray(v.target) && v.target.length === 3 &&
    typeof v.distance === 'number' && Number.isFinite(v.distance);
}

export function readCameraSnapshot(): CameraSnapshot | null {
  try {
    const raw = localStorage.getItem(CAMERA_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCameraSnapshot(camera: THREE.Camera, target: THREE.Vector3): void {
  const distance = camera.position.distanceTo(target);
  const snapshot: CameraSnapshot = {
    position: camera.position.toArray() as [number, number, number],
    target: target.toArray() as [number, number, number],
    distance,
  };
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage is an optimization; camera behavior must continue without it.
  }
}

export function restoreCameraSnapshot(camera: THREE.Camera, controlsTarget: THREE.Vector3): boolean {
  const snapshot = readCameraSnapshot();
  if (!snapshot) return false;
  camera.position.fromArray(snapshot.position);
  controlsTarget.fromArray(snapshot.target);
  camera.updateProjectionMatrix();
  return true;
}
