import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';

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

    const mainHeight = canvas.clientWidth / 960 * 2.5;//gives 2 when at ideal screen width, scales appropriately otherwise
    //const moveUpBy = 1.2;//canvas.clientHeight / (canvas.clientHeight / 1.5);
    console.log(mainHeight);
    console.log(canvas.clientWidth);

    const prism = new THREE.Geometry();
    prism.vertices.push(
        new THREE.Vector3(-(mainHeight / 2), -(mainHeight / 2)/* + moveUpBy*/, (mainHeight / 2)),//0
        new THREE.Vector3((mainHeight / 2), -(mainHeight / 2)/* + moveUpBy*/, (mainHeight / 2)),//1
        new THREE.Vector3(0, (mainHeight / 2)/* + moveUpBy*/, 0),//2
        new THREE.Vector3(-(mainHeight / 2), -(mainHeight / 2)/* + moveUpBy*/, -(mainHeight / 2)),//3
        new THREE.Vector3((mainHeight / 2), -(mainHeight / 2)/* + moveUpBy*/, -(mainHeight / 2))//4
    );

    /*
           2
          / \
         3-|--4
        /|  |/
       0----1
    */

    prism.faces.push(
        // front
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
    );

    //Start with one large prism
    //wait, could it be as easy as using the same code as the large prism but with a reduce by variable parameter?
    //the size of prisms reduces by half each time
    //four new prisms take the place of one old prism

    function makePrismInstance(prism, color, x) {
        const material = new THREE.MeshBasicMaterial({color});

        const prsm = new THREE.Mesh(prism, material);
        scene.add(prsm);

        prsm.position.x = x;
        return prsm;
    }

    const prisms = [
        makePrismInstance(prism, 0x44FF44,  0),
        //makePrismInstance(prism, 0x4444FF, -4),
        //makePrismInstance(prism, 0xFF4444,  4),
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
            //if(canvas.clientWidth > canvas.clientHeight)
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
            //else
                //camera.aspect = canvas.clientHeight / canvas.clientWidth;
            camera.updateProjectionMatrix();
        }

        prisms.forEach((prism, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //prism.rotation.x = rot;
            prism.rotation.y = rot;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();