
"use strict";

function CreateTextureShader()
{
let VertexShaderTexture = `#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec4 aColor;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
out vec2 TexCoord;
out vec4 vertexColor;
void main()
{
    gl_Position =  uProjection * uView * uModel * vec4(aPosition, 1.0);
    TexCoord = aTexCoord;
    vertexColor = aColor;
}
`;

let FragmentShaderTexture = `#version 300 es
precision mediump float;
in vec2 TexCoord;
in vec4 vertexColor;
out vec4 FragColor;
uniform sampler2D uTexture0;
void main()
{
    FragColor = texture(uTexture0, TexCoord) * vertexColor;
}
`;

let shader = new Shader();
shader.Load(VertexShaderTexture, FragmentShaderTexture);
shader.Use();
shader.AddUniform("uProjection");
shader.AddUniform("uView");
shader.AddUniform("uModel");
shader.AddUniform("uTexture0");
shader.SetInteger("uTexture0", 0);
shader.UnSet();
return shader;

}

function   CreateColorShader()
{
let VertexShaderSolid = `#version 300 es

precision mediump float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec4 aColor;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
out vec4 vertexColor;


void main()
{
    gl_Position =  uProjection * uView * uModel * vec4(aPosition, 1.0);
    vertexColor = aColor;
}
`;

let FragmentShaderSolid = `#version 300 es
precision mediump float;

in vec4 vertexColor;
out vec4 fragColor;
void main()
{
    fragColor = vertexColor;
}
`;

let shader = new Shader();
shader.Load(VertexShaderSolid, FragmentShaderSolid);
shader.Use();
shader.AddUniform("uProjection");
shader.AddUniform("uView");
shader.AddUniform("uModel");
shader.UnSet();
return shader;

}

function CreatSkyboxShader()
{
    let VertexShaderSkybox = `#version 300 es
    precision mediump float;
    layout (location = 0) in vec3 aPosition;
    uniform mat4 uProjection;
    uniform mat4 uView;
    out vec3 TexCoord;
    void main()
    {
        TexCoord = aPosition;
        mat4 view =mat4(mat3(uView));
        vec4 pos = uProjection * view * vec4(aPosition, 1.0);
        gl_Position = pos.xyww;
    }
    `;

    let FragmentShaderSkybox = `#version 300 es
    precision mediump float;
    in vec3 TexCoord;
    out vec4 FragColor;
    uniform samplerCube cubeTexture;
    void main()
    {
        FragColor = texture(cubeTexture, TexCoord);
    }
    `;

    let shader = new Shader();
    shader.Load(VertexShaderSkybox, FragmentShaderSkybox);
    shader.Use();
    shader.AddUniform("uProjection");
    shader.AddUniform("uView");
    shader.AddUniform("cubeTexture");
    shader.UnSet();
    return shader;


}

function CreateInstanceShader()
{
let VertexShader = `#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aInstancePosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
out vec2 TexCoord;



void main()
{
    TexCoord = aTexCoord;
    

    gl_Position =  uProjection * uView * uModel * vec4(aPosition + aInstancePosition, 1.0);
}
`;

let FragmentShaderTexture = `#version 300 es
precision mediump sampler2DArray;
precision mediump float;
in vec2 TexCoord;
    
out vec4 FragColor;
uniform sampler2D uTexture0;

void main()
{
    
    vec4 texColor =  texture(uTexture0, TexCoord) ;
    FragColor =texColor;

}
`;

let shader = new Shader();
shader.Load(VertexShader, FragmentShaderTexture);
shader.Use();
shader.AddUniform("uProjection");
shader.AddUniform("uView");
shader.AddUniform("uModel");

shader.AddUniform("uTexture0");
shader.AddUniform("uAmbientColor");

shader.SetInteger("uTexture0", 0);
shader.SetUniform3f("uAmbientColor", 0.6, 0.6, 0.6);
shader.UnSet();
return shader;









}

function CreateLighing()
{

    
        let VertexShader = `#version 300 es
        precision mediump float;
        layout (location = 0) in vec3 aPosition;
        layout (location = 1) in vec2 aTexCoord;
        layout (location = 2) in vec3 aNormal;

        uniform mat4 uProjection;
        uniform mat4 uView;
        uniform mat4 uModel;
        uniform mat4 uLightSpaceMatrix;

        out vec2 TexCoord;
        out vec3 Normal;
        out vec3 FragPos;

        out vec4 lightSpace ;


        void main()
        {
            FragPos = (uModel * vec4(aPosition, 1.0)).xyz;

            gl_Position = uProjection * uView *  vec4(FragPos, 1.0);
            lightSpace = uLightSpaceMatrix *  vec4(FragPos, 1.0);
            

            TexCoord = aTexCoord;
            
            Normal = mat3(transpose(inverse(uModel))) * aNormal;  
            
            
            
        

        }

    `;

    let FragmentShader = `#version 300 es
    precision mediump float;
    
    out vec4 FragColor;

    in vec3 FragPos;  
    in vec3 Normal;  
    in vec2 TexCoord;
    in vec4 lightSpace ;


    

    struct DirectionalLight 
    {
        vec3 color;
        vec3 direction;
        float ambientIntensity;
        float diffuseIntensity;
    };



    uniform vec3 cameraPosition;
    uniform vec2 uTextureSize;
    uniform sampler2D uTexture0;
    uniform sampler2D uShadowMap;
    
    uniform DirectionalLight light;

    ///material
    uniform float specularIntensity;
    //  uniform vec3  spacularColor;
    uniform float shininess;
    


        float CalcShadow(vec3 direction)
        {
            vec3 projCoords = (lightSpace.xyz / lightSpace.w);
            projCoords = (projCoords * 0.5) + 0.5;

            float currentDepth = projCoords.z;
            float closestDepth = texture(uShadowMap, projCoords.xy).r; 

            vec3 normal = normalize(Normal);
            vec3 lightDir = normalize(light.direction);

            float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);

            float shadow = 0.0;
            vec2 texelSize = 1.0 / uTextureSize;
            for(int x = -1; x <= 1; ++x)
            {
                for(int y = -1; y <= 1; ++y)
                {
                    float pcfDepth = texture(uShadowMap, projCoords.xy + vec2(x, y) * texelSize).r; 
                    shadow += currentDepth - bias > pcfDepth  ? 1.0 : 0.0;        
                }    
            }

            shadow /= 9.0;

            if (projCoords.z > 1.0)
            {
                shadow = 0.0;
            }



            
                return shadow/2.0;
            //  shadow = currentDepth > closestDepth  ? 1.0 : 0.0;
            //  return shadow;
        }

    
        void main()
        {
            vec4 texColor =  texture(uTexture0, TexCoord) ;
            vec3 normal = normalize(Normal);
        
            
            vec4 ambientColour = vec4(light.color, 1.0f) * light.ambientIntensity;
            
            float diffuseFactor = max(dot(normalize(Normal), normalize(light.direction)), 0.0f);
            vec4 diffuseColour = vec4(light.color, 1.0f) * light.diffuseIntensity * diffuseFactor;
            
            vec4 specularColour = vec4(0, 0, 0, 0);
            
            if(diffuseFactor > 0.0f)
            {
                vec3 fragToEye = normalize(cameraPosition - FragPos);
                vec3 reflectedVertex = normalize(reflect(light.direction, normalize(Normal)));
                
                float specularFactor = dot(fragToEye, reflectedVertex);
                if(specularFactor > 0.0f)
                {
                    specularFactor = pow(specularFactor, shininess);
                    specularColour = vec4(light.color * specularIntensity * specularFactor, 1.0f);
                }
            }

        

            //   vec4 lighting = vec4(0.0, 0.0, 0.0,1.0); // color - black
            // lighting = ambient;
            // lighting = ambient * 0.0 + diffuse;
            // lighting = ambient * 0.0 + diffuse * 0.0 + specular;
            //   lighting = ambientColour * 0.0 + diffuseColour * 0.5 + specularColour * 0.5;

                float shadow= CalcShadow(light.direction) ;

            
        
            FragColor =  (ambientColour + (1.0 - shadow) *  (diffuseColour  + specularColour)) * texColor;
        }

`;

let shader = new Shader();
shader.Load(VertexShader, FragmentShader);
shader.Use();
shader.AddUniform("uProjection");
shader.AddUniform("uView");
shader.AddUniform("uModel");
shader.AddUniform("uLightSpaceMatrix");
shader.AddUniform("uTexture0");
shader.AddUniform("uShadowMap");
shader.AddUniform("cameraPosition");
shader.AddUniform("uTextureSize");

shader.AddUniform("light.color");
shader.AddUniform("light.direction");
shader.AddUniform("light.ambientIntensity");
shader.AddUniform("light.diffuseIntensity");

shader.AddUniform("specularIntensity");
shader.AddUniform("shininess");


shader.SetFloat("specularIntensity", 1.0);
shader.SetFloat("shininess", 1.0);

shader.SetUniform2f("uTextureSize", 512, 512);

shader.SetUniform3f("light.color", 1.0, 1.0, 1.0);
shader.SetUniform3f("light.direction", 0.0, -1.0, 0.0);
shader.SetFloat("light.ambientIntensity", 0.5);
shader.SetFloat("light.diffuseIntensity", 0.5);





shader.SetInteger("uTexture0", 0);
shader.SetInteger("uShadowMap", 1);



shader.UnSet();

return shader;

}

function CreateShadowShader()
{
            let VertexShader = `#version 300 es
            precision mediump float;
            layout (location = 0) in vec3 aPosition;
            uniform mat4 uLightSpaceMatrix;
            uniform mat4 uModel;
    
            void main()
            {
                
                gl_Position  =  uLightSpaceMatrix *  uModel* vec4(aPosition, 1.0);

            }

        `;

    let FragmentShader = `#version 300 es
        precision mediump float;
    

        out float fragDepth;
    

        void main() 
        {
            fragDepth = gl_FragCoord.z;


            
        
        }
        `;
        let shader = new Shader();
        shader.Load(VertexShader, FragmentShader);
        shader.Use();
        shader.AddUniform("uLightSpaceMatrix");
        shader.AddUniform("uModel");
        shader.UnSet();



        return shader;
}

function CreateScreenShader()
{
    let VertexShaderScreen = ` #version 300 es
    precision mediump float;
    layout (location = 0) in vec2 aPosition;
    out vec2 TexCoord;

    void main() 
    {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        TexCoord = (aPosition + 1.0) / 2.0;
    }
    `;

    let FragmentShaderScreen = ` #version 300 es
    precision mediump float;

    uniform sampler2D uTexture;
    in vec2 TexCoord;
    out vec4 FragColor;
    void main() 
    {
        FragColor = texture(uTexture, TexCoord);
    }
    `;

    let shader = new Shader();
    shader.Load(VertexShaderScreen, FragmentShaderScreen);
    shader.AddUniform("uTexture");
    shader.UnSet();
    return shader;
}

function  CreatScreenDepthShader()
{

    let VertexShaderScreen = ` #version 300 es
    precision mediump float;
    layout (location = 0) in vec2 aPosition;
    out vec2 TexCoord;

    void main() 
    {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        TexCoord = (aPosition + 1.0) / 2.0;
    }
    `;

    let FragmentShaderScreen = ` #version 300 es
    precision mediump float;

    uniform sampler2D uTexture;
    in vec2 TexCoord;
    out vec4 FragColor;
    void main() 
    {
            float depthValue = texture(uTexture, TexCoord).r;

            FragColor =  vec4(vec3(depthValue), 1.0);
    }
    `;

    let shader = new Shader();
    shader.Load(VertexShaderScreen, FragmentShaderScreen);
    shader.Use();
    shader.AddUniform("uTexture0");
    shader.SetInteger("uTexture0", 0);
    shader.UnSet();
    return shader;

}





class FilterShader
{
    constructor(width,height)
    {
        this.shader      =   new Shader();
        this.width      = width;
        this.height     = height;
        this.render     = new RenderTexture();
        this.render.Create(width, height);
        this.matrix = new Matrix4();
        this.matrix.ortho(0, width, height, 0, -0.1, 10);
    }
    Release()
    {
       
        this.render.Release();
    }
    Begin()
    {
       Core.SaveState();
       this.render.Begin();

    
    }
    End()
    {
       this.render.End();
      Core.RestoreState();

    }
   
    Render(deltaTime=0)
    {
            this.shader.Use();
            if (this.shader.ContainsUniform("uProjection"))
            {
                this.shader.SetUniformMatrix4fv("uProjection",this.matrix.m);
            }
            if (this.shader.ContainsUniform("uTexture"))
            {
                this.shader.SetInteger("uTexture", 0);
                Core.SetTexture( this.render,0);
            }
            if (this.shader.ContainsUniform("renderWidth"))
            {
                this.shader.SetFloat("renderWidth", this.width);
            }
            if (this.shader.ContainsUniform("renderHeight"))
            {
                this.shader.SetFloat("renderHeight", this.height);
            }
            if (this.shader.ContainsUniform("uTime"))
            {
                this.shader.SetFloat("uTime", deltaTime);
            }
            Renderer.Draw(0,0,this.width,this.height,WHITE);
    }

}

class Bloom extends FilterShader
{
    constructor(width, height)
    {
        super(width, height);
        let VertexShaderScreen = `#version 300 es
        precision mediump float;
        layout (location = 0) in vec3 aPosition;
        layout (location = 1) in vec2 aTexCoord;
        layout (location = 2) in vec4 aColor;
        uniform mat4 uProjection;
        out vec2 TexCoord;
        out vec4 vertexColor;
        void main()
        {
            gl_Position =  uProjection* vec4(aPosition, 1.0);
            TexCoord = aTexCoord;
            vertexColor = aColor;
        }
        `;
    
        let FragmentShaderScreen = `#version 300 es
        precision mediump float;
        in vec2 TexCoord;
        in vec4 vertexColor;
        out vec4 FragColor;
        uniform sampler2D uTexture0;
        uniform float renderWidth;
        uniform float renderHeight;


        const float samples = 5.0;          // Pixels per axis; higher = bigger glow, worse performance
        const float quality = 2.5;          // Defines size factor: Lower = smaller glow, better quality

  

        void main()
        {
            vec4 totalColor = vec4(0.0);
            vec2 size = vec2(renderWidth, renderHeight);   // Framebuffer size
            vec4 sum = vec4(0);
            vec2 sizeFactor = vec2(1)/size*quality;

            vec4 source = texture(uTexture0, TexCoord);
            const int range = 2;            // should be = (samples - 1)/2;

            for (int x = -range; x <= range; x++)
            {
                for (int y = -range; y <= range; y++)
                {
                    sum += texture(uTexture0, TexCoord + vec2(x, y)*sizeFactor);
                }
            }
            
            


            
           FragColor = ((sum/(samples*samples)) + source) * vertexColor;
         // FragColor =source * vertexColor;
        }
        `;
    
       
        this.shader.Load(VertexShaderScreen, FragmentShaderScreen);
        this.shader.Use();
        this.shader.AddUniform("uTexture");
        this.shader.AddUniform("uProjection");
        this.shader.SetInteger("uTexture", 0);
        this.shader.AddUniform("renderWidth");
         this.shader.AddUniform("renderHeight");
         this.shader.SetInteger("uTexture", 0);
         this.shader.SetFloat("renderWidth", width);
         this.shader.SetFloat("renderHeight", height);
         this.shader.UnSet();
    }
}