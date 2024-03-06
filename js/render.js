
/*jslint node: true, vars: true, white: true */
"use strict";


const BlendMode =
{
    Normal: 0,
    Additive: 1,
    Multiply: 2,
    One : 3,
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
    Depth(width, height)
    {
        this.width = width;
        this.height = height;
        this.channels = 1;

        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    }
    Blank(width, height, channels=4)
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
        this.saveViewport = new Rectangle(0,0,1,1);
        this.width = 0;
        this.height = 0;
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        
    }
    Begin()
    {
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0, 0, 0, 1);   
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    }
    End()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.id);
       
    }
    Release()
    {
        gl.deleteFramebuffer(this.frameBuffer);
        gl.deleteTexture(this.id);
    }


}
//********************************************************************************************************************************************/

class FrameBuffer
{
    constructor()
    {
        this.id = null;
        this.textureColor = new Texture2D();
        this.textureDepth = new Texture2D();

        this.width = 0;
        this.height = 0;
    }
    Create(width, height)
    {
        this.width = width;
        this.height = height;


        this.id = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
        

        this.textureColor.Blank(width, height, 4);


        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureColor.id, 0);




        this.textureDepth.Depth(width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.textureDepth.id);
        



        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }
    Use()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    }
    Unbind()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    Release()
    {
        gl.deleteFramebuffer(this.id);
        this.textureColor.Release();
        this.textureDepth.Release();

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

class Light 
{
    constructor()
    {
        this.position = new Vector3(1.2, 1.0, 2.0);
        this.color    = new Color(1.0,0.2,0.2,1.0);
        this.ambient  = new Color(1.0,1.0,1.0,1.0);
        
        this.intensity=0.01;

    }
}


//********************************************************************************************************************************************/




class Core 
{

    static currentProgram = null;
    static currentTexture = null;
    static currentTextureLayer = -1;
    static isBlendEnabled = false;
    static isDepthTestEnabled = false;
    static isCullFaceEnabled = false;
    static depthFunc = -1;
    static blendMode = -1;
    static currentShader = null;

    static Init(width, height)
    {
        
        this.width = width;
        this.height = height;
     



        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer  = gl.createBuffer();
        this.uvBuffer     = gl.createBuffer();
        this.indexBuffer  = gl.createBuffer();

        this.vertexArray  = gl.createVertexArray();

        gl.bindVertexArray(this.vertexArray);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);      
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);



        gl.bindVertexArray(null);

        this.light = new Light();

        
   
        this.numVertex = 0;
        this.numDrawCalls = 0;
        this.numTriangles = 0;
        this.numTextures=0;
        this.numPrograms=0;


        
        this.depth = 0.0;


        this.colorr=1.0;
        this.colorg=1.0;
        this.colorb=1.0;
        this.colora=1.0;

        this.shaders = {};

        this.defaultTexture = new Texture2D();

        
        this.defaultTexture.Create(1,1,4 , new Uint8Array([255,255,255,255]));

        this.matrix = [];
        this.matrix[PROJECTION_MATRIX] = new Matrix4();
        this.matrix[MODEL_MATRIX] = new Matrix4();  
        this.matrix[VIEW_MATRIX] = new Matrix4();

        

        this.stack = new MatrixStack();


        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);

        this.SetBlendMode(BlendMode.Normal);
        this.SetClearColor(0.0, 0.0, 0.0, 1.0);
        this.SetViewport(0, 0, this.width, this.height);
        this.SetDepthTest(true);
        this.SetCullFace(true);
        this.SetBlend(true);

        this.LoadShaders();

      
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
  

     static ApplyTransform()
    {
        if (this.UseTransform)
        {
       //  this.matrix[MODEL_MATRIX].copy(this.stack.Top());
        }
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
                this.currentShader.SetUniformMatrix4fv("uView", this.matrix[VIEW_MATRIX].m);
        }
    }

    static SetDefaultTexture(layer=0)
    {
        this.ActiveTexture(layer);
        this.SetTexture(this.defaultTexture.id);
    }

    static Resize(width, height)
    {
        this.width = width;
        this.height = height;
        
    }

    static SetViewport(x, y, width, height)
    {
        gl.viewport(x, y, width, height);
    }

    static async LoadShaders()
    {
        return new Promise((resolve) => 
        {
        this.shaders["solid"] = this.CreateColorShader();
        this.shaders["texture"] = this.CreateTextureShader();
        this.shaders["skybox"] = this.CreatSkyboxShader();
        this.shaders["ambient"] = this.CreateAmbientShader();
        this.shaders["instance"] = this.CreateInstanceShader();
        resolve();
        });
    }

    static GetShader(name)
    {
        return this.shaders[name];
    }

    static SetShader(shader)
    {
        shader.Use();
      
        this.currentShader = shader;
        if (shader.ContainsUniform("uProjection"))
        {
            shader.SetUniformMatrix4fv("uProjection", this.matrix[PROJECTION_MATRIX].m);
        }
        if (shader.ContainsUniform("uModel"))
        {
            shader.SetUniformMatrix4fv("uModel", this.matrix[MODEL_MATRIX].m);
        }
        if (shader.ContainsUniform("uView"))
        {
            shader.SetUniformMatrix4fv("uView", this.matrix[VIEW_MATRIX].m);
        }
        if (shader.ContainsUniform("uTexture0"))
        {
            shader.SetInteger("uTexture0", 0);
        }

    }

    static Release ()
    {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vertexArray);
    }
    static SetColor (color)
    {
        this.colorr = color.r;
        this.colorg = color.g;
        this.colorb = color.b;
        this.colora = color.a;
    }
    static SetColor4f (r,g,b,a)
    {
        this.colorr = r;
        this.colorg = g;
        this.colorb = b;
        this.colora = a;
    }
    static SetDepth (depth)
    {
        this.depth = -depth;
    }


    static SetDepthFunc(func)
    {
        if (this.depthFunc !== func)
        {
            gl.depthFunc(func);
            this.depthFunc = func;
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
        if (value)
        {
            if (!this.isBlendEnabled)
            {
                gl.enable(gl.BLEND);
                this.isBlendEnabled = true;
            }
           
        }
        else
        {
            if (this.isBlendEnabled)
            {
                gl.disable(gl.BLEND);
                this.isBlendEnabled = false;
            }
            
        }
    }

    static SetScissor(x,y,width,height)
    {
        gl.scissor(x,y,width,height);
    }

    static SetViewport(x,y,width,height)
    {
        gl.viewport(x,y,width,height);
    }
 

    static SetClearColor(r,g,b,a)
    {
        gl.clearColor(r,g,b,a);
    }

    static Clear()
    {
        this.numVertex = 0;
        this.numDrawCalls = 0;
        this.numTriangles = 0;
        this.numTextures=0;
        this.numPrograms=0;
        this.currentTexture = null;
        this.currentProgram = null;

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

    static ActiveTexture(layer=0)
    {
        if (this.currentTextureLayer !== layer)
        {
            gl.activeTexture(gl.TEXTURE0 + layer);
            this.currentTextureLayer = layer;
        }
    }


    static SetTexture(texture)
    {      
        if(this.currentTexture != texture)
        {
            if(texture == null)
            {
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.currentTexture = null;
                return;
            }
            gl.bindTexture(gl.TEXTURE_2D, texture.id);
            this.numTextures++;
            this.currentTexture = texture;
        }
    }  

    static DrawRectangle(x,y,width,height)
    {
        let x0 = x;
        let y0 = y;
        let x1 = x + width;
        let y1 = y + height;

        let indices = new Uint16Array([0, 2, 1, 2, 0, 3]);
        let vertices = new Float32Array([x0, y0, this.depth, x1, y0, this.depth, x1, y1, this.depth, x0, y1, this.depth]);
        let uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        let colors = new Float32Array( [this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora]);

     
        this.defaultTexture.Use();
 
     


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        gl.bindVertexArray(this.vertexArray);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

    }

    static DrawTexture(x, y, width, height)
    {
        let x0 = x;
        let y0 = y;
        let x1 = x + width;
        let y1 = y + height;

        let indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        let vertices = new Float32Array([x0, y0, this.depth, x1, y0, this.depth, x1, y1, this.depth, x0, y1, this.depth]);
        let uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        let colors = new Float32Array( [this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora]);

     
 
     


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        gl.bindVertexArray(this.vertexArray);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

    }

    static DrawTextureScaleSrc(x, y,  scale, texture_width, texture_height,  srcx, srcy, srcwidth,srcheight)
    {

        let w = srcwidth/2  ;
        let h = srcheight/2  ;

        let x0 = x-(w*scale);
        let y0 = y-(h*scale);
        let x1 = x + w*scale;
        let y1 = y + h*scale;

        let indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        let vertices = new Float32Array([x0, y0, this.depth, x1, y0, this.depth, x1, y1, this.depth, x0, y1, this.depth]);
        
        let u0 = srcx / texture_width;
        let v0 = srcy / texture_height;

        let u1 = (srcx + srcwidth) / texture_width;
        let v1 = (srcy + srcheight) / texture_height;

        let uv = new Float32Array([u0, v0, u1, v0, u1, v1, u0, v1]);

        let colors = new Float32Array( [
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora]);

     
 
     


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        gl.bindVertexArray(this.vertexArray);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        

        
    }

    static DrawTextureSrc(x, y,  texture_width, texture_height,  srcx,srcy,srcwidth,srcheight)
    {
        let x0 = x;
        let y0 = y;
        let x1 = x + srcwidth;
        let y1 = y + srcheight;

        let indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        let vertices = new Float32Array([x0, y0, this.depth, x1, y0, this.depth, x1, y1, this.depth, x0, y1, this.depth]);
        
        let u0 = srcx / texture_width;
        let v0 = srcy / texture_height;

        let u1 = (srcx + srcwidth) / texture_width;
        let v1 = (srcy + srcheight) / texture_height;

        let uv = new Float32Array([u0, v0, u1, v0, u1, v1, u0, v1]);


        let colors = new Float32Array( [
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora,
            this.colorr, this.colorg, this.colorb, this.colora]);

     
 
     


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        gl.bindVertexArray(this.vertexArray);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

    }

    static DrawTextureMapping(x, y, width, height,u=1,v=1)
    {
        let x0 = x;
        let y0 = y;
        let x1 = x + width;
        let y1 = y + height;

        let indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        let vertices = new Float32Array([x0, y0, this.depth, x1, y0, this.depth, x1, y1, this.depth, x0, y1, this.depth]);
        let uv = new Float32Array([ 
            0, 0, 
            u, 0, 
            u, v, 
            0, v]);
        let colors = new Float32Array( [this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora,this.colorr, this.colorg, this.colorb, this.colora]);

     
 
     


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        gl.bindVertexArray(this.vertexArray);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

    }
  
    static DrawSolidCube(x,y,z,size)
    {
        
        
        let r=  this.colorr;
        let g = this.colorg;
        let b = this.colorb;
        let a = this.colora;

            let colors = new Float32Array([
        // Frente
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Trás
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Topo
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Base
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Direita
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Esquerda
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a
    ]);

        let halfSize = size / 2;
  
         // Definindo os vértices do cubo
    let vertices = new Float32Array([
        // Frente
        x - halfSize, y - halfSize, z + halfSize,
        x + halfSize, y - halfSize, z + halfSize,
        x + halfSize, y + halfSize, z + halfSize,
        x - halfSize, y + halfSize, z + halfSize,
        // Trás
        x - halfSize, y - halfSize, z - halfSize,
        x + halfSize, y - halfSize, z - halfSize,
        x + halfSize, y + halfSize, z - halfSize,
        x - halfSize, y + halfSize, z - halfSize,
        // Topo
        x - halfSize, y + halfSize, z + halfSize,
        x + halfSize, y + halfSize, z + halfSize,
        x + halfSize, y + halfSize, z - halfSize,
        x - halfSize, y + halfSize, z - halfSize,
        // Base
        x - halfSize, y - halfSize, z + halfSize,
        x + halfSize, y - halfSize, z + halfSize,
        x + halfSize, y - halfSize, z - halfSize,
        x - halfSize, y - halfSize, z - halfSize,
        // Direita
        x + halfSize, y - halfSize, z + halfSize,
        x + halfSize, y - halfSize, z - halfSize,
        x + halfSize, y + halfSize, z - halfSize,
        x + halfSize, y + halfSize, z + halfSize,
        // Esquerda
        x - halfSize, y - halfSize, z + halfSize,
        x - halfSize, y - halfSize, z - halfSize,
        x - halfSize, y + halfSize, z - halfSize,
        x - halfSize, y + halfSize, z + halfSize
    ]);



    let indices = new Uint16Array([
        // Frente
        0, 1, 2, 0, 2, 3,
        // Trás
        4, 6, 5, 4, 7, 6,
        // Topo
        8, 9, 10, 8, 10, 11,
        // Base
        12, 14, 13, 12, 15, 14,
        // Direita
        16, 17, 18, 16, 18, 19,
        // Esquerda
        20, 22, 21, 20, 23, 22    ]);



          
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
 

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0); 
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        
        
        
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
             
 
     
     
        
   
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
          
        


       
       

    }

    static DrawSolidWall(x,y,z,w,h,d)
    {
        
        
        let r=  this.colorr;
        let g = this.colorg;
        let b = this.colorb;
        let a = this.colora;

            let colors = new Float32Array([
        // Frente
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Trás
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Topo
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Base
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Direita
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Esquerda
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a
    ]);

       
  
         // Definindo os vértices do cubo
    let vertices = new Float32Array([
        // Frente
        x - w, y - h, z + d,
        x + w, y - h, z + d,
        x + w, y + h, z + d,
        x - w, y + h, z + d,
        // Trás
        x - w, y - h, z - d,
        x + w, y - h, z - d,
        x + w, y + h, z - d,
        x - w, y + h, z - d,
        // Topo
        x - w, y + h, z + d,
        x + w, y + h, z + d,
        x + w, y + h, z - d,
        x - w, y + h, z - d,
        // Base
        x - w, y - h, z + d,
        x + w, y - h, z + d,
        x + w, y - h, z - d,
        x - w, y - h, z - d,
        // Direita
        x + w, y - h, z + d,
        x + w, y - h, z - d,
        x + w, y + h, z - d,
        x + w, y + h, z + d,
        // Esquerda
        x - w, y - h, z + d,
        x - w, y - h, z - d,
        x - w, y + h, z - d,
        x - w, y + h, z + d
    ]);



    let indices = new Uint16Array([
        // Frente
        0, 1, 2, 0, 2, 3,
        // Trás
        4, 6, 5, 4, 7, 6,
        // Topo
        8, 9, 10, 8, 10, 11,
        // Base
        12, 14, 13, 12, 15, 14,
        // Direita
        16, 17, 18, 16, 18, 19,
        // Esquerda
        20, 22, 21, 20, 23, 22    ]);



//  // Definindo as cores para cada vértice (opcional)
//  let colors = new Float32Array([
//     // Frente
//     1.0, 0.0, 0.0, 1.0, // Vermelho
//     1.0, 0.0, 0.0, 1.0,
//     1.0, 0.0, 0.0, 1.0,
//     1.0, 0.0, 0.0, 1.0,
//     // Trás
//     0.0, 0.0, 1.0, 1.0, // Azul
//     0.0, 0.0, 1.0, 1.0,
//     0.0, 0.0, 1.0, 1.0,
//     0.0, 0.0, 1.0, 1.0,
//     // Topo
//     0.0, 1.0, 0.0, 1.0, // Verde
//     0.0, 1.0, 0.0, 1.0,
//     0.0, 1.0, 0.0, 1.0,
//     0.0, 1.0, 0.0, 1.0,
//     // Base
//     1.0, 1.0, 0.0, 1.0, // Amarelo
//     1.0, 1.0, 0.0, 1.0,
//     1.0, 1.0, 0.0, 1.0,
//     1.0, 1.0, 0.0, 1.0,
//     // Direita
//     0.0, 1.0, 1.0, 1.0, // Ciano
//     0.0, 1.0, 1.0, 1.0,
//     0.0, 1.0, 1.0, 1.0,
//     0.0, 1.0, 1.0, 1.0,
//     // Esquerda
//     1.0, 0.0, 1.0, 1.0, // Magenta
//     1.0, 0.0, 1.0, 1.0,
//     1.0, 0.0, 1.0, 1.0,
//     1.0, 0.0, 1.0, 1.0
// ]);   
          
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
 

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0); 
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        
        
        
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
             
 
     
     
        
   
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
          
        


       
       

    }
    
    static DrawTextureCube(x,y,z,w,h,d)
    {
        
        
        let r=  this.colorr;
        let g = this.colorg;
        let b = this.colorb;
        let a = this.colora;

            let colors = new Float32Array([
        // Frente
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Trás
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Topo
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Base
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Direita
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a,
        // Esquerda
        r,g,b,a, 
        r,g,b,a,
        r,g,b,a,
        r,g,b,a
    ]);

       
  
         // Definindo os vértices do cubo
    let vertices = new Float32Array([
        // Frente
        x - w, y - h, z + d,
        x + w, y - h, z + d,
        x + w, y + h, z + d,
        x - w, y + h, z + d,
        // Trás
        x - w, y - h, z - d,
        x + w, y - h, z - d,
        x + w, y + h, z - d,
        x - w, y + h, z - d,
        // Topo
        x - w, y + h, z + d,
        x + w, y + h, z + d,
        x + w, y + h, z - d,
        x - w, y + h, z - d,
        // Base
        x - w, y - h, z + d,
        x + w, y - h, z + d,
        x + w, y - h, z - d,
        x - w, y - h, z - d,
        // Direita
        x + w, y - h, z + d,
        x + w, y - h, z - d,
        x + w, y + h, z - d,
        x + w, y + h, z + d,
        // Esquerda
        x - w, y - h, z + d,
        x - w, y - h, z - d,
        x - w, y + h, z - d,
        x - w, y + h, z + d
    ]);

    let uv = new Float32Array([
        // Frente
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        // Trás
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        // Topo
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        // Base
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        // Direita
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        // Esquerda
        0, 0,
        1, 0,
        1, 1,
        0, 1    
    ]);



    let indices = new Uint16Array([
        // Frente
        0, 1, 2, 0, 2, 3,
        // Trás
        4, 6, 5, 4, 7, 6,
        // Topo
        8, 9, 10, 8, 10, 11,
        // Base
        12, 14, 13, 12, 15, 14,
        // Direita
        16, 17, 18, 16, 18, 19,
        // Esquerda
        20, 22, 21, 20, 23, 22    ]);




          
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
            gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
 

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0); 
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        
        
        
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
             
 
     
     
        
   
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
          
        


       
       

    
    
    
    
        }


    static CreateTextureShader()
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

    static   CreateColorShader()
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

        static CreatSkyboxShader()
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

        static CreateAmbientShader()
        {

            let VertexShader = `#version 300 es
            precision mediump float;
            layout (location = 0) in vec3 aPosition;
            layout (location = 1) in vec2 aTexCoord;
            layout (location = 2) in vec3 aNormal;

            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform mat4 uModel;
            out vec2 TexCoord;
            out vec3 FragPos;
            out vec3 Normal;

            void main()
            {
                TexCoord = aTexCoord;
                FragPos = vec3(uModel * vec4(aPosition, 1.0));
                Normal = mat3(transpose(inverse(uModel))) * aNormal;  
               //Normal = aNormal;
                gl_Position = uProjection * uView * vec4(FragPos, 1.0);

              //  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);

            }

        `;

        let FragmentShader = `#version 300 es
        precision mediump float;
       
       
        in vec2 TexCoord;
        in vec3 FragPos;  
        in vec3 Normal;  
  

        out vec4 FragColor;

        struct Light
        {
            vec3 position;
            vec3 ambient;
            vec3 color;
            float intensity;
        };
     
       uniform Light light;
       

        uniform sampler2D uTexture0;
        void main()
        {
            vec4 texColor =  texture(uTexture0, TexCoord) ;

            // ambient
  
            vec3 ambient = light.intensity * light.ambient;
            
            // diffuse 
            vec3 norm = normalize(Normal);
            vec3 lightDir = normalize(light.position - FragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * light.ambient;
                    
            vec3 result = (ambient + diffuse) * light.color;
            FragColor = vec4(result, 1.0) + texColor;


         //   vec4 ambientColour = vec4( color, 1.0f) * intensity ;
           /// FragColor = texColor texture(uTexture0, TexCoord) * ambientColour;
        }
        `;

        let shader = new Shader();
        shader.Load(VertexShader, FragmentShader);
        shader.Use();
        shader.AddUniform("uProjection");
        shader.AddUniform("uView");
        shader.AddUniform("uModel");
        
        shader.AddUniform("light.color");
        shader.AddUniform("light.intensity");
        shader.AddUniform("light.ambient");
        shader.AddUniform("light.position");

        
        shader.AddUniform("uTexture0");

        shader.SetInteger("uTexture0", 0);

        shader.SetFloat("light.intensity", 1.0);
        shader.SetUniform3f("light.color", 1.0, 1.0, 1.0);
        shader.SetUniform3f("light.ambient", 1.0, 1.0, 1.0);
        shader.SetUniform3f("light.position", 0.0, 0.0, 0.0);
        
        

        shader.UnSet();
        return shader;

        



        }
        static CreateAmbientDiffuseSpecularShader()
        {
            let VertexShader = `#version 300 es
            precision mediump float;
            layout (location = 0) in vec3 aPosition;
            layout (location = 1) in vec2 aTexCoord;
            layout (location = 2) in vec3 aNormal;

            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform mat4 uModel;

            out vec2 TexCoord;
            out vec3 Normal;
            out vec3 FragPos;

            void main()
            {

                TexCoord = aTexCoord;
                FragPos = vec3(model * vec4(aPosition, 1.0));
                Normal = aNormal;  
                gl_Position = projection * view * vec4(FragPos, 1.0);

            }

        `;

        let FragmentShader = `#version 300 es
        precision mediump float;
        
        struct Material
        {
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;    
            float shininess;
        }; 
        
        struct Light 
        {
            vec3 position;
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
        };
        
        in vec3 FragPos;  
        in vec3 Normal;  
          
        uniform vec3 viewPos;
        uniform Material material;
        uniform Light light;
        
            void main()
            {
                // ambient
                vec3 ambient = light.ambient * material.ambient;
                
                // diffuse 
                vec3 norm = normalize(Normal);
                vec3 lightDir = normalize(light.position - FragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = light.diffuse * (diff * material.diffuse);
                
                // specular
                vec3 viewDir = normalize(viewPos - FragPos);
                vec3 reflectDir = reflect(-lightDir, norm);  
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
                vec3 specular = light.specular * (spec * material.specular);  
                    
                vec3 result = ambient + diffuse + specular;
                FragColor = vec4(result, 1.0);
            }

  `;

    let shader = new Shader();
    shader.Load(VertexShader, FragmentShader);
    shader.Use();
    shader.AddUniform("uProjection");
    shader.AddUniform("uView");
    shader.AddUniform("uModel");
    shader.AddUniform("viewPos");
    shader.AddUniform("material.ambient");
    shader.AddUniform("material.diffuse");
    shader.AddUniform("material.specular");
    shader.AddUniform("material.shininess");
    shader.AddUniform("light.position");
    shader.AddUniform("light.ambient");
    shader.AddUniform("light.diffuse");
    shader.AddUniform("light.specular");

    shader.SetUniform3f("material.ambient", 1.0, 0.5, 0.31);
    shader.SetUniform3f("material.diffuse", 1.0, 0.5, 0.31);
    shader.SetUniform3f("material.specular", 0.5, 0.5, 0.5);
    shader.SetUniform1f("material.shininess", 32.0);

    shader.SetUniform3f("light.ambient", 0.2, 0.2, 0.2);
    shader.SetUniform3f("light.diffuse", 0.5, 0.5, 0.5);
    shader.SetUniform3f("light.specular", 1.0, 1.0, 1.0);
    shader.SetUniform3f("light.position", 1.2, 1.0, 2.0);


    shader.UnSet();

    return shader;

    }

    static CreateInstanceShader()
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
  

        this.front = new Vector3();
        this.right = new Vector3();
        this.worldUp = new Vector3(0, 1, 0);

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
   }


}
