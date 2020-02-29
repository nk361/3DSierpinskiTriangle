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
        
        //  Function from Iñigo Quiles
        //  https://www.shadertoy.com/view/MsS3Wc
        vec3 hsb2rgb( in vec3 c ){
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                     6.0)-3.0)-1.0,
                                     0.0,
                                     1.0 );
            rgb = rgb*rgb*(3.0-2.0*rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        
        void main()
        {
            //float red = (1.0 + cos(pos.x + delta)) / 2.0;
            //float green = (1.0 + cos(pos.y + delta)) / 2.0;
            //float blue = (1.0 + cos(pos.z + delta)) / 2.0;
        
            // We map x (0.0 - 1.0) to the hue (0.0 - 1.0)
            // And the y (0.0 - 1.0) to the brightness
            vec3 color = hsb2rgb(vec3(pos.y / 4.0 - delta / 15.0,1.0,1.0));//changed y to 1.0 to keep only colors and replaced x with y to change from horizontal to vertical, subtracted delta for movement direction
        
            gl_FragColor = vec4(color, 1.0);//rgba used to set the color of the current pixel, currently all red
            
            //I wonder what other gl variables you can set
            
            //I'll need to set the color based on the y value in the position and maybe some other cool patterns to try
        }
    `
}