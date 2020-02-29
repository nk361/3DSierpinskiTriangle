import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';
import {NormalPyramidData} from "./NormalPyramidData.js";
import {FillingPyramidData} from "./FillingPyramidData.js";
import {vertexShader, fragmentShader} from "./Shaders.js";

function main() {
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    const fov = 75;
    const aspect = 2;//the canvas default
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

    //Max height
    //4.852
    //Min height
    //2.34375
    //with the difference of
    //2.50825

    //4.852 - (x * 2.34375)//where x needs to be 0 when window is full size and
    //x needs to be put in the range of 0 to 1
    //maybe I should get the width of the window when at the biggest size and at the smallest size
    //and make it 0 to 1 based on the space between them

    //Max width
    //1920
    //Min width
    //500
    //with the difference of
    //1420

    //2.50825/1420
    //0.0017663732 * 142 = 0.250825 size step

    //1 * 142 unit of change over width

    //mainHeight = 2.34375 + ((currentWidth - 500) / 142 * 0.250825)

    //I'll just leave these comments here so I know my reasoning for all this later
    //parameters have changed after testing, but the math is still relevant

    const mainHeight = 2.34375 + ((canvas.clientWidth - 500) / 142 * 0.250825);
    const moveUpBy = ((canvas.clientWidth - 500) / 100) * 0.09;

    let showData = [true, false];//normal pyramid, filling pyramid, maybe another in the future

    const fractal = new THREE.Geometry();
    let vertices = [];
    let amountOfVerticesPerShape = 5;

    //change the amount of iterations to perform here
    let amountOfIterations = 1;//start animation on this amount
    let maxIterations = 7;

    let nPD;
    let fPD;

    function updateVertices(generateFromScratch = true) {
        let iterations;

        if(generateFromScratch) {//Generating from scratch
            nPD = [new NormalPyramidData(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2), mainHeight)];
            fPD = [new FillingPyramidData(-(mainHeight / 2) + (mainHeight / 4), -(mainHeight / 2) + (mainHeight / 4 * 2) + moveUpBy, (mainHeight / 2) - (mainHeight / 4), mainHeight / 2)];
            iterations = 0;
            vertices = [];
        }
        else//Reused data!!!
            iterations = amountOfIterations - 1;//TODO this needs fixed to allow multiple iterations to generate on old data, performing multiple iterations

        if(showData[0]) {
            for(let iteration = amountOfIterations; iteration > iterations; iteration--) {
                if(iteration > 1) {
                    const nPDFrozenLength = nPD.length;
                    for(let i = 0; i < nPDFrozenLength; i++) {
                        const nextIterationVertices = nPD[i].getNextIterationVertices();
                        for(let j = 0; j < nextIterationVertices.length; j++) {
                            nPD.push(new NormalPyramidData(nextIterationVertices[j].x, nextIterationVertices[j].y, nextIterationVertices[j].z, nPD[0].height / 2));
                        }
                    }
                    for(let i = 0; i < nPDFrozenLength; i++)
                        nPD.shift();
                }
                vertices = [];
                for(let i = 0; i < nPD.length; i++) {
                    const currentVertices = nPD[i].generateVertices();
                    for(let j = 0; j < currentVertices.length; j++)
                        vertices.push(currentVertices[j]);
                }
            }
        }

        if(showData[1] && amountOfIterations !== 1) {//there is no void to fill on 1 iteration of the original code
            let previousAddedAmount = 1;//this needs to be set to 1 here or else the value does not change
            for(let i = 0, val = 1; val < fPD.length; i++, val = Math.pow(5, i))
                previousAddedAmount = val;
            for(let iteration = amountOfIterations - 1; iteration > (iterations - 1 === -1 ? 0 : iterations - 1); iteration--) {
                if(iteration > 1) {
                    const fPDFrozenLength = fPD.length;
                    for(let i = 0; i < previousAddedAmount; i++) {
                        const nextIterationVertices = fPD[fPDFrozenLength - previousAddedAmount + i].getNextIterationVertices();
                        for(let j = 0; j < nextIterationVertices.length; j++)
                            fPD.push(new FillingPyramidData(nextIterationVertices[j].x, nextIterationVertices[j].y, nextIterationVertices[j].z, fPD[fPDFrozenLength - previousAddedAmount].height / 2));
                    }
                    previousAddedAmount = fPD.length - fPDFrozenLength;
                }
            }
            for(let i = 0; i < fPD.length; i++) {
                const currentVertices = fPD[i].generateVertices();
                for(let j = 0; j < currentVertices.length; j++)
                    vertices.push(currentVertices[j]);
            }
        }
        return vertices;
    }
    fractal.vertices = updateVertices();

    function updateFaces(vertLength) {
        let faces = [];

        let amountOfPyramids = vertLength / amountOfVerticesPerShape;
        for(let i = 0; i < amountOfPyramids; i++) {
            faces.push(
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
        return faces;
    }
    fractal.faces = updateFaces(fractal.vertices.length);

    function makeFractalInstance(fractal, color, x) {
        let uniforms = {
            delta: {value: 0}
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
        });

        const frctl = new THREE.Mesh(fractal, material);
        scene.add(frctl);

        frctl.position.x = x;
        return frctl;
    }

    function makeOutlineInstance(fractalMesh, color, x) {//I'm surprised to see that this does NOT outline triangles like the material wireframe property
        let edgeGeometry = new THREE.EdgesGeometry(fractalMesh.geometry);
        let edgeMaterial = new THREE.LineBasicMaterial({ color });
        let wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        scene.add(wireframe);

        wireframe.position.x = x;
        return wireframe;
    }

    const fractals = [
        makeFractalInstance(fractal, 0x44FF44, 0)
    ];

    const outlines = [
        makeOutlineInstance(fractals[0], 0x000000, 0)
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

    let timeInterval = 5;
    let lastTime = 0;

    let previousSettings = [showData[0], showData[1], amountOfIterations];//taking advantage of dynamic, multitype "array"s in JavaScript

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        fractals.forEach((frctl, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //fractal.rotation.x = rot;
            frctl.rotation.y = rot;
            outlines[ndx].rotation.y = rot;
            //fractal.rotation.z = rot;
            if(frctl.material.uniforms.delta.value > 100.53)//closest to 1 from cos(delta) to make the animation loop because cos(0) is 1
                frctl.material.uniforms.delta.value = 0.0;
            else
                frctl.material.uniforms.delta.value += 0.05;

            if(time - lastTime > timeInterval) {
                lastTime = time;

                if (amountOfIterations === maxIterations) {
                    amountOfIterations = 1;

                    if(showData[0] && !showData[1]) {//change to filled in
                        amountOfIterations++;//first iteration of filled in has no space to fill and so there is nothing
                        showData[0] = false;
                        showData[1] = true;
                    }
                    else if(!showData[0] && showData[1]) {//change to both
                        showData[0] = true;
                        //showData[1] is already true
                    }
                    else {//change back to just the normal
                        showData[0] = true;
                        showData[1] = false;
                    }
                }
                else
                    amountOfIterations++;

                let generateFromScratch = !(showData[0] === previousSettings[0] && showData[1] === previousSettings[1] && amountOfIterations >= previousSettings[2]);

                frctl.geometry.vertices = updateVertices(generateFromScratch);
                frctl.geometry.verticesNeedUpdate = true;

                //removing this part seems to cause an infinite loop of warnings and a massive memory leak, killing the single chrome tab task helped
                frctl.geometry.faces =  updateFaces(frctl.geometry.vertices.length);
                frctl.geometry.groupsNeedUpdate = true;

                scene.remove(frctl);
                let nextIt = new THREE.Geometry();
                nextIt.vertices = frctl.geometry.vertices;
                nextIt.faces = frctl.geometry.faces;

                let f = makeFractalInstance(nextIt, 0x44FF44, 0);
                f.rotation.y = rot;
                frctl = f;
                scene.add(frctl);
                fractals.push(frctl);
                fractals.shift();

                scene.remove(outlines[ndx]);
                let out = makeOutlineInstance(f, 0x4F4F4F, 0);
                out.rotation.y = rot;
                scene.add(out);
                outlines.push(out);
                outlines.shift();

                previousSettings[0] = showData[0];//use this to check whether it is safe to reuse old mesh data for efficiency sake
                previousSettings[1] = showData[1];
                previousSettings[2] = amountOfIterations;
            }
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();