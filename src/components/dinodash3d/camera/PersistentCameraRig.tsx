import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { restoreCameraSnapshot, writeCameraSnapshot } from './cameraPersistence';
import { DEFAULT_CAMERA_DISTANCE, type CameraViewMode } from './cameraTypes';

type Props = {
  boardCenter: THREE.Vector3;
  followTarget: THREE.Vector3;
  mode: CameraViewMode;
  fitDistance?: number;
};

type OrbitControlsLike = {
  target: THREE.Vector3;
  update: () => void;
};

export function PersistentCameraRig({ boardCenter, followTarget, mode, fitDistance = DEFAULT_CAMERA_DISTANCE }: Props) {
  const { size } = useThree();
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const controls = useRef<OrbitControlsLike | null>(null);
  const restored = useRef(false);
  const previousMode = useRef<CameraViewMode>(mode);
  const previousTarget = useRef(followTarget.clone());

  const fallbackPosition = useMemo(
    () => followTarget.clone().add(new THREE.Vector3(.75, .9, .75).normalize().multiplyScalar(Math.max(5, fitDistance))),
    [followTarget, fitDistance],
  );

  useEffect(() => {
    if (!camera.current || !controls.current || restored.current) return;
    restored.current = restoreCameraSnapshot(camera.current, controls.current.target);
    if (!restored.current) camera.current.position.copy(fallbackPosition);
    controls.current.update();
  }, [fallbackPosition]);

  useFrame((_, dt) => {
    if (!camera.current || !controls.current) return;

    const target = mode === 'top' ? boardCenter : followTarget;
    const targetDelta = target.distanceTo(previousTarget.current);

    if (targetDelta > 0.001) {
      controls.current.target.lerp(target, Math.min(1, dt * 8));
      previousTarget.current.copy(target);
    }

    if (previousMode.current !== mode) {
      if (mode === 'top') {
        camera.current.position.set(boardCenter.x, Math.max(5, fitDistance) * 1.15, boardCenter.z + .01);
        controls.current.target.copy(boardCenter);
      } else {
        const distance = camera.current.position.distanceTo(controls.current.target) || Math.max(5, fitDistance);
        camera.current.position.copy(followTarget).add(camera.current.position.clone().sub(controls.current.target).normalize().multiplyScalar(distance));
        controls.current.target.copy(followTarget);
      }
      previousMode.current = mode;
    }

    controls.current.update();
    writeCameraSnapshot(camera.current, controls.current.target);
  });

  return <>
    <PerspectiveCamera ref={camera} makeDefault position={fallbackPosition.toArray()} fov={42} />
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableRotate
      enableDamping
      dampingFactor={.08}
      minPolarAngle={.08}
      maxPolarAngle={Math.PI / 2 - .035}
      minDistance={Math.max(2.5, fitDistance * .35)}
      maxDistance={Math.max(fitDistance * 1.8, 10)}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  </>;
}
