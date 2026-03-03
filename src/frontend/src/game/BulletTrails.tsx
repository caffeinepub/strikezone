import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

// Use primitive to avoid TS conflict with SVG <line>
function BulletTrail({
  from,
  to,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
}) {
  const lineObj = useMemo(() => {
    const points = [from, to];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: "#ffdd88",
      transparent: true,
      opacity: 0.6,
    });
    return new THREE.Line(geo, mat);
  }, [from, to]);

  return <primitive object={lineObj} />;
}

export function BulletTrails() {
  const trails = useGameStore((s) => s.bulletTrails);

  return (
    <>
      {trails.map((trail) => (
        <BulletTrail key={trail.id} from={trail.from} to={trail.to} />
      ))}
    </>
  );
}
