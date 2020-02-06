import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';
import {PyramidData} from "./PyramidData.js";
import {vertexShader, fragmentShader} from "./Shaders.js";

function main() {
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

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

    //mainHeight uses 960 as half of the desktop width to give a default pyramid height of about 2
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

    //the information I need to generate these pyramids is their left, bottom, front corner point and their height
    //height will be half the previous iteration's
    //the points I'll get are the previous bottom left front point, that same point but moved back half previous height, moved right half previous height, and moved up half previous height while also back and right one quarter previous height
    //drawing five new pyramids per one previous pyramid, 4 on the bottom, one on top
    //luckily the triangles are always made in the same vertex order
    //I don't know if separate pyramids will rotate at different rates
    //I'm also unsure if I could make the entire shape loop correct by letting it connect the triangles
    //wait, yes! I can!

    let pD = [new PyramidData(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2), mainHeight)];

    const fractal = new THREE.Geometry();
    let vertices = [];

    let amountOfVerticesPerShape = 5;//fractal.vertices.length;

    //change the amount of iterations to perform here
    for(let iterations = 8; iterations > 0; iterations--) {
        if(iterations > 1) {
            const pDFrozenLength = pD.length;
            for(let i = 0; i < pDFrozenLength; i++) {
                const nextIterationVertices = pD[i].getNextIterationVertices();
                for(let j = 0; j < nextIterationVertices.length; j++)
                    pD.push(new PyramidData(nextIterationVertices[j].x, nextIterationVertices[j].y, nextIterationVertices[j].z, pD[0].height / 2));
            }

            for(let i = 0; i < pDFrozenLength; i++)
                pD.shift();
        }

        vertices = [];
        for(let i = 0; i < pD.length; i++) {
            const currentVertices = pD[i].generateVertices();
            for(let j = 0; j < currentVertices.length; j++)
                vertices.push(currentVertices[j]);
        }
    }
    fractal.vertices = vertices;

    let amountOfPyramids = vertices.length / amountOfVerticesPerShape;

    for(let i = 0; i < amountOfPyramids; i++) {
        fractal.faces.push(
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

    //Start with one large pyramid
    //wait, could it be as easy as using the same code as the large pyramid but with a reduce by variable parameter?
    //the size of pyramids reduces by half each time
    //four new pyramids take the place of one old pyramid

    //fractal.computeFaceNormals();//for lighting on phong material
    //fractal.computeVertexNormals();

    function makeFractalInstance(fractal, color, x) {
        let uniforms = {
            delta: {value: 0}
        };

        //const material = new THREE.MeshPhongMaterial({color});
        //const material = new THREE.ShaderMaterial({color});//this somehow makes red

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader()
        });

        const frctl = new THREE.Mesh(fractal, material);
        scene.add(frctl);

        frctl.position.x = x;
        return frctl;
    }

    const fractals = [
        makeFractalInstance(fractal, 0x44FF44, 0)
    ];

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
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        fractals.forEach((fractal, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //fractal.rotation.x = rot;
            fractal.rotation.y = rot;
            if(fractal.material.uniforms.delta.value > 100.53)//closest to 1 from cos(delta) to make the animation loop because cos(0) is 1
                fractal.material.uniforms.delta.value = 0.0;
            else
                fractal.material.uniforms.delta.value += 0.1;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();