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

    //const mainHeight = canvas.clientWidth / 960 * (2 + ((canvas.clientWidth - 500) / 100) * 0.03);
    const mainHeight = 2.34375 + ((canvas.clientWidth - 500) / 142 * 0.250825);
    const moveUpBy = ((canvas.clientWidth - 500) / 100) * 0.09;

    //the information I need to generate these pyramids is their left, bottom, front corner point and their height
    //height will be half the previous iteration's
    //the points I'll get are the previous bottom left front point, that same point but moved back half previous height, moved right half previous height, and moved up half previous height while also back and right one quarter previous height
    //drawing five new pyramids per one previous pyramid, 4 on the bottom, one on top
    //luckily the triangles are always made in the same vertex order
    //I don't know if separate pyramids will rotate at different rates
    //I'm also unsure if I could make the entire shape loop correct by letting it connect the triangles
    //wait, yes! I can!

    let showData = [true, false];//normal pyramid, filling pyramid, maybe another in the future

    const fractal = new THREE.Geometry();
    let vertices = [];
    let amountOfVerticesPerShape = 5;//fractal.vertices.length;

    //change the amount of iterations to perform here
    let amountOfIterations = 1;//8;
    let maxIterations = 7;

    function updateVertices() {
        //fractal.vertices = [];

        //console.log("iterations is " + amountOfIterations);

        vertices = [];
        if(showData[0]) {
            let nPD = [new NormalPyramidData(-(mainHeight / 2), -(mainHeight / 2) + moveUpBy, (mainHeight / 2), mainHeight)];

            for(let iterations = amountOfIterations; iterations > 0; iterations--) {
                if(iterations > 1) {
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
            let fPD = [new FillingPyramidData(-(mainHeight / 2) + (mainHeight / 4), -(mainHeight / 2) + (mainHeight / 4 * 2) + moveUpBy, (mainHeight / 2) - (mainHeight / 4), mainHeight / 2)];

            let previousLength = 1;
            for(let iterations = amountOfIterations - 1; iterations > 0; iterations--) {
                if(iterations > 1) {
                    const fPDFrozenLength = fPD.length;
                    for(let i = 0; i < previousLength; i++) {
                        const nextIterationVertices = fPD[fPDFrozenLength - previousLength + i].getNextIterationVertices();
                        for(let j = 0; j < nextIterationVertices.length; j++)
                            fPD.push(new FillingPyramidData(nextIterationVertices[j].x, nextIterationVertices[j].y, nextIterationVertices[j].z, fPD[fPDFrozenLength - previousLength].height / 2));
                    }
                    previousLength = fPD.length - fPDFrozenLength;
                }
            }
            for(let i = 0; i < fPD.length; i++) {
                const currentVertices = fPD[i].generateVertices();
                for(let j = 0; j < currentVertices.length; j++)
                    vertices.push(currentVertices[j]);
            }
        }

        //fractal.vertices = vertices;

        //console.log(vertices.length + " how long?");

        return vertices;
    }
    fractal.vertices = updateVertices();

    function updateFaces(vertLength) {
        //fractal.faces = [];
        let faces = [];

        let amountOfPyramids = vertLength / amountOfVerticesPerShape;

        //console.log("amount of p " + amountOfPyramids);

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

    //Start with one large pyramid
    //wait, could it be as easy as using the same code as the large pyramid but with a reduce by variable parameter?
    //the size of pyramids reduces by half each time
    //four new pyramids take the place of one old pyramid

    //fractal.computeFaceNormals();//for lighting on phong material
    //fractal.computeVertexNormals();

    let wireframeEnabled = false;

    function makeFractalInstance(fractal, color, x) {
        let uniforms = {
            delta: {value: 0}
        };

        //const material = new THREE.MeshPhongMaterial({color});
        //const material = new THREE.ShaderMaterial({color});//this somehow makes red

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            wireframe: wireframeEnabled
        });

        const frctl = new THREE.Mesh(fractal, material);
        scene.add(frctl);

        frctl.position.x = x;
        return frctl;
    }

    const fractals = [//TODO I think I need functions that create the shape for the first time and then functions to update them using set() and the updated needed variables
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

    function clearObject(obj) {
        while(obj.children.length > 0){
            clearThree(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose();

        if(obj.material){
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if(!obj.material[prop])
                    return;
                if(typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose()
            });
            obj.material.dispose()
        }
    }

    let timeInterval = 5;
    let lastTime = 0;
    //for(let i = 0; i < fractals.length; i++)
        //fractals[i].dynamic = true;
    /*fractals.forEach((frctl, ndx) => {
        frctl.mesh.geometry.dynamic = true;
    });*/

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
                        wireframeEnabled = !wireframeEnabled;
                    }
                }
                else
                    amountOfIterations++;

                //console.log("Before " + frctl.geometry.vertices.length);
                frctl.geometry.vertices = updateVertices();
                frctl.geometry.verticesNeedUpdate = true;
                //console.log("After " + frctl.geometry.vertices.length);

                //removing this part seems to cause an infinite loop of warnings and a massive memory leak, killing the single chrome tab task helped
                //frctl.geometry.faces = [];
                //console.log("Before face " + frctl.geometry.faces.length);
                frctl.geometry.faces =  updateFaces(frctl.geometry.vertices.length);
                frctl.geometry.groupsNeedUpdate = true;
                //console.log("After face " + frctl.geometry.faces.length);

                scene.remove(frctl);
                let nextIt = new THREE.Geometry();
                nextIt.vertices = frctl.geometry.vertices;
                nextIt.faces = frctl.geometry.faces;

                let f = makeFractalInstance(nextIt, 0x44FF44, 0);
                f.rotation.y = rot;
                frctl = f;
                scene.add(frctl);
                //fractals.pop();
                fractals.push(frctl);
                fractals.shift();

                //console.log(fractals);

                //frctl.geometry.__dirtyVertices = true;
            }

            /*if(time - lastTime > timeInterval) {
                lastTime = time;

                if(amountOfIterations === 8)
                    amountOfIterations = 1;
                else
                    amountOfIterations++;

                //console.log(amountOfIterations);

                //frctl.dynamic = true;

                //console.log(frctl.vertices);

                //let newVertices = updateVertices();
                //for(let i = 0; i < newVertices.length; i++) {
                    //console.log(frctl.vertices.length + " yeeee");
                    //frctl.vertices[i].set(newVertices[i]);
                //}
                //frctl.vertices = updateVertices();
                //console.log("how about here? " + frctl.vertices.length);
                //frctl.verticesNeedUpdate = true;

                //updateFaces(frctl.vertices.length);
                //frctl.groupsNeedUpdate = true;
            }*/

            //console.log(time);

            //console.log(frctl.material.uniforms.delta.value % 10);

            //if(Math.floor(frctl.material.uniforms.delta.value % 10) == 0) {
                //console.log("Testin");
            //}
        });

        /*if(time - lastTime > timeInterval) {
            lastTime = time;

            if (amountOfIterations === 8)
                amountOfIterations = 1;
            else
                amountOfIterations++;

            //console.log("Before " + fractal.vertices.length);
            fractal.vertices = updateVertices();
            fractal.geometry.verticesNeedUpdate = true;
            //console.log("After " + fractal.vertices.length);

            //console.log("Before face " + fractal.faces.length);
            updateFaces(fractal.vertices.length);
            fractal.groupsNeedUpdate = true;
            //console.log("After face  " + fractal.faces.length);
        }*/

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();