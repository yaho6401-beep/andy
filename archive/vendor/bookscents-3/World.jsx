import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** 재사용 가능한 지형 함수: 시각적 지형 높이와 아바타 지면 높이를 일치시킵니다. */
export function terrainHeight(x, z) {
  const rolling = 0.5 * Math.sin(x * 0.12) * Math.cos(z * 0.1) + 0.22 * Math.sin(z * 0.2);
  const mountain = 12.5 * Math.exp(-(((x + 27) / 13) ** 2 + ((z + 24) / 13) ** 2));
  const coast = x > 17 ? 3.5 * ((x - 17) / 20) ** 2 : 0;
  return rolling + mountain - coast;
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const getZone = (x, z) => (x > 14 ? '바람의 해안' : (x < -15 && z < -12 ? '하늘 언덕' : '사유의 숲'));
const LIBRARY_PORTAL = { x: 0, z: 3.7 };

function Island() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(96, 96, 72, 72);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const colors = [];
    const grass = new THREE.Color('#84af86');
    const grassLight = new THREE.Color('#9cc09a');
    const rock = new THREE.Color('#83948f');
    const sand = new THREE.Color('#cfbea0');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = terrainHeight(x, z);
      p.setY(i, h);
      const color = h > 8 ? rock.clone() : x > 23 && h < 0.9 ? sand.clone() : grass.clone();
      color.lerp(grassLight, clamp((Math.sin(x * 0.6 + z * 0.25) + 1) * 0.2, 0, 0.35));
      colors.push(color.r, color.g, color.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} receiveShadow>
    <meshStandardMaterial vertexColors roughness={1} flatShading side={THREE.DoubleSide} />
  </mesh>;
}

const seaVertex = `
  uniform float uTime;
  varying float wave;
  void main() {
    vec3 p = position;
    float w = sin(p.x * 0.27 + uTime * 0.65) * 0.10 + cos(p.y * 0.20 + uTime * 0.45) * 0.09;
    p.z += w;
    wave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const seaFragment = `
  varying float wave;
  void main() {
    vec3 a = vec3(0.22, 0.58, 0.69);
    vec3 b = vec3(0.36, 0.70, 0.74);
    gl_FragColor = vec4(mix(a, b, smoothstep(-0.20, 0.22, wave)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
function Sea() {
  const material = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => { if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime; });
  return <mesh position={[105, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[305, 305, 42, 42]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={seaVertex} fragmentShader={seaFragment} />
  </mesh>;
}
function Trees({ quality }) {
  const trunk = useRef(), crown = useRef();
  const locations = useMemo(() => {
    let seed = 5491;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const list = [];
    const n = quality === 'low' ? 48 : quality === 'high' ? 165 : 105;
    for (let i = 0; i < n * 2 && list.length < n; i++) {
      const x = -42 + random() * 72, z = -42 + random() * 82;
      if (x > 16 || (Math.abs(x) < 7 && z > -9 && z < 12) ||
          (Math.abs(x - 22) < 7 && Math.abs(z - 5) < 7) ||
          (Math.abs(x + 12) < 5 && Math.abs(z + 17) < 7)) continue;
      list.push({ x, z, scale: 0.75 + random() * 0.75, hue: random() });
    }
    return list;
  }, [quality]);
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const green = new THREE.Color();
    locations.forEach((loc, i) => {
      const h = terrainHeight(loc.x, loc.z);
      dummy.position.set(loc.x, h + loc.scale * 0.95, loc.z);
      dummy.rotation.set(0, loc.hue * Math.PI, 0);
      dummy.scale.set(loc.scale * 0.30, loc.scale, loc.scale * 0.30);
      dummy.updateMatrix(); trunk.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(loc.x, h + loc.scale * 2.45, loc.z);
      dummy.scale.set(loc.scale * 1.22, loc.scale * 1.6, loc.scale * 1.22);
      dummy.updateMatrix(); crown.current.setMatrixAt(i, dummy.matrix);
      green.setHSL(0.27 + loc.hue * 0.075, 0.27, 0.32 + loc.hue * 0.17);
      crown.current.setColorAt(i, green);
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    crown.current.instanceMatrix.needsUpdate = true;
    if (crown.current.instanceColor) crown.current.instanceColor.needsUpdate = true;
  }, [locations]);
  return <group>
    <instancedMesh ref={trunk} args={[null, null, locations.length]} castShadow={quality === 'high'}>
      <cylinderGeometry args={[0.34, 0.51, 2, 5]} /><meshStandardMaterial color="#806951" roughness={1} />
    </instancedMesh>
    <instancedMesh ref={crown} args={[null, null, locations.length]}>
      <icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="white" roughness={0.95} flatShading />
    </instancedMesh>
  </group>;
}
function Flowers({ quality }) {
  const ref = useRef();
  const items = useMemo(() => {
    let seed = 101;
    const rnd = () => ((seed = (seed * 22695477 + 1) >>> 0) / 4294967296);
    const arr = [];
    const count = quality === 'low' ? 80 : 260;
    for (let i = 0; i < count; i++) {
      const x = -30 + rnd() * 60, z = -34 + rnd() * 68;
      if (x > 28 || (Math.abs(x) < 6 && Math.abs(z) < 9)) continue;
      arr.push({ x, z, s: .4 + rnd() * .8, t: rnd() });
    }
    return arr;
  }, [quality]);
  useEffect(() => {
    const obj = new THREE.Object3D();
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      obj.position.set(p.x, terrainHeight(p.x, p.z) + .16 * p.s, p.z);
      obj.scale.set(.10 * p.s, .26 * p.s, .10 * p.s);
      obj.rotation.set(0, p.t * Math.PI * 2, 0);
      obj.updateMatrix(); ref.current.setMatrixAt(i, obj.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[null, null, items.length]}>
    <coneGeometry args={[1, 2, 3]} /><meshStandardMaterial color="#c9d9a2" />
  </instancedMesh>;
}
function WoodenBench({ x, z, rotation = 0 }) {
  const y = terrainHeight(x, z);
  return <group position={[x, y, z]} rotation={[0, rotation, 0]}>
    <mesh position={[0, .8, 0]} castShadow><boxGeometry args={[2.3, .18, .7]} /><meshStandardMaterial color="#98755a" /></mesh>
    <mesh position={[0, 1.35, -.3]} castShadow><boxGeometry args={[2.3, .95, .18]} /><meshStandardMaterial color="#9d8064" /></mesh>
    {[-.88, .88].map(k => <mesh key={k} position={[k, .4, 0]} castShadow>
      <boxGeometry args={[.16, .8, .52]} /><meshStandardMaterial color="#6a665c" />
    </mesh>)}
  </group>;
}
function Library({ active }) {
  const ring = useRef();
  const floor = terrainHeight(0, 0);
  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = Math.sin(state.clock.elapsedTime * .7) * .055;
      ring.current.scale.setScalar(1 + .022 * Math.sin(state.clock.elapsedTime * 1.9));
    }
  });
  return <group position={[0, floor, 0]}>
    <mesh position={[0, 1.7, -1.6]} castShadow receiveShadow>
      <boxGeometry args={[7.5, 3.4, 5]} /><meshStandardMaterial color="#e3d4b3" roughness={.95} />
    </mesh>
    <mesh position={[-1.90, 3.92, -1.6]} rotation={[0, 0, -Math.PI / 5.2]} castShadow>
      <boxGeometry args={[4.8, .28, 5.7]} /><meshStandardMaterial color="#829c8b" roughness={.9} />
    </mesh>
    <mesh position={[1.90, 3.92, -1.6]} rotation={[0, 0, Math.PI / 5.2]} castShadow>
      <boxGeometry args={[4.8, .28, 5.7]} /><meshStandardMaterial color="#829c8b" roughness={.9} />
    </mesh>
    {[-2.4, 2.4].map((x) => <mesh key={x} position={[x, 2.05, 1.02]}>
      <boxGeometry args={[1.15, 1.25, .12]} /><meshStandardMaterial color="#aed9cd" emissive="#28493b" emissiveIntensity={.14} />
    </mesh>)}
    <mesh position={[0, 1.25, 1.03]}><boxGeometry args={[2.25, 2.5, .15]} />
      <meshStandardMaterial color="#745c51" />
    </mesh>
    <group ref={ring} position={[0, 1.45, 1.22]}>
      <mesh><torusGeometry args={[1.04, .16, 8, 32]} />
        <meshStandardMaterial color="#c7ead0" emissive="#86c8b5" emissiveIntensity={active ? 1.25 : .65} />
      </mesh>
      <mesh position={[0, 0, -.08]}>
        <circleGeometry args={[.92, 32]} />
        <meshBasicMaterial color="#bde5e0" transparent opacity={.38} depthWrite={false} />
      </mesh>
    </group>
    <mesh position={[0, .12, 3.45]} receiveShadow>
      <boxGeometry args={[2.8, .2, 2.2]} /><meshStandardMaterial color="#e1cdb0" />
    </mesh>
  </group>;
}
function MountainStones() {
  return <group>
    {Array.from({ length: 16 }, (_, i) => {
      const angle = i * 2.4, radius = 3 + (i % 5) * 2.6;
      const x = -27 + Math.sin(angle) * radius, z = -24 + Math.cos(angle) * radius;
      return <mesh key={i} position={[x, terrainHeight(x,z) + .4, z]} rotation={[.1, angle, .1]}>
        <dodecahedronGeometry args={[.5 + (i % 3) * .26, 0]} />
        <meshStandardMaterial color={i % 3 === 0 ? '#9ba69c' : '#87988d'} roughness={1} />
      </mesh>;
    })}
  </group>;
}
function Glider({ visible }) {
  return visible ? <group position={[0, 1.95, 0]}>
    <mesh rotation={[0, 0, 0]}><boxGeometry args={[4.4, .10, .75]} /><meshStandardMaterial color="#e6b38b" /></mesh>
    <mesh position={[0, .18, .15]}><boxGeometry args={[2.6, .08, .45]} /><meshStandardMaterial color="#f7ead4" /></mesh>
    <mesh position={[0, -.45, .3]} rotation={[Math.PI / 12, 0, 0]}><cylinderGeometry args={[.06,.06,1.05,5]} /><meshStandardMaterial color="#755e55" /></mesh>
  </group> : null;
}
function Avatar({ groupRef, flying, reading }) {
  const leftLeg = useRef(), rightLeg = useRef(), leftArm = useRef(), rightArm = useRef();
  useFrame(({ clock }) => {
    const moving = !!groupRef.current?.userData.moving;
    const swing = moving && !flying && !reading ? Math.sin(clock.elapsedTime * 8) * .38 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, swing, .24);
    if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -swing, .24);
    if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -swing * .7, .24);
    if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, swing * .7, .24);
  });
  return <group ref={groupRef}>
    <group scale={reading ? [1, .77, 1] : [1, 1, 1]}>
      <mesh position={[0, 1.05, 0]} castShadow><capsuleGeometry args={[.34, .45, 4, 8]} /><meshStandardMaterial color="#7796a4" roughness={.9} /></mesh>
      <mesh position={[0, 1.78, 0]} castShadow><sphereGeometry args={[.51, 12, 10]} /><meshStandardMaterial color="#f0cbb0" roughness={.9} /></mesh>
      <mesh position={[0, 2.14, -.07]}><sphereGeometry args={[.52, 12, 8, 0, Math.PI*2, 0, Math.PI*.46]} /><meshStandardMaterial color="#665349" /></mesh>
      {[-.19, .19].map(x => <mesh key={x} position={[x, 1.81, -.452]}><sphereGeometry args={[.035, 6, 6]} /><meshBasicMaterial color="#2f3130" /></mesh>)}
      {[-.18,.18].map((x,i) => <group key={x} ref={i === 0 ? leftLeg : rightLeg} position={[x, .63, 0]}>
        <mesh position={[0,-.27,0]}><capsuleGeometry args={[.11, .42, 3, 6]} /><meshStandardMaterial color="#596d74" /></mesh>
      </group>)}
      {[-.44,.44].map((x,i) => <group key={x} ref={i === 0 ? leftArm : rightArm} position={[x, 1.25, 0]}>
        <mesh position={[0,-.24,0]}><capsuleGeometry args={[.095, .31, 3, 6]}/><meshStandardMaterial color="#eac2a9" /></mesh>
      </group>)}
    </group>
    <Glider visible={flying}/>
    {reading && <mesh position={[0, 1.35, -.52]} rotation={[-.25,0,0]}>
      <boxGeometry args={[.68, .06, .42]} /><meshStandardMaterial color="#f7e7c5" />
    </mesh>}
  </group>;
}

function Journey({ controls, flight, reading, quality, onMove, startPosition, dragRef }) {
  const avatar = useRef();
  const p = useRef({ x: startPosition.x, y: terrainHeight(startPosition.x, startPosition.z), z: startPosition.z });
  const yaw = dragRef.yaw;
  const pitch = dragRef.pitch;
  const wasFlight = useRef(false);
  const targetAltitude = useRef(0);
  const reportTime = useRef(0);
  const rot = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredCamera = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, .05);
    const v = p.current;
    if (flight && !wasFlight.current) targetAltitude.current = v.y + 3;
    wasFlight.current = flight;
    const keys = controls.current;
    const f = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0);
    const r = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const speed = flight ? 9.5 : keys.sprint ? 7 : 4.4;
    if (!reading && (f || r)) {
      const length = Math.hypot(f, r);
      const dx = (-Math.sin(yaw.current) * f + Math.cos(yaw.current) * r) / length;
      const dz = (-Math.cos(yaw.current) * f - Math.sin(yaw.current) * r) / length;
      v.x = clamp(v.x + dx * speed * dt, -44, 44);
      v.z = clamp(v.z + dz * speed * dt, -44, 44);
      const desiredRot = Math.atan2(-dx, -dz);
      const diff = Math.atan2(Math.sin(desiredRot - rot.current), Math.cos(desiredRot - rot.current));
      rot.current += diff * Math.min(1, dt * 8);
    }
    const ground = terrainHeight(v.x, v.z);
    if (flight) {
      if (!reading) targetAltitude.current += ((keys.up ? 1 : 0) - (keys.down ? 1 : 0)) * 7.5 * dt;
      targetAltitude.current = clamp(targetAltitude.current, ground + 2.1, 32);
      v.y = THREE.MathUtils.damp(v.y, targetAltitude.current, 3.5, dt);
    } else {
      targetAltitude.current = ground;
      v.y = THREE.MathUtils.damp(v.y, ground, 12, dt);
    }
    if (avatar.current) {
      avatar.current.position.set(v.x, v.y, v.z);
      avatar.current.rotation.y = rot.current;
      avatar.current.userData.moving = Boolean((f || r) && !reading);
    }
    target.set(v.x, v.y + 1.45, v.z);
    const radius = flight ? 10.8 : 7.6;
    const a = pitch.current;
    desiredCamera.set(
      v.x + Math.sin(yaw.current) * Math.cos(a) * radius,
      v.y + 1.45 + Math.sin(a) * radius,
      v.z + Math.cos(yaw.current) * Math.cos(a) * radius
    );
    camera.position.lerp(desiredCamera, 1 - Math.exp(-dt * 5.8));
    camera.lookAt(target);
    if (clock.elapsedTime - reportTime.current > .42) {
      reportTime.current = clock.elapsedTime;
      onMove({ x: v.x, z: v.z, y: v.y, zone: getZone(v.x, v.z),
        nearPortal: Math.hypot(v.x - LIBRARY_PORTAL.x, v.z - LIBRARY_PORTAL.z) < 6.2 });
    }
  });
  return <>
    <Avatar groupRef={avatar} flying={flight} reading={reading}/>
    <Library active={Math.hypot(p.current.x, p.current.z - 3.7) < 6.2} />
  </>;
}

export default function World({ controls, flight, reading, quality, onMove, startPosition }) {
  const dragRef = useMemo(() => ({ yaw: { current: 0 }, pitch: { current: .38 }, pointer: null }), []);
  const beginDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event) => {
    if (!dragRef.pointer || dragRef.pointer.id !== event.pointerId) return;
    const dx = event.clientX - dragRef.pointer.x, dy = event.clientY - dragRef.pointer.y;
    dragRef.yaw.current -= dx * .005;
    dragRef.pitch.current = clamp(dragRef.pitch.current + dy * .004, .09, 1.15);
    dragRef.pointer.x = event.clientX;
    dragRef.pointer.y = event.clientY;
  };
  const stopDrag = () => { dragRef.pointer = null; };
  return <div className="render-layer" onPointerDown={beginDrag} onPointerMove={drag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
    <Canvas camera={{ position: [0, 8, 15], fov: 55, near: .1, far: 230 }}
      dpr={quality === 'low' ? [1, 1.1] : quality === 'high' ? [1, 1.75] : [1, 1.35]}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }} shadows={quality === 'high'}>
      <color attach="background" args={['#d5e8e2']}/>
      <fog attach="fog" args={['#d5e8e2', 42, 125]}/>
      <hemisphereLight args={['#f9f1e2', '#6d887b', 2.0]}/>
      <directionalLight position={[-15, 32, 20]} intensity={2.0} castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40}/>
      <Sea/><Island/><Trees quality={quality}/><Flowers quality={quality}/><MountainStones/>
      <WoodenBench x={-12} z={-17} rotation={.3}/>
      <WoodenBench x={24} z={6} rotation={-1.2}/>
      <WoodenBench x={-28} z={-22} rotation={.7}/>
      <Journey controls={controls} flight={flight} reading={reading} quality={quality}
        onMove={onMove} startPosition={startPosition} dragRef={dragRef}/>
    </Canvas>
  </div>;
}
