import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, signal, ViewChild, afterNextRender } from '@angular/core';
import { NgClass } from '@angular/common';
import * as THREE from 'three';

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface RollResult {
  dice: DiceType;
  value: number;
  total: number;
}

interface RollingDie {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Euler;
  settled: boolean;
  settleTime: number;
}

@Component({
  selector: 'dice-roller',
  templateUrl: './dice-roller.component.html',
  styleUrl: './dice-roller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class DiceRollerComponent implements OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly diceTypes: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
  readonly diceIcons: Record<DiceType, string> = {
    d4: '▲',
    d6: '⬡',
    d8: '◆',
    d10: '⬟',
    d12: '⬠',
    d20: '⬡',
  };

  isOpen = signal(false);
  isRolling = signal(false);
  results = signal<RollResult[]>([]);
  totalSum = signal<number | null>(null);
  selectedDice = signal<DiceType[]>([]);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;
  private rollingDice: RollingDie[] = [];
  private initialized = false;

  // DnD color palette
  private readonly DICE_COLOR = 0x1a0a00;

  constructor() {
    afterNextRender(() => {
      // Renderer initialized on first open
    });
  }

  togglePanel(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen() && !this.initialized) {
      setTimeout(() => this.initRenderer(), 50);
    }
  }

  toggleDice(dice: DiceType): void {
    this.selectedDice.update(current => {
      if (current.includes(dice)) {
        return current.filter(d => d !== dice);
      }
      return [...current, dice];
    });
  }

  rollSelected(): void {
    if (this.selectedDice().length === 0 || this.isRolling()) return;
    this.roll(this.selectedDice());
  }

  rollSingle(dice: DiceType): void {
    if (this.isRolling()) return;
    this.roll([dice]);
  }

  roll(diceList: DiceType[]): void {
    this.isRolling.set(true);
    this.results.set([]);
    this.totalSum.set(null);
    this.clearScene();

    const newResults: RollResult[] = [];
    diceList.forEach((dice, i) => {
      const max = parseInt(dice.slice(1));
      const value = Math.floor(Math.random() * max) + 1;
      newResults.push({ dice, value, total: value });
      this.spawnDie(dice, i, diceList.length);
    });

    setTimeout(() => {
      const sum = newResults.reduce((a, r) => a + r.value, 0);
      this.results.set(newResults);
      this.totalSum.set(sum);
      this.isRolling.set(false);
    }, 2000);
  }

  clearAll(): void {
    this.results.set([]);
    this.totalSum.set(null);
    this.selectedDice.set([]);
    this.clearScene();
  }

  private initRenderer(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(canvas.clientWidth || 280, canvas.clientHeight || 200);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, (canvas.clientWidth || 280) / (canvas.clientHeight || 200), 0.1, 100);
    this.camera.position.set(0, 6, 4);
    this.camera.lookAt(0, 0, 0);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x3d1f00, 2);
    this.scene.add(ambient);

    // Key light — warm gold
    const keyLight = new THREE.DirectionalLight(0xffcc66, 3);
    keyLight.position.set(3, 8, 4);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // Rim light — deep red
    const rimLight = new THREE.PointLight(0xff2200, 2, 20);
    rimLight.position.set(-4, 2, -2);
    this.scene.add(rimLight);

    // Floor (invisible, for shadows)
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.initialized = true;
    this.animate();
  }

  private spawnDie(type: DiceType, index: number, total: number): void {
    const geometry = this.createDiceGeometry(type);
    const material = this.createDiceMaterial(type);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Spread dice across the canvas
    const spread = Math.min(total - 1, 3) * 0.8;
    const x = total === 1 ? 0 : (index / (total - 1) - 0.5) * spread * 2;
    mesh.position.set(x + (Math.random() - 0.5) * 0.5, 3 + Math.random() * 2, (Math.random() - 0.5) * 1.5);

    const rollingDie: RollingDie = {
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, -4 - Math.random() * 3, (Math.random() - 0.5) * 1),
      angularVelocity: new THREE.Euler((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
      settled: false,
      settleTime: 0,
    };

    this.scene.add(mesh);
    this.rollingDice.push(rollingDie);
  }

  private createDiceGeometry(type: DiceType): THREE.BufferGeometry {
    switch (type) {
      case 'd4':
        return new THREE.TetrahedronGeometry(0.9);
      case 'd6':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'd8':
        return new THREE.OctahedronGeometry(0.9);
      case 'd10':
        return new THREE.ConeGeometry(0.7, 1.2, 10);
      case 'd12':
        return new THREE.DodecahedronGeometry(0.85);
      case 'd20':
        return new THREE.IcosahedronGeometry(0.9);
      default:
        return new THREE.IcosahedronGeometry(0.9);
    }
  }

  private createDiceMaterial(type: DiceType): THREE.MeshStandardMaterial {
    // d20 gets special treatment — slightly larger and glowier
    const isD20 = type === 'd20';
    return new THREE.MeshStandardMaterial({
      color: isD20 ? 0x0d0500 : this.DICE_COLOR,
      roughness: 0.3,
      metalness: 0.7,
      emissive: isD20 ? new THREE.Color(0x3a0000) : new THREE.Color(0x1a0800),
      emissiveIntensity: isD20 ? 0.4 : 0.2,
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const dt = 0.016;
    const floorY = -1.5;

    this.rollingDice.forEach(die => {
      if (die.settled) return;

      // Apply gravity
      die.velocity.y -= 15 * dt;

      // Update position
      die.mesh.position.x += die.velocity.x * dt;
      die.mesh.position.y += die.velocity.y * dt;
      die.mesh.position.z += die.velocity.z * dt;

      // Bounce off floor
      if (die.mesh.position.y <= floorY + 0.5) {
        die.mesh.position.y = floorY + 0.5;
        die.velocity.y = Math.abs(die.velocity.y) * 0.35;
        die.velocity.x *= 0.75;
        die.velocity.z *= 0.75;
        if (Math.abs(die.velocity.y) < 0.5) {
          die.settleTime += dt;
          if (die.settleTime > 0.4) {
            die.settled = true;
            die.velocity.set(0, 0, 0);
          }
        }
      }

      // Rotate
      die.mesh.rotation.x += die.angularVelocity.x;
      die.mesh.rotation.y += die.angularVelocity.y;
      die.mesh.rotation.z += die.angularVelocity.z;

      // Slow rotation
      die.angularVelocity.x *= 0.97;
      die.angularVelocity.y *= 0.97;
      die.angularVelocity.z *= 0.97;
    });

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private clearScene(): void {
    this.rollingDice.forEach(d => this.scene?.remove(d.mesh));
    this.rollingDice = [];
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
  }
}
