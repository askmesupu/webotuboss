import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = false;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const pointLight = new THREE.PointLight(0xff00ff, 2, 100);
pointLight.position.set(5,5,5);
scene.add(pointLight);

// Smooth dynamic particles
const particleCount = 300;
const particles = new THREE.Group();
for(let i=0;i<particleCount;i++){
    const geo = new THREE.SphereGeometry(0.05,8,8);
    const mat = new THREE.MeshStandardMaterial({ color:0x00fffa, emissive:0x00fffa });
    const p = new THREE.Mesh(geo, mat);
    p.userData.original = {x: (Math.random()-0.5)*10, y: (Math.random()-0.5)*10, z:(Math.random()-0.5)*10};
    p.position.set(p.userData.original.x, p.userData.original.y, p.userData.original.z);
    particles.add(p);
}
scene.add(particles);

// 3D Social Icons
const loader = new GLTFLoader();
const socialGroup = new THREE.Group();
const socialData = [
    { file:'assets/models/social-icons/github.glb', url:'https://github.com/username' },
    { file:'assets/models/social-icons/linkedin.glb', url:'https://linkedin.com/in/username' },
    { file:'assets/models/social-icons/twitter.glb', url:'https://twitter.com/username' }
];

socialData.forEach((iconData,i)=>{
    loader.load(iconData.file, gltf=>{
        const obj = gltf.scene;
        obj.scale.set(0.3,0.3,0.3);
        const angle = (i / socialData.length) * Math.PI * 2;
        obj.position.set(Math.cos(angle)*2, Math.sin(angle)*2, 0);
        obj.userData.url = iconData.url;
        socialGroup.add(obj);
    });
});
scene.add(socialGroup);

// Cursor-based camera
let mouseX=0, mouseY=0;
document.addEventListener('mousemove', e=>{
    mouseX = (e.clientX/window.innerWidth -0.5)*2;
    mouseY = (e.clientY/window.innerHeight -0.5)*2;
});

// Animate
function animate(){
    requestAnimationFrame(animate);

    // Particles motion
    particles.children.forEach((p,i)=>{
        const t = Date.now()*0.001;
        p.position.x = p.userData.original.x + Math.sin(t+i)*0.5;
        p.position.y = p.userData.original.y + Math.cos(t+i)*0.5;
        p.position.z = p.userData.original.z + Math.sin(t+i*1.1)*0.5;
        p.rotation.x += 0.01;
        p.rotation.y += 0.01;
    });

    // Social icons rotation (orbit)
    const t = Date.now()*0.001;
    socialGroup.children.forEach((obj,i)=>{
        const angle = (i / socialGroup.children.length)*Math.PI*2 + t;
        obj.position.x = Math.cos(angle)*2;
        obj.position.y = Math.sin(angle)*2;
        obj.rotation.y += 0.02;
    });

    // Camera smooth interpolation
    camera.position.x += (mouseX*2 - camera.position.x)*0.05;
    camera.position.y += (-mouseY*2 - camera.position.y)*0.05;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
