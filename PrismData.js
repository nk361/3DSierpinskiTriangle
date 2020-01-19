import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';

class PrismData {
    constructor(bottomFrontLeftX, bottomFrontLeftY, bottomFrontLeftZ, currentHeight) {
        this.x = bottomFrontLeftX;
        this.y = bottomFrontLeftY;
        this.z = bottomFrontLeftZ;
        this.height = currentHeight;
    }

    //I need to return the vertices and draw the faces all together to get one big mesh shape
    generateVertices() {
        //wait, if I have all the points in the vertices array, then all I have to do is loop over the same exact shape pushing the faces to the face array
        //wait again, I could even try reserving the old face data since the shape is the same, like going from
        //one to adding four total to adding four per shape in there already
        return [
            new THREE.Vector3(x, y, z),//0
            new THREE.Vector3(x + this.height, y, z),//1
            new THREE.Vector3(x + this.height / 2, this.height, z + this.height / 2),//2
            new THREE.Vector3(x, y, z + this.height),//3
            new THREE.Vector3(x + this.height, y, z + this.height)//4
        ];

        /*
               2
              / \
             3-|--4
            /|  |/
           0----1
        */
    }

    getNextIterationVertices() {
        return [
            new THREE.Vector3(x, y, z),//0
            new THREE.Vector3(x + this.height / 2, y, z),//1
            new THREE.Vector3(x + this.height / 2, y, z + this.height / 2),//2
            new THREE.Vector3(x, y, z + this.height / 2),//3
            new THREE.Vector3(x + this.height / 2, y + this.height / 2, z + this.height / 2)//4
        ];

        /*
               .
              / \
             /-4--/
            3|2 |/
           0-1--/
        */
    }
}