import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';
import {PrismData} from "./PrismData.js";

function main() {
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;

    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    //mainHeight uses 960 as half of the desktop width to give a default prism height of about 2
    //when on mobile, no move up by and main height * 5
    //when on desktop, 1.2 move up by and main height * 2.4
    //when on desktop, width is 1920
    //when on mobile width is 500
    //ratio between widths is 3.84
    //ratio for multiplying main height is 2.08
    //so I need to use the ratio of the widths to scale the two other variables by adding a step relative to the width ratio
    //for every 3.84 over 500, subtract
    //1420 may be too many small, insignificant steps
    //142 steps for going between 5 and 2.4 along with 0 to 1.2
    //2.6 / 142 is 0.018 and 1.2 / 142 is 0.008
    //14.2 steps
    //2.6 / 14.2 is 0.18 and 1.2 / 14.2 is 0.08
    //main height * 5 - ((width - 500) / 100) * 0.18
    //move up = ((width - 500) / 100) * 0.08
    //I'll just leave these comments here so I know my reasoning for all this later
    //parameters have changed after testing, but the math is still relevant
    const mainHeight = canvas.clientWidth / 960 * (2 + ((canvas.clientWidth - 500) / 100) * 0.03);
    const moveUpBy = ((canvas.clientWidth - 500) / 100) * 0.09;

    //the information I need to generate these prisms is their left, bottom, front corner point and their height
    //height will be half the previous iteration's
    //the points I'll get are the previous bottom left front point, that same point but moved back half previous height, moved right half previous height, and moved up half previous height while also back and right one quarter previous height
    //drawing five new prisms per one previous prism, 4 on the bottom, one on top
    //luckily the triangles are always made in the same vertex order
    //I don't know if separate prisms will rotate at different rates
    //I'm also unsure if I could make the entire shape loop correct by letting it connect the triangles
    //wait, yes! I can!

    let pD = [new PrismData(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2), mainHeight)];

    const firstPrism = new THREE.Geometry();
    const vertices = pD[0].generateVertices();
    for(let i = 0; i < vertices.length; i++)
        firstPrism.vertices.push(vertices[i]);

    let amountOfVerticesPerShape = 5;
    let amountOfPrisms = vertices.length / amountOfVerticesPerShape;

    for(let i = 0; i < amountOfPrisms; i++) {
        firstPrism.faces.push(
            //front
            new THREE.Face3(0 + i * amountOfVerticesPerShape, 1 + i * amountOfVerticesPerShape, 2 + i * amountOfVerticesPerShape),
            //right
            new THREE.Face3(1 + i * amountOfVerticesPerShape, 4 + i * amountOfVerticesPerShape, 2 + i * amountOfVerticesPerShape),
            //back
            new THREE.Face3(4 + i * amountOfVerticesPerShape, 3 + i * amountOfVerticesPerShape, 2 + i * amountOfVerticesPerShape),
            //left
            new THREE.Face3(3 + i * amountOfVerticesPerShape, 0 + i * amountOfVerticesPerShape, 2 + i * amountOfVerticesPerShape),
            //bottom
            new THREE.Face3(3 + i * amountOfVerticesPerShape, 1 + i * amountOfVerticesPerShape, 0 + i * amountOfVerticesPerShape),
            new THREE.Face3(3 + i * amountOfVerticesPerShape, 4 + i * amountOfVerticesPerShape, 1 + i * amountOfVerticesPerShape)
        );
    }

    /*const prism = new THREE.Geometry();
    prism.vertices.push(
        new THREE.Vector3(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2)),//0
        new THREE.Vector3((mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2)),//1
        new THREE.Vector3(0, (mainHeight / 2) + moveUpBy, 0),//2
        new THREE.Vector3(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, -(mainHeight / 2)),//3
        new THREE.Vector3((mainHeight / 2), -(mainHeight / 2) + moveUpBy, -(mainHeight / 2))//4
    );*/

    /*
           2
          / \
         3-|--4
        /|  |/
       0----1
    */

    /*prism.faces.push(
        //front
        new THREE.Face3(0, 1, 2),
        //right
        new THREE.Face3(1, 4, 2),
        //back
        new THREE.Face3(4, 3, 2),
        //left
        new THREE.Face3(3, 0, 2),
        //bottom
        new THREE.Face3(3, 1, 0),
        new THREE.Face3(3, 4, 1)
    );*/

    //Start with one large prism
    //wait, could it be as easy as using the same code as the large prism but with a reduce by variable parameter?
    //the size of prisms reduces by half each time
    //four new prisms take the place of one old prism

    function makeFractalInstance(fractal, color, x) {
        const material = new THREE.MeshBasicMaterial({color});

        const frctl = new THREE.Mesh(fractal, material);
        scene.add(frctl);

        frctl.position.x = x;
        return frctl;
    }

    const fractals = [
        makeFractalInstance(firstPrism, 0x44FF44, 0)
    ];

    /*function makePrismInstance(prism, color, x) {
        const material = new THREE.MeshBasicMaterial({color});

        const prsm = new THREE.Mesh(prism, material);
        scene.add(prsm);

        prsm.position.x = x;
        return prsm;
    }*/

    /*const prisms = [
        makePrismInstance(prism, 0x44FF44,  0),
        //makePrismInstance(prism, 0x4444FF, -4),
        //makePrismInstance(prism, 0xFF4444,  4),
    ];*/

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            //if(canvas.clientWidth > canvas.clientHeight)
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
            //else
                //camera.aspect = canvas.clientHeight / canvas.clientWidth;
            camera.updateProjectionMatrix();
        }

        fractals.forEach((fractal, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //fractal.rotation.x = rot;
            fractal.rotation.y = rot;
        });

        /*prisms.forEach((prism, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //prism.rotation.x = rot;
            prism.rotation.y = rot;
        });*/

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();