
/*jslint node: true, vars: true, white: true */
"use strict";


const BlendMode =
{
    Normal: 0,
    Additive: 1,
    Multiply: 2,
    One : 3,
};

const CullMode =
{
    Front: 1,
    Back: 2,
    FrontAndBack: 3,
};

const DepthMode =
{
    None: 0,
    Less: 1,
    LessOrEqual: 2,
    Greater: 3,
    GreaterOrEqual: 4,
    Equal: 5,
    NotEqual: 6,
    Always: 7,
    Never: 8,
};

const FaceMode = 
{
    CW: 0,
    CCW: 1,
};


const POINTS                         = 0x0000;
const LINES                          = 0x0001;
const LINE_LOOP                      = 0x0002;
const LINE_STRIP                     = 0x0003;
const TRIANGLES                      = 0x0004;
const TRIANGLE_STRIP                 = 0x0005;
const TRIANGLE_FAN                   = 0x0006;

const PROJECTION_MATRIX = 0x0000;
const MODEL_MATRIX      = 0x0001;
const VIEW_MATRIX       = 0x0002;





class Color 
{
    constructor(r, g, b, a)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Set(r, g, b, a)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    SetColor(color)
    {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }
    SetHex(hex)
    {
        this.r = ((hex >> 16) & 0xff) / 255;
        this.g = ((hex >> 8) & 0xff) / 255;
        this.b = (hex & 0xff) / 255;
        this.a = ((hex >> 24) & 0xff) / 255;
    }
    SetRandom()
    {
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();
        this.a = 1.0;
    }
    static Fade(color, alpha)
    {
        if (alpha < 0.0) alpha = 0.0;
        else if (alpha > 1.0) alpha = 1.0;
        return new Color(color.r, color.g, color.b, alpha);
    }

}


const RED = new Color(1.0, 0.0, 0.0, 1.0);
const GREEN = new Color(0.0, 1.0, 0.0, 1.0);
const BLUE = new Color(0.0, 0.0, 1.0, 1.0);
const WHITE = new Color(1.0, 1.0, 1.0, 1.0);
const BLACK = new Color(0.0, 0.0, 0.0, 1.0);
const YELLOW = new Color(1.0, 1.0, 0.0, 1.0);
const MAGENTA = new Color(1.0, 0.0, 1.0, 1.0);
const CYAN = new Color(0.0, 1.0, 1.0, 1.0);
const ORANGE = new Color(1.0, 0.5, 0.0, 1.0);
const GRAY = new Color(0.5, 0.5, 0.5, 1.0);
const BROWN = new Color(0.5, 0.25, 0.0, 1.0);
const PURPLE = new Color(0.5, 0.0, 0.5, 1.0);
const PINK = new Color(1.0, 0.5, 0.5, 1.0);
const LIME = new Color(0.5, 1.0, 0.5, 1.0);
const TEAL = new Color(0.0, 0.5, 0.5, 1.0);
const OLIVE = new Color(0.5, 0.5, 0.0, 1.0);
const MAROON = new Color(0.5, 0.0, 0.0, 1.0);
const NAVY = new Color(0.0, 0.0, 0.5, 1.0);
const SILVER = new Color(0.75, 0.75, 0.75, 1.0);
const GOLD = new Color(1.0, 0.84, 0.0, 1.0);
const SKYBLUE = new Color(0.53, 0.81, 0.98, 1.0);
const VIOLET = new Color(0.93, 0.51, 0.93, 1.0);
const INDIGO = new Color(0.29, 0.0, 0.51, 1.0);
const TURQUOISE = new Color(0.25, 0.88, 0.82, 1.0);
const BEIGE = new Color(0.96, 0.96, 0.86, 1.0);
const TAN = new Color(0.82, 0.71, 0.55, 1.0);
const KHAKI = new Color(0.94, 0.9, 0.55, 1.0);
const LAVENDER = new Color(0.9, 0.9, 0.98, 1.0);
const SALMON = new Color(0.98, 0.5, 0.45, 1.0);
const CORAL = new Color(1.0, 0.5, 0.31, 1.0);
const AQUA = new Color(0.0, 1.0, 1.0, 1.0);
const MINT = new Color(0.74, 0.99, 0.79, 1.0);
const LEMON = new Color(0.99, 0.91, 0.0, 1.0);
const APRICOT = new Color(0.98, 0.81, 0.69, 1.0);
const PEACH = new Color(1.0, 0.9, 0.71, 1.0);
const LILAC = new Color(0.78, 0.64, 0.78, 1.0);
const LAVENDERBLUSH = new Color(1.0, 0.94, 0.96, 1.0);
const CRIMSON = new Color(0.86, 0.08, 0.24, 1.0);
const DARKORANGE = new Color(1.0, 0.55, 0.0, 1.0);
const LIGHTGRAY = new Color(0.83, 0.83, 0.83, 1.0);
const DARKGRAY = new Color(0.66, 0.66, 0.66, 1.0);
const DARKGREEN = new Color(0.0, 0.39, 0.0, 1.0);
const DARKBLUE = new Color(0.0, 0.0, 0.55, 1.0);
const DARKRED = new Color(0.55, 0.0, 0.0, 1.0);
const DARKCYAN = new Color(0.0, 0.55, 0.55, 1.0);
const RAYWHITE = new Color(0.96, 0.96, 0.96, 1.0);

class Texture
{
    constructor()
    {
        this.id = null;
        this.width = 0;
        this.height = 0;
        this.channels = 0;
        this.name = "";
    }
    Use()
    {
       //gl.bindTexture(gl.TEXTURE_2D, this.id);
       Core.SetTexture(this);
     
    }
    Unbind()
    {
       
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    Release()
    {
        gl.deleteTexture(this.id);
    }
}
//********************************************************************************************************************************************/

class Texture2D extends Texture
{
    constructor()
    {
        super();
      
    }
    Depth(width, height,clamp=true,pixels=true)
    {
        this.width = width;
        this.height = height;
        this.channels = 1;

        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_BYTE, null);

        if (pixels)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else 
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

  
        if (clamp)
        {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else
        {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }

    }
    Blank(width, height, channels=4,clamp=true,pixels=true)
    {
        this.width = width;
        this.height = height;
        this.channels = channels;
        let format = 0;
        if (channels === 4)
        {
            format = gl.RGBA;
        } else if (channels === 3)
        {
            format = gl.RGB;
        } else if (channels === 2)
        {
            format = gl.RG;
        } else 
        {
            format = gl.RED;
        }
        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
        if (pixels)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else 
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

  
        if (clamp)
        {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        } else
        {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }

    }

    Create(width, height, channels, data)
    {
        this.width = width;
        this.height = height;
        this.channels = channels;

        let format = 0;
        if (channels === 4)
        {
            format = gl.RGBA;
        } else if (channels === 3)
        {
            format = gl.RGB;
        } else if (channels === 2)
        {
            format = gl.RG;
        } else 
        {
            format = gl.RED;
        }
        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);
      //  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      //  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    Load(image)
    {
        try 
        {
            if (image.width === 0 || image.height === 0 || image.data === null) 
            {
                console.log("Invalid image");
                return false;
            }  
          
            this.id = gl.createTexture();
            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

            gl.bindTexture(gl.TEXTURE_2D, this.id);
     
 
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);

           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
   
            this.width = image.width;
            this.height = image.height;
            this.format = gl.RGBA;
        //    console.log( `Textura carregada com sucesso: ${this.width}x${this.height}`);

            return true;
        } 
        catch (e)
        {
            console.log(e);
        }
        return false;
    }
}


class TextureCube extends Texture
{
    constructor()
    {
        super();
      
       
    }

     Build(list)
    {

     


        //  this.faceInfos = 
        // [
        //     { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, image: list[0] }, //right
        //     { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, image: list[1] }, //left
        //     { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, image: list[2] },  //top
        //     { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, image: list[3] }, //bottom
        //     { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, image: list[4] }, // front
        //     { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, image: list[5] }, // back
        // ];

            this.id = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.id);

            for (let i = 0; i < list.length; i++)
            {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[i]);
            }
        
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[0]);
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[1]);
            
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[2]);
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[3]);
            
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[4]);
            // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, list[5]);

            
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
 

    }

}
//********************************************************************************************************************************************/

class RenderTexture extends Texture
{
    constructor()
    {
        super();
        this.frameBuffer = null;

        this.depthBuffer = null; 
        this.width = 0;
        this.height = 0;
        this.isBegin = false;
    }
    Create(width, height)
    {
        this.width = width;
        this.height = height;
        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);

        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        
    }
    Begin()
    {
       this.isBegin = true;

       this.saveViewport = Core.GetViewPort();

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        this.Use();
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0, 0, 0, 1);  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   
    }
    End()
    {
        if (this.isBegin === false) return;
        this.isBegin = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.Use();

    }
    Release()
    {
        gl.deleteFramebuffer(this.frameBuffer);
        gl.deleteFramebuffer(this.depthBuffer);
        gl.deleteTexture(this.id);
    }


}
//********************************************************************************************************************************************/


//********************************************************************************************************************************************/

class DepthBuffer
{
    constructor()
    {

        
        this.frame_buffer = null;
        this.color_buffer = null;
        this.depth_buffer = null;
        this.status = 0;
    }
    Create(width, height)
    {
        this.width = width;
        this.height = height;
    }
    Init()
    {
        this.frame_buffer = gl.createFramebuffer();

        this.color_buffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.color_buffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,                                        gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      

        this.depth_buffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depth_buffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0,                                        gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color_buffer, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,  gl.TEXTURE_2D, this.depth_buffer, 0);
      

        this.status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (this.status !== gl.FRAMEBUFFER_COMPLETE) 
        {
          console.log("The created frame buffer is invalid: " + this.status.toString());
        }
      
   
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }
    Begin ()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0,0,0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    End()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.color_buffer);
  

    }

    Release()
    {
        gl.deleteFramebuffer(this.id);
        gl.deleteTexture(this.color_buffer);
        gl.deleteTexture(this.depth_buffer);
      

    }

}

//********************************************************************************************************************************************/
class ShadowCaster
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.frameBuffer = null;
        this.texture = new Texture2D();
        this.depth = null;
        this.status = 0;
        this.shader = Core.GetShader("shadow");
        this.Init();

    }

    Release()
    {
        gl.deleteFramebuffer(this.frameBuffer);
        gl.deleteTexture(this.texture);
        gl.deleteRenderbuffer(this.depth);
    }

    Init()
    {
       

        this.frameBuffer = gl.createFramebuffer();
        this.texture.Blank(this.width, this.height);
        this.depth = gl.createRenderbuffer();

        this.texture.Use();

       

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.id, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth);

        this.status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (this.status !== gl.FRAMEBUFFER_COMPLETE) 
        {
          console.log("The created frame buffer is invalid: " + this.status.toString());
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      //  gl.drawBuffers([gl.NONE,gl.COLOR_ATTACHMENT1]);
        this.texture.Unbind();



    

    }

    UseTexture(layer=0)
    {

       Core.SetTexture(this.texture,layer);

    }

    Begin()
    {
  
        Core.DisableMaterial();
        Core.SetShader(this.shader);
   

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.viewport(0, 0, this.width, this.height);
        let c = 1;
        gl.clearColor(c,c,c, 0.2);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        Core.SetShadowTexture(this.texture);
   

    }
    
    End()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        Core.EnableMaterial();
        Core.SetShadowTexture(this.texture);
 
    }

}



//********************************************************************************************************************************************/

class Shader
{
    uniforms = {};
    
    constructor()
    {
        this.program = null;
    }

    Release()
    {
        gl.deleteProgram(this.program);

    }
 


    Load( vertexShaderSource, fragmentShaderSource)
    {
        
        this.program = gl.createProgram();
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.vertexShader, vertexShaderSource);
        gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        gl.compileShader(this.vertexShader);
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) 
        {
            console.error('Erro ao compilar o vertex shader!', gl.getShaderInfoLog(this.vertexShader));
            return;
        }
        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) 
        {
            console.error('Erro ao compilar o fragment shader!', gl.getShaderInfoLog(this.fragmentShader));
            return;
        }
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) 
        {
            console.error('Erro ao linkar o programa!', gl.getProgramInfoLog(this.program));
            return;
        }
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);

        this.Use();

      //  console.log("Shader carregado com sucesso" );

    }
    Use()
    {
        if (this.program === null) 
        {
            console.error("Programa invalido");
        }
        //gl.useProgram(this.program);
        Core.SetProgram(this.program);

    }

    UnSet()
    {
        gl.useProgram(null);

    }

    AddUniform(name)
    {
        if (this.program === null) return;
        
        this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    ContainsUniform(name)
    {
        if (this.program === null) return false;
        return this.uniforms[name] !== undefined;
    }
    SetFloat(name, value)
    {
        if (this.ContainsUniform(name))
        {
          
            gl.uniform1f(this.uniforms[name], value);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetUniform2f(name, x, y)
    {
        if (this.ContainsUniform(name))
        {
        
            gl.uniform2f(this.uniforms[name], x, y);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetUniform3f(name, x, y, z)
    {
        if (this.ContainsUniform(name))
        {
        
            gl.uniform3f(this.uniforms[name], x, y, z);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetColor(name, color)
    {
        if (this.ContainsUniform(name))
        {
            gl.uniform4f(this.uniforms[name], color.r, color.g, color.b, color.a);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetColor3(name, color)
    {
        if (this.ContainsUniform(name))
        {
            gl.uniform3f(this.uniforms[name], color.r, color.g, color.b);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetUniform4f(name, x, y, z, w)
    {
        if (this.ContainsUniform(name))
        {
      
            gl.uniform4f(this.uniforms[name], x, y, z, w);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetInteger(name, value)
    {
        if (this.ContainsUniform(name))
        {
    
            gl.uniform1i(this.uniforms[name], value);
        } else 
        {
            console.warn("Uniform not found: " + name);
        }
    }
    SetUniform4fv(name, value)
    {
        if (this.ContainsUniform(name))
        {
  
            gl.uniform4fv(this.uniforms[name], value);
        }
    }
    SetUniformMatrix4fv(name, value)
    {
        if (this.ContainsUniform(name))
        {
      
            gl.uniformMatrix4fv(this.uniforms[name], false, value);
        }
    }
    SetUniformMatrix2fv(name, value)
    {
        if (this.ContainsUniform(name))
        {

            gl.uniformMatrix2fv(this.uniforms[name], false, value);
        }
    }
    SetUniformMatrix3fv(name, value)
    {
        if (this.ContainsUniform(name))
        {
 
            gl.uniformMatrix3fv(this.uniforms[name], false, value);
        }
    }


}

//********************************************************************************************************************************************/


class ScreenQuad
{
    constructor()
    {
        this.VBO = null;
        this.VAO = null;
        this.Init();
    }
    Init(size=1.0)
    {
        this.VBO = gl.createBuffer();
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);
        const vertices = new Float32Array([
            -size, -size,
            size, -size,
            -size, size,
            size, size,
        ]);
  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

    }
    Render()
    {
        gl.bindVertexArray(this.VAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }
    Release()
    {
        gl.deleteBuffer(this.VBO);
        gl.deleteVertexArray(this.VAO);
    }
}

//********************************************************************************************************************************************/
class Renderer 
{
    
    static Init()
    {
        
        
        Renderer.vertexBuffer = gl.createBuffer();
        Renderer.indexBuffer  = gl.createBuffer();
    

      

     

       
    }
   

    static Draw(x,y,w,h,color)
    {

        let vertexStrideSize = (3 + 2 + 4);
        let vertices = new Float32Array(4 * vertexStrideSize);
        let indices  = new Uint16Array(4 * 6);   

        indices[0 ]=   0;
        indices[1] =   1;
        indices[2] =   2;
        indices[3] =   0;
        indices[4] =   2;
        indices[5] =   3;

        const Vertex = (index, x, y, z, u, v, color) =>
        {
            let offset = index * vertexStrideSize;
            vertices[offset + 0] = x;
            vertices[offset + 1] = y;
            vertices[offset + 2] = z;
            vertices[offset + 3] = u;
            vertices[offset + 4] = v;
            vertices[offset + 5] = color.r;
            vertices[offset + 6] = color.g;
            vertices[offset + 7] = color.b;
            vertices[offset + 8] = color.a;
        }

        let x2 = x + w;
        let y2 = y + h;

        Vertex(0, x, y,  0,     0, 1, color);
        Vertex(1, x, y2,  0,    0, 0, color);
        Vertex(2, x2, y2,  0,   1, 0, color);
        Vertex(3, x2, y, 0,     1, 1, color);


        gl.bindBuffer(gl.ARRAY_BUFFER, Renderer.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
           
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, vertexStrideSize *4, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, vertexStrideSize *4, 3 * 4);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, vertexStrideSize *4, 5 * 4);
 

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Renderer.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
       


        
        Core.DrawElements(gl.TRIANGLES, 6,  0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
       
    }
}

//********************************************************************************************************************************************/

class IndexBuffer 
{
    constructor(data,dynamic=false)
    {
        this.buffer = gl.createBuffer();
        this.count = data.length;
        this.dynamic = dynamic;
        if (data !== null)
        {
            this.LoadData(data);
        }
       

    }
    Release()
    {
        gl.deleteBuffer(this.buffer);
    }
    Use()
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        this.isUsed = true;
    }

    LoadData(data)
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

    UpdateData(data,offset=0)
    {
   
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, new Uint16Array(data));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
}

//********************************************************************************************************************************************/



class VertexBuffer
{
    constructor(data, itemSize, attributes, dynamic=false)
    {
        this.buffer = gl.createBuffer();
        this.itemSize = itemSize;
        this.numItems = data.length / itemSize;
        this.isUsed = true;
        this.dynamic = dynamic;
        
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        if (data !== null)
        {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
        }

        this.attributes = attributes;
        this.Config();

    
      
    }
    Release()
    {
        gl.deleteBuffer(this.buffer);
    }
    Config()
    {
        let offset = 0;

        for (let index in this.attributes)
        {
                let attribute = this.attributes[index];
               
                gl.enableVertexAttribArray(index);
                if (attribute === POSIION2D)
                {
                gl.vertexAttribPointer(index, 2, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 2;
                }  else 
                if (attribute === POSIION3D)
                {
                gl.vertexAttribPointer(index, 3, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 3;
                } else
                if (attribute === COLOR3)
                {
                gl.vertexAttribPointer(index, 3, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 3;
                } else
                if (attribute === COLOR4)
                {
                gl.vertexAttribPointer(index, 4, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 4;
                } else
                if (attribute === TEXTURE)
                {
                gl.vertexAttribPointer(index, 2, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 2;
                } else
                if (attribute === TEXTURE1)
                {
                gl.vertexAttribPointer(index, 2, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 2;
                } else
                if (attribute === TEXTURE2)
                {
                gl.vertexAttribPointer(index, 2, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 2;
                } else
                if (attribute === TEXTURE3)
                {
                gl.vertexAttribPointer(index, 2, gl.FLOAT, false, this.itemSize, offset * 4);
                offset += 2;
                }

           
            
        }
      
    }
    LoadData(data)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    UpdateData(data,offset=0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(data));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    }
    Use()
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }
    Remove()
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    }
}
//********************************************************************************************************************************************/

class VertexArray
{
    constructor()
    {
        this.vertexArray = gl.createVertexArray();
    }
    Release()
    {
        gl.deleteVertexArray(this.vertexArray);
    }
    Begin()
    {
        gl.bindVertexArray(this.vertexArray);
    }
    End()
    {
        gl.bindVertexArray(null);
    }
}
//********************************************************************************************************************************************/

class LigthBase
{
    constructor()
    {
     
        this.ambient = new Color(1.0,1.0,1.0,1.0);
        this.ambientIntensity = 0.5;
        this.enable = true;
    }

}



class Light  extends LigthBase
{
    constructor()
    {
        super();
        this.position = new Vector3(1.2, 1.0, 2.0);
        this.color    = new Color(1.0,0.2,0.2,1.0);
    }
}

class DirectionalLight extends LigthBase
{
    constructor()
    {
        super();
      //  this.direction = new Vector3(1.0, 0.9, 0.0);
        this.direction = new Vector3(0.16,0.33,0.93);
        this.color = new Color(1.0,1.0,1.0);
        this.ambientIntensity = 0.0;
        this.diffuseIntensity = 2.5;
        this.specularIntensity=1.0;
        this.shininess=64;
        this.lightProjection = new Matrix4();
        this.size =10;
        this.lightProjection.ortho(-this.size,this.size,-this.size,this.size,-this.size*2,this.size*2);
        this.lightView = new Matrix4();
        this.center = new Vector3(0,0,0);
        this.up = new Vector3(0,1,0);
       
    }

    GetMatrix()
    {
       this.lightView.lookAt(this.direction, this.center, this.up);
       let LightMatrix = Matrix4.Multiply(this.lightView,this.lightProjection);
       return LightMatrix;
    }

}



//********************************************************************************************************************************************/




class Core 
{

    static currentProgram = null;
 

 
    static Init(width, height)
    {
        
        this.width = width;
        this.height = height;

        this.currentTexture = [];
        this.currentTexture[0] = null;
        this.currentTexture[1] = null;
        this.currentTexture[2] = null;
        this.currentTexture[3] = null;
        this.currentTexture[4] = null;
        this.currentTexture[5] = null;
        this.currentTexture[6] = null;
        this.currentTexture[7] = null;
     
        this.isBlendEnabled = false;
        this.isDepthTestEnabled = false;
        this.isCullFaceEnabled = false;
        this.isScissorEnabled = true;
        this.isdepthClampEnabled = true;
        this.depthFunc = -1;
        this.blendMode = -1;
        this.cullMode = -1;
        this.currentShader = null;
        this.useMaterial=true;
    
     
        this.state = {
            blend: false,
            depthTest: false,
            cullFace: false,
            useScissor: false,
            depthFunc: DepthMode.LEQUAL,
            blendMode: BlendMode.Normal,
            cullMode: CullMode.Back,
            depthClamp: false,
            currentProgram: null,
            currentTexture: null,
        
            currentShader: null,
            useMaterial: true,
            viewPort: new Rectangle(0,0,width,height),
            scissors: new Rectangle(0,0,width,height)
        };


       this.viewPort = new Rectangle(0,0,width,height);
       this.scissor = new Rectangle(0,0,width,height);
      
    
        this.directionalLight = new DirectionalLight();

        this.shadowTexture = null;
        
   
        this.numVertex = 0;
        this.numDrawCalls = 0;
        this.numTriangles = 0;
        this.numTextures=0;
        this.numPrograms=0;




        this.shaders = {};

        this.defaultTexture = new Texture2D();

        
        this.defaultTexture.Create(1,1,4 , new Uint8Array([255,255,255,255]));
        this.defaultFont = new Font(1024);
        this.defaultFont.Create(defaultFontImage, defaultFontData);

        this.matrix = [];
        this.matrix[PROJECTION_MATRIX] = new Matrix4();
        this.matrix[MODEL_MATRIX] = new Matrix4();  
        this.matrix[VIEW_MATRIX] = new Matrix4();
        this.cameraPosition = new Vector3(0,0,0);


        

        this.stack = new MatrixStack();


        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
    //    gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
    


        this.SetBlendMode(-2);
        this.SetClearColor(0.0, 0.0, 0.0, 1.0);
        this.SetViewport(0, 0, this.width, this.height);
        this.SetDepthTest(false);
        this.SetCullFace(true);
        this.SetBlend(true);
        this.SetDepthFunc(DepthMode.LEQUAL);
    

        this.LoadShaders();

      
    }
    static SaveState()
    {
        this.state.blend = this.isBlendEnabled;
        this.state.depthTest = this.isDepthTestEnabled;
        this.state.cullFace = this.isCullFaceEnabled;
        this.state.depthFunc = this.depthFunc;
        this.state.useScissor = this.isScissorEnabled;
        this.state.blendMode = this.blendMode;
        this.state.depthClamp = this.isdepthClampEnabled;
        this.state.currentProgram = this.currentProgram;
        this.state.currentTexture = this.currentTexture;
  
        this.state.currentShader = this.currentShader;
        this.state.useMaterial = this.useMaterial;
        this.state.viewPort.set(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
        this.state.scissors.set(this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);



    }

    static RestoreState()
    {
        this.SetBlend(this.state.blend);
        this.SetDepthTest(this.state.depthTest);
        this.SetCullFace(this.state.cullFace);
        this.SetDepthFunc(this.state.depthFunc);
        this.SetBlendMode(this.state.blendMode);
        this.SetDepthClamp(this.state.depthClamp);
        this.SetProgram(this.state.currentProgram);
        this.currentTexture = this.state.currentTexture;

        this.SetShader(this.state.currentShader);
        this.SetScissorMode(this.state.useScissor);
        this.useMaterial = this.state.useMaterial;
        this.SetViewport(this.state.viewPort.x, this.state.viewPort.y, this.state.viewPort.width, this.state.viewPort.height);
        this.SetScissor(this.state.scissors.x, this.state.scissors.y, this.state.scissors.width, this.state.scissors.height);
    }

 
    static EnableMaterial()
    {
        this.useMaterial = true;
    }

    static DisableMaterial()
    {
        this.useMaterial = false;
    }

    static SetScissorMode(value)
    {
        if (value !== this.isScissorEnabled)
        {
            if (value)
            {
                gl.enable(gl.SCISSOR_TEST);
            } else
            {
                gl.disable(gl.SCISSOR_TEST);
            }
            this.isScissorEnabled = value;
        }
    }

    static Set2DMaterial()
    {
        
        Core.SetBlend(true);
        Core.SetBlendMode(BlendMode.Normal);
        Core.SetDepthTest(false);
        Core.SetCullFace(true);
    }

    static SetShadowTexture(texture)
    {
        this.shadowTexture = texture;
    }

    static GetCameraPosition()
    {
        return this.cameraPosition;
    }
    static SetCameraPosition(x, y, z)
    {
        this.cameraPosition.set(x, y, z);
    }
    static GetAmbientLight()
    {
        return this.ambientLight;
    }
    static GetDirectionalLight(index=0)
    {
        return this.directionalLight;
    }
    static GetDefaultFont()
    {
        return Core.defaultFont;
    }
    static GetViewPort()
    {
        return this.viewPort;
    }
    static ResetStats()
    {
        this.numVertex = 0;
        this.numDrawCalls = 0;
        this.numTriangles = 0;
        this.numTextures=0;
        this.numPrograms=0;
        
    }
    static TraceGl()
     {
        var error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error("Erro WebGL: " + error);
        }
     }

     static  PushMatrix()
     {
         this.UseTransform = true;
         this.stack.Push();
         this.matrix[MODEL_MATRIX].copy(this.stack.Top());
     }
     static   PopMatrix()
     {
         this.UseTransform = false;   
         this.stack.Pop();
     }
     static  Identity()
     {
         this.stack.Identity();
         this.matrix[MODEL_MATRIX].copy(this.stack.Top());
     }
     static  Scale(x, y, z)
     {
        this.stack.Scale(x, y, z);
        this.matrix[MODEL_MATRIX].copy(this.stack.Top());
     }
     static Translate(x, y, z)
     {
         this.stack.Translate(x, y, z);
         this.matrix[MODEL_MATRIX].copy(this.stack.Top());
     }
     static Rotate(angle, x, y, z)
     {
         this.stack.Rotate(angle, x, y, z);
         this.matrix[MODEL_MATRIX].copy(this.stack.Top());
     }
  

  
   
     static DrawElements(mode, vertexCount,  offset)
     {
         gl.drawElements(mode, vertexCount, gl.UNSIGNED_SHORT, offset);
         this.numDrawCalls++;
         this.numTriangles += vertexCount / 3;
         this.numVertex += vertexCount;
     }
 
     static DrawArrays(mode, first, count)
     {
         gl.drawArrays(mode, first, count);
         this.numDrawCalls++;
         this.numTriangles += count / 3;
         this.numVertex += count;
     }
 
    static GetWidth()
    {
        return this.width;
    }

    static GetHeight()
    {
        return this.height;
    }

    static SetMatrix(type,matrix)
    {
        this.matrix[type].copy(matrix);
        if (this.currentShader !== null)
        {
            this.currentShader.Use();
            if (type === PROJECTION_MATRIX)
                this.currentShader.SetUniformMatrix4fv("uProjection", this.matrix[PROJECTION_MATRIX].m);
    
            if (type === MODEL_MATRIX)
                this.currentShader.SetUniformMatrix4fv("uModel", this.matrix[MODEL_MATRIX].m);

            if (type === VIEW_MATRIX)
            {
             //   this.cameraPosition.set(matrix.m[12], matrix.m[13], matrix.m[14]); 
                this.currentShader.SetUniformMatrix4fv("uView", this.matrix[VIEW_MATRIX].m);
            }
        }
    }
    static GetMatrix(type)
    {
        return this.matrix[type];
    }
    static SetDefaultTexture(layer=0)
    {
       
        this.SetTexture(this.defaultTexture,layer);
    }

    static Resize(width, height)
    {
        this.width = width;
        this.height = height;
        
    }




    static GetShader(name)
    {
        return this.shaders[name];
    }

    static UseShader()
    {
        if (this.currentShader !== null)
        {
            this.currentShader.Use();
            if (this.currentShader.ContainsUniform("uModel"))
            {
                this.currentShader.SetUniformMatrix4fv("uModel", this.matrix[MODEL_MATRIX].m);
            }
        }
    }

    static UseMaterial(material)
    {
        if (this.currentShader !==null)
        {
            if (this.useMaterial)
            {
             material.Set(this.currentShader);
            }
        }
    }



    static SetShader(shader)
    {
        this.currentShader = shader;
        this.currentShader.Use();
        if (this.currentShader.ContainsUniform("uProjection"))
        {
            this.currentShader.SetUniformMatrix4fv("uProjection", this.matrix[PROJECTION_MATRIX].m);
        }
   
        if (this.currentShader.ContainsUniform("uView"))
        {
            this.currentShader.SetUniformMatrix4fv("uView", this.matrix[VIEW_MATRIX].m);
        }

       
        if (this.currentShader.ContainsUniform("uLightSpaceMatrix"))
        {
            const lightMatrix = this.directionalLight.GetMatrix();
            this.currentShader.SetUniformMatrix4fv("uLightSpaceMatrix", lightMatrix.m);
        }

       
        if (this.currentShader.ContainsUniform("uShadowMap"))
        {
           
            if (this.shadowTexture !== null)
            {
                this.currentShader.SetUniform2f("uTextureSize",this.shadowTexture.width,this.shadowTexture.height);
                this.SetTexture(this.shadowTexture,1);
            }
          
            this.currentShader.SetInteger("uShadowMap", 1);
        }
       

    }

    static GetFrustum()
    {
        return this.frustum;
    }

    static Release ()
    {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vertexArray);
    }


    static SetDepthClamp(value)
    {
        if (this.isdepthClampEnabled !== value)
        {
            if (value)
            {
                gl.enable(gl.DEPTH_CLAMP);
            }
            else
            {
                gl.disable(gl.DEPTH_CLAMP);
            }
            this.isdepthClampEnabled = value;
        }
    }

    static SetDepthFunc(f)
     {
        if (this.depthFunc !== f)
        {

            switch (f)
            {
                case DepthMode.Never:
                    gl.depthFunc(gl.NEVER);
                    break;
                case DepthMode.Less:
                    gl.depthFunc(gl.LESS);
                    break;
                case DepthMode.Equal:
                    gl.depthFunc(gl.EQUAL);
                    break;
                case DepthMode.Lequal:
                    gl.depthFunc(gl.LEQUAL);
                    break;
                case DepthMode.Greater:
                    gl.depthFunc(gl.GREATER);
                    break;
                case DepthMode.Notequal:
                    gl.depthFunc(gl.NOTEQUAL);
                    break;
                case DepthMode.Gequal:
                    gl.depthFunc(gl.GEQUAL);
                    break;
                case DepthMode.Always:
                    gl.depthFunc(gl.ALWAYS);
                    break;
            }
            this.depthFunc = f;
        }
    }

    
    static SetCullFace(isEnabled)   
    {
        if (this.isCullFaceEnabled !== isEnabled)
        {
            if (isEnabled)
            {
                gl.enable(gl.CULL_FACE);
            }
            else
            {
                gl.disable(gl.CULL_FACE);
            }
            this.isCullFaceEnabled = isEnabled;
        }
    }

    static SetCullFaceMode(mode)
    {
        if (this.cullMode !== mode)
        {
            switch (mode)
            {
                case CullMode.Back:
                    gl.cullFace(gl.BACK);
                    break;
                case CullMode.Front:
                    gl.cullFace(gl.FRONT);
                    break;
                case CullMode.FrontAndBack:
                    gl.cullFace(gl.FRONT_AND_BACK);
                    break;
            }
            this.cullMode = mode;
        }

    }

    static SetDepthTest(isEnabled)
    {
        if (this.isDepthTestEnabled !== isEnabled)
        {
            if (isEnabled)
            {
               gl.enable(gl.DEPTH_TEST);
            }
            else
            {
                gl.disable(gl.DEPTH_TEST);
            }
            this.isDepthTestEnabled = isEnabled;
        }
    }



    static SetBlendMode(blendMode)
    {
        if (!this.isBlendEnabled)
        {

            if (this.blendMode !== blendMode)
            {
                switch (blendMode)
                {
                    case BlendMode.Normal:
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case BlendMode.Additive:
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                        break;
                    case BlendMode.Multiply:
                        gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case BlendMode.One:
                        gl.blendFunc(gl.ONE, gl.ONE);
                        break;
                }
                this.blendMode = blendMode;
            }
        }
    }
    

    static SetBlend(value)
    {
    
      if (this.isBlendEnabled !== value)
        {
            if (value)
            {
                gl.enable(gl.BLEND);
            }
            else
            {
                gl.disable(gl.BLEND);
            }
            this.isBlendEnabled = value;
        }
    }

    static SetScissor(x,y,width,height)
    {
        if (this.state.useScissor)
        {
         this.scissor.set(x,y,width,height);
            gl.scissor(x,y,width,height);
        }
    }

    static SetViewport(x, y, width, height)
    {
        this.viewPort.set(x, y, width, height);
        gl.viewport(x, y, width, height);
    }


    static SetClearColor(r,g,b,a)
    {
        gl.clearColor(r,g,b,a);
    }
    static Reset()
    {
        this.numVertex = 0;
        this.numDrawCalls = 0;
        this.numTriangles = 0;
        this.numTextures=0;
        this.numPrograms=0;
        this.currentTexture[0] = null;
        this.currentTexture[1] = null;
        this.currentTexture[2] = null;
        this.currentTexture[3] = null;
        this.currentTexture[4] = null;
        this.currentTexture[5] = null;
        this.currentTexture[6] = null;
        this.currentTexture[7] = null;
        this.currentProgram = null;
    }
    static Clear()
    {
    
        

        
      //  this.currentProgram = null;
 
        let flags = gl.COLOR_BUFFER_BIT;
        if (this.isDepthTestEnabled)
        {
            flags |= gl.DEPTH_BUFFER_BIT;
        }

        gl.clear(flags);
    }

    static SetProgram(program)
    {
        if(this.currentProgram != program)
        {
            if (program == null)
            {
                gl.useProgram(null);
                this.currentProgram = null;
                return;
            }
            gl.useProgram(program);
             this.numPrograms++;
             this.currentProgram = program;
        }
    }

 
 
 

    static SetTexture(texture, layer=0)
    {      
        if(this.currentTexture[layer] != texture)
        {
            gl.activeTexture(gl.TEXTURE0 + layer);
            gl.bindTexture(gl.TEXTURE_2D, texture.id);
            this.numTextures++;
            this.currentTexture[layer] = texture;
        }
    }  
 


 

    static async LoadShaders()
    {
        return new Promise((resolve) => 
        {
        this.shaders["solid"] = CreateColorShader();
        this.shaders["texture"] = CreateTextureShader();
        this.shaders["skybox"] = CreatSkyboxShader();
        this.shaders["instance"] = CreateInstanceShader();
        this.shaders["light"] = CreateLighing();
        this.shaders["shadow"] = CreateShadowShader();
        this.shaders["screen"] = CreateScreenShader();
        this.shaders["screenDepth"] = CreatScreenDepthShader();
        resolve();
        });
    }
}
//********************************************************************************************************************************************/



class Camera 
{
    static YAW = -90.0;
    static PITCH = -40.0;
    static SPEED = 2.5;
    static SENSITIVITY = 0.1;

    constructor(x,y,z)
    {
        this.position = new Vector3(x,y,z);
        this.target = new Vector3(x,y,z);
        this.up = new Vector3(0, 1, 0);
        this.view = new Matrix4();
        this.yaw = Camera.YAW;
        this.pitch = Camera.PITCH;
        this.speed = Camera.SPEED;
        this.sensitivity = Camera.SENSITIVITY;

        this.direction = new Vector3();
  
        this.frustum = new Frustum();

        this.front = new Vector3();
        this.right = new Vector3();
        this.worldUp = new Vector3(0, 1, 0);

        this.proj =Matrix4.Perspective(45, Core.width/Core.height, 0.1, 1000);

        this.Front = new Vector3();
    }

    MoveForward(speed)
    {
        this.position.x += this.front.x * speed;
        this.position.y += this.front.y * speed;
        this.position.z += this.front.z * speed;
    }

    MoveBackward(speed)
    {
        this.position.x -= this.front.x * speed;
        this.position.y -= this.front.y * speed;
        this.position.z -= this.front.z * speed;
    }

    StrafeRight(speed)
    {
        this.position.x += this.right.x * speed;
        this.position.y += this.right.y * speed;
        this.position.z += this.right.z * speed;
    }


    StrafeLeft(speed)
    {
        this.position.x -= this.right.x * speed;
        this.position.y -= this.right.y * speed;
        this.position.z -= this.right.z * speed;
    }

    MoveUp(speed)
    {
        this.position.x += this.up.x * speed;
        this.position.y += this.up.y * speed;
        this.position.z += this.up.z * speed;
    }




    MoveDown(speed)
    {
        this.position.x -= this.up.x * speed;
        this.position.y -= this.up.y * speed;
        this.position.z -= this.up.z * speed;
    }

    Rotate(xoffset, yoffset)
    {
        xoffset *= this.sensitivity;
        yoffset *= this.sensitivity;

        this.yaw += xoffset;
        this.pitch += yoffset;

        if (this.pitch > 89.0)
        {
            this.pitch = 89.0;
        }
        if (this.pitch < -89.0)
        {
            this.pitch = -89.0;
        }
    }

    RotateX(xoffset)
    {
        xoffset *= this.sensitivity;
        this.yaw += xoffset;
    }
    
    RotateY(yoffset)
    {
        yoffset *= this.sensitivity;
        this.pitch += yoffset;

        if (this.pitch > 89.0)
        {
            this.pitch = 89.0;
        }
        if (this.pitch < -89.0)
        {
            this.pitch = -89.0;
        }
    }

   Update()
   {
        this.Front.x = Math.cos(this.yaw * Math.PI / 180) * Math.cos(this.pitch * Math.PI / 180);
        this.Front.y = Math.sin(this.pitch * Math.PI / 180);
        this.Front.z = Math.sin(this.yaw * Math.PI / 180) * Math.cos(this.pitch * Math.PI / 180);

        this.front = this.Front.normalize();

        this.right = Vector3.Cross(this.front, this.worldUp).normalize();
        this.up    = Vector3.Cross(this.right, this.front).normalize();


        this.direction.x = this.position.x + this.front.x;
        this.direction.y = this.position.y + this.front.y;
        this.direction.z = this.position.z + this.front.z;


         this.view.lookAt(this.position, this.direction, this.up);

         Core.SetMatrix(VIEW_MATRIX, this.view);
         Core.SetCameraPosition(this.position.x,this.position.y,this.position.x);
         Core.SetMatrix(PROJECTION_MATRIX, this.proj);

         this.frustum.update(this.view,this.proj); 
   }

    GetViewMatrix()
    {
         return this.view;
    }

    GetProjectionMatrix()
    {
        return this.proj;
    }

    GetFrustum()
    {
        return this.frustum;
    }


}
