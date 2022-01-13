import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// global variables used for handlers etc.
let container;
let camera, scene, renderer;
let controls;

//calling the two essential functions
init();
animate();

//stats
const stats = Stats();
document.body.appendChild(stats.dom);

function createOriginLines() {
    let origin = new THREE.Group();

    let xLine = createLineFromOrigin(new THREE.Vector3(1, 0, 0), 0xff0000);
    origin.add(xLine);

    let yLine = createLineFromOrigin(new THREE.Vector3(0, 1, 0), 0x00ff00);
    origin.add(yLine);

    let zLine = createLineFromOrigin(new THREE.Vector3(0, 0, 1), 0x0000ff);
    origin.add(zLine);

    return origin;
}

function createLineFromOrigin(vector, color) {
    let material = new THREE.LineBasicMaterial({ color: color });
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(vector);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return new THREE.Line(geometry, material);
}

function init() {

    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    //init container
    container = document.getElementById('webgl');
    container.appendChild(renderer.domElement);

    //camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01,
        20
    );

    camera.position.x = 0.5;
    camera.position.y = 0.5;
    camera.position.z = 1;
    camera.lookAt(new THREE.Vector3(0, -1, -1));

    //init controls
    controls = new OrbitControls(camera, renderer.domElement);

    //init scene
    scene = new THREE.Scene();

    //load content
    let material = new THREE.MeshStandardMaterial({
        color: 'rgb(150,150,150)',
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.9
    });

    //load Model
    const loader = new STLLoader();

    loader.load(
        'models/3DBenchy.stl',
        (geometry) => {
            const stlModel = new THREE.Mesh(geometry, material);
            stlModel.position.x = 0;
            stlModel.position.y = -0.5;
            stlModel.position.z = -1;
            stlModel.scale.x = 0.01;
            stlModel.scale.y = 0.01;
            stlModel.scale.z = 0.01;
            stlModel.rotateX(-Math.PI / 2)

            controls.target.copy(stlModel.position)

            scene.add(stlModel);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )

    scene.add(createOriginLines())

    let ambient = new THREE.HemisphereLight(0xffffff, 0x080820, 2);
    scene.add(ambient)

    let light = new THREE.PointLight(0xffffff, 5);
    light.position.z = 0;
    light.position.y = 1;
    light.position.x = 1;
    light.castShadow = true;

    scene.add(light);



    //init eventListeners
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    //add AR Button
    document.body.appendChild(ARButton.createButton(renderer));
    renderer.xr.enabled = true;
}

function animate() {
    renderer.setAnimationLoop(() => {
        controls.update();

        stats.update();
        renderer.render(scene, camera);
    });
}
