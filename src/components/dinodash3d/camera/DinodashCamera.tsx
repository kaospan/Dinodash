import { useMemo } from 'react';
import * as THREE from 'three';
import type { Level3D, Position3D } from '@/game3d/level3d';
import { PersistentCameraRig } from './PersistentCameraRig';

const S = 1.05;

type Props = {
  level: Level3D;
  player: Position3D;
  topDown: boolean;
};

/**
 * Compatibility adapter for the current Dinodash3D composition.
 *
 * The main game still speaks in terms of level/player/topDown. Camera state is
 * deliberately translated here so Dinodash3D does not own zoom, rotation, or
 * follow mechanics.
 */
export default function DinodashCamera({ level, player, topDown }: Props) {
  const boardCenter = useMemo(
    () => new THREE.Vector3((level.width - 1) * S / 2, 0, (level.depth - 1) * S / 2),
    [level.width, level.depth],
  );

  const followTarget = useMemo(
    () => new THREE.Vector3(player.x * S, 0.4, player.y * S),
    [player.x, player.y],
  );

  const fov = 42 * Math.PI / 180;
  const fitDistance = useMemo(() => {
    const width = level.width * S;
    const depth = level.depth * S;
    return Math.max(
      width / (2 * Math.tan(fov / 2)),
      depth / (2 * Math.tan(fov / 2)),
      5,
    ) * 1.2;
  }, [level.width, level.depth]);

  return (
    <PersistentCameraRig
      boardCenter={boardCenter}
      followTarget={followTarget}
      mode={topDown ? 'top' : 'follow'}
      fitDistance={fitDistance}
    />
  );
}
