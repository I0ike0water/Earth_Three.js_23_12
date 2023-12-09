import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

import {cameraPosition, materialReflectivity} from "three/nodes";
import {Float32BufferAttribute} from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	innerWidth / innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer(
	{
		antialias:true //안티에얼라이징
	}
);

renderer.setSize( innerWidth, innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

const material = new THREE.ShaderMaterial({
	uniforms:{
		globeTexture: {
			value : new THREE.TextureLoader().load('./image/EarthS.jpg')
		}
	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader
})

//지구 만들기
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(5, 100, 100),
	//new THREE.MeshBasicMaterial({
		//color : 0xff0000,
		//map : new THREE.TextureLoader().load('./image/EarthS.jpg')
	//}),
	material
)

scene.add(sphere)

//지구의 대기
const atmosphere = new THREE.Mesh(
	new THREE.SphereGeometry(5, 100, 100),
	new THREE.ShaderMaterial({
		vertexShader : atmosphereVertexShader,
		fragmentShader : atmosphereFragmentShader,
		blending: THREE.AdditiveBlending,
		side : THREE.BackSide
	})
)

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial(
	{
		color : 0xffffff
	}
);

const startVertices = []
for (let i = 0; i < 10000; i++){
	const x = (Math.random() - 0.5) * 2000;
	const y = (Math.random() - 0.5) * 2000;
	const z = -Math.random() * 2000 -100;
	startVertices.push(x, y, z);
}

starGeometry.setAttribute('position',
	new Float32BufferAttribute(startVertices, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars)

atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

camera.position.z = 15 //카메라 위치 조정

const mouse = {
	x : undefined,
	y : undefined
}

let EarthRotateSpeed = 0.001

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	sphere.rotation.y += EarthRotateSpeed;
	gsap.to(group.rotation, {
		y: mouse.x * (1.2 + EarthRotateSpeed * 10),
		x: -mouse.y * 1.2,
		duration : 2
	})
}
animate();

//----------------- 마우스 휠 관련 ------------------------//

const CameraPositionInfo = document.createElement('div');
CameraPositionInfo.style.position = 'fixed';
CameraPositionInfo.style.top = '600px';
CameraPositionInfo.style.left = '800px';
CameraPositionInfo.style.color = 'white';
CameraPositionInfo.style.fontFamily = 'Arial, sans-serif';
CameraPositionInfo.style.fontSize = '18px';
CameraPositionInfo.style.display = 'none'; // Initially hide the text
document.body.appendChild(CameraPositionInfo);

const MouseWheelText = document.createElement('div');
MouseWheelText.style.position = 'fixed';
MouseWheelText.style.top = '600px';
MouseWheelText.style.left = '400px';
MouseWheelText.style.color = 'white';
MouseWheelText.style.fontFamily = 'Arial, sans-serif';
MouseWheelText.style.fontSize = '18px';
MouseWheelText.style.display = 'none'; // Initially hide the text
document.body.appendChild(MouseWheelText);

addEventListener('mousemove', ()=>{
	mouse.x = (event.clientX / innerWidth) * 2 - 1
	mouse.y = -(event.clientY / innerHeight) * 2 + 1
	//console.log(mouse)
})

function handleMouseWheel(event){
	const delta = event.deltaY;
	const tempCameraPositionZ = camera.position.z;
	camera.position.z += delta * 0.01;

	MouseWheelText.style.display = 'block';
	if(tempCameraPositionZ > camera.position.z){
  		MouseWheelText.textContent = `떨어진다!`;
	}
	else{
  		MouseWheelText.textContent = `멀어진다!`;
	}

	CameraPositionInfo.style.display = 'block';
  	CameraPositionInfo.textContent = `Camera Z Position: ${camera.position.z.toFixed(2)}`;

	setTimeout(() => {
    MouseWheelText.style.display = 'none';
    CameraPositionInfo.style.display = 'none';
 	 }, 2000);

	event.preventDefault();
}

window.addEventListener('wheel', handleMouseWheel);

//---------------------- Slider 관련 코드------------------------------------------------//
const EarthSlider = document.getElementById('EarthSlider');
EarthSlider.addEventListener('input', ()=>{
	const newScale = parseFloat(EarthSlider.value);
	sphere.scale.set(newScale, newScale, newScale);
})

const AtmosphereSlider = document.getElementById('AtmosphereSlider');
AtmosphereSlider.addEventListener('input', ()=>{
	const newScale = parseFloat(AtmosphereSlider.value);
	atmosphere.scale.set(newScale, newScale, newScale);
})

const OrbitSpeed = document.getElementById('OrbitSpeedSlider');
OrbitSpeed.addEventListener('input', ()=>{
	EarthRotateSpeed = parseFloat(OrbitSpeed.value);
})