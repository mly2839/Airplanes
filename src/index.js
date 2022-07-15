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

//adding a scene for rings
const ringScene = new Scene();

//adding camera
const camera = new PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

//adding ring camera
const ringCamera = new PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 1000);
ringCamera.position.set(0, 0, 50);

//adding renderer
const renderer = new WebGLRenderer({ antialias: true, alpha: true});
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//adding movement controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

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

(async function () {
    //adding the environment map
    let pmrem = new PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader()
        .setDataType(FloatType)
        .loadAsync("assets/drackenstein_quarry_4k.hdr");
    let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

    //adding rings
    const ring1 = new Mesh(
        new RingGeometry(15, 13.5, 80, 1, 0),
        new MeshPhysicalMaterial({
            color: new Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(200),
            roughness: 0.25,
            envMap,
            envmapIntensity: 1.8,
            side: DoubleSide,
            transparent: true,
            opacity: 0.35,
        })
    )
    ringScene.add(ring1);

    const ring2 = new Mesh(
        new RingGeometry(16.5, 15.75, 80, 1, 0),
        new MeshPhysicalMaterial({
            color: new Color("#FFCB8E").convertSRGBToLinear(),
            side: DoubleSide,
            transparent: true,
            opacity: 0.5,
        })
    )
    ringScene.add(ring2);

    const ring3 = new Mesh(
        new RingGeometry(18, 17.75, 80),
        new MeshPhysicalMaterial({
            color: new Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(50),
            side: DoubleSide,
            transparent: true,
            opacity: 0.5,
        })
    )
    ringScene.add(ring3);


    //adding the earth textures
    let textures = {
        bump: await new TextureLoader().loadAsync("assets/earthbump.jpg"),
        map: await new TextureLoader().loadAsync("assets/earthmap.jpg"),
        spec: await new TextureLoader().loadAsync("assets/earthspec.jpg"),
        trail: await new TextureLoader().loadAsync("assets/mask.png"),
    }

    //adding the planes
    let plane = (await new GLTFLoader().loadAsync("assets/plane/scene.glb")).scene.children[0];
    let planesData = [
        makePlane(plane, textures.trail, envMap, scene),
        makePlane(plane, textures.trail, envMap, scene),
        makePlane(plane, textures.trail, envMap, scene),
        makePlane(plane, textures.trail, envMap, scene),
        makePlane(plane, textures.trail, envMap, scene),
        makePlane(plane, textures.trail, envMap, scene),
    ];

    //adding the earth
    let earth = new Mesh(
        new SphereGeometry(10, 70, 70),
        new MeshPhysicalMaterial({
            map: textures.map,
            roughnessMap: textures.spec,
            bumpMap: textures.bump,
            bumpScale: 0.05,
            sheen: 1,
            sheenRoughness: 0.75,
            sheenColor: new Color("#ff8a00").convertSRGBToLinear(),
            clearCoat: 0.5,
            envMap,
            envmapIntensity: 0.4,
        }),
    );
    earth.rotation.y += Math.PI * 1.25;
    earth.receiveShadow = true;
    scene.add(earth);
    
    //adding a clock
    let clock = new Clock();
    
    //the animation renderer
    renderer.setAnimationLoop(() => {
        let delta = clock.getDelta();

        planesData.forEach(planeData => {
            let plane = planeData.group;

            plane.position.set(0,0,0);
            plane.rotation.set(0,0,0);
            plane.updateMatrixWorld();
            
            planeData.rot += delta * 0.25;
            plane.rotateOnAxis(planeData.randomAxis, planeData.randomAxisRot);
            plane.rotateOnAxis(new Vector3(0,1,0), planeData.rot);
            plane.rotateOnAxis(new Vector3(0,0,1), planeData.rad);
            plane.translateY(planeData.yOff);
            plane.rotateOnAxis(new Vector3(1,0,0), +Math.PI * 0.5);
        });

        controls.update();
        renderer.render(scene, camera);

        renderer.autoClear = false;
        renderer.render(ringScene, ringCamera);
        renderer.autoClear = true;
    });
})();

//function to create plane and add properties to it
function makePlane(planeMesh, trailT, envMap, scene) {
    let plane = planeMesh.clone();
    plane.scale.set(0.001,0.001,0.001);
    plane.position.set(0,0,0);
    plane.rotation.set(0,0,0);
    plane.updateMatrixWorld();

    plane.traverse((object) => {
        if(object instanceof Mesh) {
            object.material.envMap = envMap;
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    let trail = new Mesh(
        new PlaneGeometry(1, 2),
        new MeshPhysicalMaterial({
            envMap,
            envmapIntensity: 3,
            color: new Color(1, 0.5, 1),
            roughness: 0.4,
            metalness: 0,
            transmission: 1,
            transparent: true,
            opacity: 1,
            alphaMap: trailT,
        })
    )
    trail.rotateX(Math.PI);
    trail.translateY(1.1);

    let group = new Group();
    group.add(plane);
    group.add(trail);

    scene.add(group);

    return {
        group,
        yOff: 10.5 + Math.random() * 1.0,
        rot: Math.random() * Math.PI * 2.0,
        rad: Math.random() * Math.PI * 0.45 + 0.2,
        randomAxis: new Vector3(randomNumber(), randomNumber(), randomNumber()).normalize(),
        randomAxisRot: Math.random() * Math.PI * 2,
    }
}

function randomNumber() {
    return Math.random() * 2 - 1;
}