import {
    DoubleSide, PCFSoftShadowMap, MeshPhysicalMaterial, TextureLoader,
    FloatType, PMREMGenerator, Scene, PerspectiveCamera,
    WebGLRenderer, Color, ACESFilmicToneMapping, sRGBEncoding,
    Mesh, SphereGeometry, MeshBasicMaterial, Vector2,
    DirectionalLight, Clock, RingGeometry, Vector3,
    PlaneGeometry, CameraHelper, Group,
} from "https://cdn.skypack.dev/three@0.137";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import anime from 'https://cdn.skypack.dev/animejs@3.2.1';

//adding scene
const scene = new Scene();

//adding camera
const camera = new PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

//adding renderer
const renderer = new WebGLRenderer({ antialias: true, alpha: true});
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//adding sunlight
const sunLight = new DirectionalLight( new Color("#FFFFFF"), 3.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

//adding the earth
let earth = new Mesh(
    new SphereGeometry(10, 70, 70),
    new MeshPhysicalMaterial({ }),
);
earth.recieveShadow = true;
scene.add(earth);

(async function () {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
})();
