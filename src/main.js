import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { HackathonButton } from './hackathonButton';
import { RotateButton } from './rotateButton';

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

    const materials = {
        skin: {
            color: "#daa385",
            metalness: 0.10,
            roughness: 0.65,
        },
        skull: {
            color: "#e2d9cb",
            metalness: 0.15,
            roughness: 0.7,
        },
        cortex: {
            color: "#f7c0aa",
            metalness: 0.15,
            roughness: 0.50
        },
        tentorium: {
            color: "#c5ac7e",
            metalness: 0.15,
            roughness: 0.60
        },
        tumor: {
            color: "#00e80d",
            metalness: 0.15,
            roughness: 0.60
        },
        ventricles: {
            color: "#2053fa",
            metalness: 0.15,
            roughness: 0.60
        },
        vessels: {
            color: "#d40000",
            metalness: 0.15,
            roughness: 0.60
        }
    };

    //load Model
    const loader = new STLLoader();

    const surfaces = ["skin", "cortex", "tumor", "tentorium", "vessels", "ventricles"];

    const surfaceGroup = new THREE.Group();

    for (let i = 0; i < surfaces.length; i++) {
        let surfaceName = surfaces[i];

        loader.load(
            'models/'+surfaceName+'.stl',
            (geometry) => {
                let material;
                if (surfaceName == "skin") {
                    material = new THREE.MeshStandardMaterial({
                        color: materials[surfaceName]["color"],
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.5,
                        roughness: materials[surfaceName]["roughness"],
                        metalness: materials[surfaceName]["metalness"]
                    });
                } else {
                    material = new THREE.MeshStandardMaterial({
                        color: materials[surfaceName]["color"],
                        side: THREE.DoubleSide,
                        roughness: materials[surfaceName]["roughness"],
                        metalness: materials[surfaceName]["metalness"]
                    });
                }

                const stlModel = new THREE.Mesh(geometry, material);
                stlModel.position.x = 0;
                stlModel.position.y = 0;
                stlModel.position.z = -1;
                stlModel.scale.x = 0.005;
                stlModel.scale.y = 0.005;
                stlModel.scale.z = 0.005;
                stlModel.rotateX(-Math.PI / 2)
                stlModel.name = surfaceName;

                controls.target.copy(stlModel.position)

                surfaceGroup.name = "allSurfaces";
                surfaceGroup.add(stlModel);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    }

    surfaceGroup.translateX(0).translateY(-0.5).translateZ(-1);
    scene.add(surfaceGroup);

    scene.add(createOriginLines())

    let ambient = new THREE.HemisphereLight(0xffffff, 0x080820, 2);
    scene.add(ambient)

    // let light = new THREE.PointLight(0xffffff, 5);
    // light.position.z = 0;
    // light.position.y = 1;
    // light.position.x = 1;
    // light.castShadow = true;

    // scene.add(light);

    //init eventListeners
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function onSelectAll() {
        console.log("onSelectAll");
        let allSurf = scene.getObjectByName("allSurfaces");
        allSurf.rotateY(0.175); // 10 deg
    }
    // let controller = renderer.xr.getController( 0 );
	// controller.addEventListener( 'select', onSelectAll );
	// scene.add( controller );

    var arButton = ARButton.createButton(renderer, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });

    let relativePositionX = 110;
    let relativePositionY = 310;

    let buttonSize = 80;

    var skinToggleButton = HackathonButton.createButton(renderer, "Skin", relativePositionY, relativePositionX, "skin", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var cortexToggleButton = HackathonButton.createButton(renderer, "Cortex", relativePositionY, relativePositionX+buttonSize, "cortex", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var vesselsToggleButton = HackathonButton.createButton(renderer, "Vessels", relativePositionY, relativePositionX+(buttonSize*2), "vessels", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var tumorToggleButton = HackathonButton.createButton(renderer, "Tumor", relativePositionY, relativePositionX+(buttonSize*3), "tumor", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var tentoriumToggleButton = HackathonButton.createButton(renderer, "Tentorium", relativePositionY, relativePositionX+(buttonSize*4), "tentorium", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var ventriclesToggleButton = HackathonButton.createButton(renderer, "Ventricles", relativePositionY, relativePositionX+(buttonSize*5), "ventricles", scene, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });

    // var skinToggleButton = HackathonButton.createButton(renderer, "Skin", relativePositionY, relativePositionX, "skin", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });
    // var cortexToggleButton = HackathonButton.createButton(renderer, "Cortex", relativePositionY, relativePositionX+buttonSize, "cortex", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });
    // var vesselsToggleButton = HackathonButton.createButton(renderer, "Vessels", relativePositionY, relativePositionX+(buttonSize*2), "vessels", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });
    // var tumorToggleButton = HackathonButton.createButton(renderer, "Tumor", relativePositionY, relativePositionX+(buttonSize*3), "tumor", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });
    // var tentoriumToggleButton = HackathonButton.createButton(renderer, "Tentorium", relativePositionY, relativePositionX+(buttonSize*4), "tentorium", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });
    // var ventriclesToggleButton = HackathonButton.createButton(renderer, "Ventricles", relativePositionY, relativePositionX+(buttonSize*5), "ventricles", scene, { 
    //     requiredFeatures: ['hit-test'], 
    //     optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
    //     domOverlay: { root: document.body } });

    let rotateRelativePositionX = -450;
    let rotateRelativePositionY = 310;
    let rotateButtonSize = 80;

    var rotateX = RotateButton.createButton(renderer, "X", rotateRelativePositionY, rotateRelativePositionX, surfaceGroup, scene, "X", { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var rotateXNeg = RotateButton.createButton(renderer, "XNeg", rotateRelativePositionY, rotateRelativePositionX+rotateButtonSize, surfaceGroup, scene, "XNeg",{ 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var rotateY = RotateButton.createButton(renderer, "Y", rotateRelativePositionY, rotateRelativePositionX+(rotateButtonSize*2), surfaceGroup, scene, "Y",{ 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var rotateYNeg = RotateButton.createButton(renderer, "YNeg", rotateRelativePositionY, rotateRelativePositionX+(rotateButtonSize*3), surfaceGroup, scene, "YNeg",{ 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var rotateZ = RotateButton.createButton(renderer, "Z", rotateRelativePositionY, rotateRelativePositionX+(rotateButtonSize*4), surfaceGroup, scene, "Z",{ 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });
    var rotateZNeg = RotateButton.createButton(renderer, "ZNeg", rotateRelativePositionY, rotateRelativePositionX+(rotateButtonSize*5), surfaceGroup, scene, "ZNeg",{ 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], 
        domOverlay: { root: document.body } });

    //add AR Button
    //document.body.appendChild(ARButton.createButton(renderer));
    document.body.appendChild(arButton);

    document.body.appendChild(skinToggleButton);
    document.body.appendChild(cortexToggleButton);
    document.body.appendChild(vesselsToggleButton);
    document.body.appendChild(tumorToggleButton);
    document.body.appendChild(tentoriumToggleButton);
    document.body.appendChild(ventriclesToggleButton);

    document.body.appendChild(rotateX);
    document.body.appendChild(rotateXNeg);
    document.body.appendChild(rotateY);
    document.body.appendChild(rotateYNeg);
    document.body.appendChild(rotateZ);
    document.body.appendChild(rotateZNeg);

    renderer.xr.enabled = true;
}

function animate() {
    renderer.setAnimationLoop(() => {
        controls.update();

        stats.update();
        renderer.render(scene, camera);
    });
}
