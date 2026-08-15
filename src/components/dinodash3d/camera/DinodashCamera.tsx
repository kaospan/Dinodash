import * as THREE from 'three';
import type { Level3D, Position3D } from '@/game3d/level3d';
import { PersistentCameraRig } from './PersistentCameraRig';

type Props = {
  level: Level3D;
  player: Position3D;
  topDown: boolean;
};

export default function DinodashCamera({ level, player, topDown }: Props) {
  const boardCenter = new THREE.Vector3(
    (level.width - 1) * 1.05 / 2,
    0,
    (level.depth - 1) * 1.05 / 2,
  );
  const followTarget = new THREE.Vector3(player.x * 1.05, .4, player.y * 1.05);
  const fov = 42 * Math.PI / 180;
  const fitDistance = Math.max(
    level.width * 1.05 / (2 * Math.tan(fov / 2)),
    level.depth * 1.05 / (2 * Math.tan(fov / 2)),
  ) * 1.2;

  return (
    <PersistentCameraRig
      boardCenter={boardCenter}
      followTarget={followTarget}
      mode={topDown ? 'top' : 'follow'}
      fitDistance={fitDistance}
    />
  );
}
