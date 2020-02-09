import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';

export class FillingPyramidData {
    constructor(topFrontLeftX, topFrontLeftY, topFrontLeftZ, currentHeight) {
        this.x = topFrontLeftX;
        this.y = topFrontLeftY;
        this.z = topFrontLeftZ;
        this.height = currentHeight;
    }

    generateVertices() {
        return [
            new THREE.Vector3(this.x, this.y, this.z),//0
            new THREE.Vector3(this.x + this.height, this.y, this.z),//1
            new THREE.Vector3(this.x + this.height / 2, this.y - this.height, (this.z - this.height / 2)),//2
            new THREE.Vector3(this.x, this.y, (this.z - this.height)),//3
            new THREE.Vector3(this.x + this.height, this.y, (this.z - this.height))//4
        ];

        /*
             3----4
            /|  |/
           0-|--1
            \ |/
             2
        */
    }

    getNextIterationVertices() {
        return [
            new THREE.Vector3(this.x - this.height / 4, this.y - this.height / 2, this.z + this.height / 4),//0
            new THREE.Vector3(this.x + this.height - this.height / 4, this.y - this.height / 2, this.z + this.height / 4),//1
            new THREE.Vector3(this.x - this.height / 4, this.y - this.height / 2, this.z - this.height + this.height / 4),//2
            new THREE.Vector3(this.x + this.height - this.height / 4, this.y - this.height / 2, this.z - this.height + this.height / 4),//3
            new THREE.Vector3(this.x + this.height / 4, this.y + this.height / 2, this.z - this.height / 4)//4
        ];

        /*
               .
              / \
             /-4--/
            3|2 |/
           0-1--/

             --4---
            /|  |/
          2--|--- 3
          0 \ |/ 1
             .
        */
    }
}