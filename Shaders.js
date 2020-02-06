export function vertexShader() {//executes per vertex
    return `
        varying vec3 pos;//varying sends this to the fragment shader, a position to let the color change related to it
        
        void main()
        {
            pos = position;
            
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);//position is the position of the vertex while the modelViewMatrix is the position of the model in the scene
            gl_Position = projectionMatrix * modelViewPosition;//using the camera position to get the camera's relationship to the model in the scene, gl_Position is the exact vertex position in our scene
            
            
        }
    `
}

export function fragmentShader() {//executes per pixel
    return `
        varying vec3 pos;//varying sends this to the fragment shader, a position to let the color change related to it
        uniform float delta;//I think this is current time for use in animation changes
        
        void main()
        {
            float red = (1.0 + cos(pos.x + delta)) / 2.0;
            float green = (1.0 + cos(pos.y + delta)) / 2.0;
            float blue = (1.0 + cos(pos.z + delta)) / 2.0;
        
            gl_FragColor = vec4(red, green, blue, 1.0);//rgba used to set the color of the current pixel, currently all red
            
            //I'll need to set the color based on the y value in the position and maybe some other cool patterns to try
        }
    `
}