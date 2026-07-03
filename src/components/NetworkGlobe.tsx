import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

function RotatingGlobe() {
  const globeRef = useRef<THREE.Mesh>(null)
  const nodesRef = useRef<THREE.Group>(null)

  // Create random points on sphere surface
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < 40; i++) {
      const phi = Math.acos(-1 + (2 * i) / 40)
      const theta = Math.sqrt(40 * Math.PI) * phi
      const x = Math.cos(theta) * Math.sin(phi)
      const y = Math.sin(theta) * Math.sin(phi)
      const z = Math.cos(phi)
      pts.push(new THREE.Vector3(x * 1.05, y * 1.05, z * 1.05))
    }
    return pts
  }, [])

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.y += 0.002
    }
  })

  return (
    <>
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.15}
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      <group ref={nodesRef}>
        {points.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        ))}
      </group>

      <mesh scale={[0.98, 0.98, 0.98]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.6} />
      </mesh>
    </>
  )
}

function DataPulse() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.set(s, s, s)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.1, 32, 32]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.03}
        wireframe
      />
    </mesh>
  )
}

export function NetworkGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <RotatingGlobe />
        <DataPulse />
      </Float>

      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  )
}
