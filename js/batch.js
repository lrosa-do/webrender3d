

const  FIX_ARTIFACTS_BY_STRECHING_TEXEL = true;


const Allign =
{
    Left  : 0,
    Right : 1,
    Center: 2,
    Bottom: 3,
    Top   : 4,
    
};

class Quad 
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.tx = 0;
        this.ty = 0;
    }
}

//********************************************************************************************************************************************/
class LineBatch 
{
    constructor(maxVertex)
    {
        this.vertexStrideSize = (3 + 4) ;

        this.maxVertex =  maxVertex ;
 
        this.vertices = new Float32Array( this.maxVertex * 3 * this.vertexStrideSize *4); 
        this.totalAlloc = Math.floor( ( this.maxVertex * 3 * this.vertexStrideSize * 4) /7 );
        console.log("TotalAlloc: " + this.totalAlloc + " Vertex: " + Math.floor(this.totalAlloc*7));
        this.vertexCount= 0;
        this.indexCount = 0;
        this.colorr=1.0;
        this.colorg=1.0;
        this.colorb=1.0;
        this.colora=1.0;
        this.mode = -1;
        this.depth = 0.0;
        this.Init();
   
    }
    Release()
    {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteVertexArray(this.VAO);
    }

    Init()
    {
      

        this.vertexBuffer = gl.createBuffer();
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
     

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, this.vertexStrideSize *4, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, this.vertexStrideSize *4, 3*4);


        gl.bindVertexArray(null);

    }

  
    Vertex3f(x, y, z)
    {
      
     
        this.vertices[this.indexCount++] = x;
        this.vertices[this.indexCount++] = y;
        this.vertices[this.indexCount++] = z;
        this.vertices[this.indexCount++] = this.colorr;
        this.vertices[this.indexCount++] = this.colorg;
        this.vertices[this.indexCount++] = this.colorb;
        this.vertices[this.indexCount++] = this.colora;
        
        if ( this.vertexCount >= this.totalAlloc ) 
        {

            this.indexCount = 0;
            this.vertexCount = 0;
            throw "Vertex buffer overflow with " +this.vertexCount + "  max  " + this.totalAlloc;
        }

        this.vertexCount++;
    }

    Vertex2f(x, y)
    {
        this.Vertex3f(x, y, this.depth);
    }
   
    SetColor4f(r, g, b, a)
    {
        this.colorr = r;
        this.colorg = g;
        this.colorb = b;
        this.colora = a;
    }
    SetColor3f(r, g, b)
    {
        this.colorr = r;
        this.colorg = g;
        this.colorb = b;
    }
    SetColor(color)
    {
        this.colorr = color.r;
        this.colorg = color.g;
        this.colorb = color.b;
        this.colora = color.a;
    }

    Render()
    {
       this.Flush();   
    }



    Flush()
    {
     
        if (this.indexCount === 0) return;     

       
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.indexCount));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      
        let count =this.vertexCount;
        gl.bindVertexArray(this.VAO); 
        gl.drawArrays(gl.LINES, 0, count);
        gl.bindVertexArray(null);

        this.indexCount = 0;
        this.vertexCount = 0;
       
    }
    Line3D(x1, y1, z1, x2, y2, z2)
    {
        this.Vertex3f(x1, y1, z1);
        this.Vertex3f(x2, y2, z2);
    }
    Line2D(x1, y1, x2, y2)
    {
        this.Line3D(x1, y1, this.depth, x2, y2, this.depth);
    }
    Grid3D(slices, spacing)
    {

        //axes
        this.SetColor3f(1.0, 0.0, 0.0);
        this.Line3D(0,0.5,0,1,0.5,0);

        this.SetColor3f(0.0, 1.0, 0.0);
        this.Line3D(0,0.5,0,0,1.5,0);

        this.SetColor3f(0.0, 0.0, 1.0);
        this.Line3D(0,0.5,0,0,0.5,1);


        this.SetColor3f(0.0, 1.0, 0.0);
    

        let half = slices /2;
        
        for (let i = -half; i <= half; i++)
        {
            if (i===0)
            {
                this.SetColor3f(0.5, 0.5, 0.4);
            }else 
            {
                this.SetColor3f(0.75, 0.75, 0.75);
            }

            this.Line3D(i * spacing, 0, -half * spacing, i * spacing, 0, half * spacing);
            this.Line3D(-half * spacing, 0, i * spacing, half * spacing, 0, i * spacing);
           
        }
    
    }

    Cube(x, y, z, size)
    {
        this.SetColor3f(1.0, 0.0, 0.0);
        this.Line3D(x, y, z, x + size, y, z);
        this.Line3D(x, y, z, x, y + size, z);
        this.Line3D(x, y, z, x, y, z + size);
        this.Line3D(x + size, y, z, x + size, y + size, z);
        this.Line3D(x + size, y, z, x + size, y, z + size);
        this.Line3D(x, y + size, z, x + size, y + size, z);
        this.Line3D(x, y + size, z, x, y + size, z + size);
        this.Line3D(x, y, z + size, x + size, y, z + size);
        this.Line3D(x, y, z + size, x, y + size, z + size);
        this.Line3D(x + size, y + size, z, x + size, y + size, z + size);
        this.Line3D(x + size, y + size, z, x, y + size, z + size);
        this.Line3D(x + size, y + size, z + size, x, y + size, z + size);
        this.Line3D(x + size, y + size, z + size, x + size, y, z + size);
    }
   Sphere(x, y, z, radius, numLines=12) 
   {
        var segments = numLines / 2;
        var step = Math.PI / segments;
    
        for (var lat = -Math.PI / 2; lat <= Math.PI / 2; lat += step) {
            for (var lon = 0; lon <= Math.PI * 2; lon += step) {
                var x1 = x + radius * Math.cos(lat) * Math.cos(lon);
                var y1 = y + radius * Math.cos(lat) * Math.sin(lon);
                var z1 = z + radius * Math.sin(lat);
    
                var x2 = x + radius * Math.cos(lat) * Math.cos(lon + step);
                var y2 = y + radius * Math.cos(lat) * Math.sin(lon + step);
                var z2 = z + radius * Math.sin(lat);
    
                this.Line3D(x1, y1, z1, x2, y2, z2);
            }
        }
    
        for (var lon = 0; lon <= Math.PI * 2; lon += step) 
        {
            for (var lat = -Math.PI / 2; lat <= Math.PI / 2; lat += step) 
            {
                var x1 = x + radius * Math.cos(lat) * Math.cos(lon);
                var y1 = y + radius * Math.cos(lat) * Math.sin(lon);
                var z1 = z + radius * Math.sin(lat);
    
                var x2 = x + radius * Math.cos(lat + step) * Math.cos(lon);
                var y2 = y + radius * Math.cos(lat + step) * Math.sin(lon);
                var z2 = z + radius * Math.sin(lat + step);
    
                this.Line3D(x1, y1, z1, x2, y2, z2);
            }
        }
    }
    Cylinder(x, y, z, radius, height, numLines=16)
     {
        var segments = numLines;
        var step = Math.PI * 2 / segments;
    
        // linhas horizontais do cilindro
        for (var i = 0; i < segments; i++) 
        {
            var angle1 = i * step;
            var angle2 = (i + 1) * step;
    
            var x1 = x + radius * Math.cos(angle1);
            var y1 = y;
            var z1 = z + radius * Math.sin(angle1);
    
            var x2 = x + radius * Math.cos(angle2);
            var y2 = y;
            var z2 = z + radius * Math.sin(angle2);
    
            this.Line3D(x1, y1, z1, x2, y2, z2);
    
            var x3 = x + radius * Math.cos(angle1);
            var y3 = y + height;
            var z3 = z + radius * Math.sin(angle1);
    
            var x4 = x + radius * Math.cos(angle2);
            var y4 = y + height;
            var z4 = z + radius * Math.sin(angle2);
    
            this.Line3D(x3, y3, z3, x4, y4, z4);
    
            this.Line3D(x1, y1, z1, x3, y3, z3);
        }
    
        // linhas verticais do cilindro
        for (var i = 0; i < segments; i++) 
        {
            var angle = i * step;
            var x1 = x + radius * Math.cos(angle);
            var z1 = z + radius * Math.sin(angle);
            var x2 = x + radius * Math.cos(angle);
            var z2 = z + radius * Math.sin(angle);
            var y1 = y;
            var y2 = y + height;
    
            this.Line3D(x1, y1, z1, x2, y2, z2);
        }
    }
    
    

}



//********************************************************************************************************************************************/

//********************************************************************************************************************************************/
class CharacterInfo 
{
    constructor() 
    {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.char=0;

    }
}


class Font 
{
    constructor(capacity)
    {
        this.maxVertex = capacity;
        this.vertexStrideSize = (3 + 2 + 4);
        this.vertices = new Float32Array(capacity * 4 * this.vertexStrideSize);
        this.indices  = new Uint16Array(capacity *  4 * 6);
        this.maxElemnts = capacity * 4 * 6;

    
        this.mCharInfo=[];
        this.isReady = false;
        this.buffersOk = false;
        this.texture = null;
        this.depth= 1.0;
        this.maxWidth = 1;
        this.maxHeight = 1;        
        this.size =16;
        this.colorr=1.0;
        this.colorg=1.0;
        this.colorb=1.0;
        this.colora=1.0;
        this.allign = "left";


        this.quad = new Float32Array(8);
        this.quads=[];
        this.quads.push(new Quad());
        this.quads.push(new Quad());
        this.quads.push(new Quad());
        this.quads.push(new Quad());
    
        this.clip = new Rectangle(0, 0, Renderer.GetWidth(), Renderer.GetHeight());
        this.useClip = false;
        this.flip_x = false;
        this.flip_y = false;



        
        this.totalAlloc = Math.floor( ( this.maxVertex * 4 * this.vertexStrideSize * 4) / 9);

        this.vertexCount  = 0;
        this.vertexIndex  = 0;

        let k=0;
        for (let i = 0; i < this.maxElemnts ; i+=6)
        {
            this.indices[i ]    = 4 * k + 0;
            this.indices[i + 1] = 4 * k + 1;
            this.indices[i + 2] = 4 * k + 2;
            this.indices[i + 3] = 4 * k + 0;
            this.indices[i + 4] = 4 * k + 2;
            this.indices[i + 5] = 4 * k + 3;
            k++;
        }    
        this.Init();
    }

    Release()
    {
        this.texture.Release();
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }


    processData(data)
    {
        try 
        {
            let lines = data.split('\n');
            for (let i = 0; i < lines.length; i++)
            {
                let line = lines[i];
                let charInfo = new CharacterInfo();
                let tokens = line.split(',');
                charInfo.char = tokens[0].split('=')[1];
                charInfo.x = parseInt(tokens[1]);
                charInfo.y = parseInt(tokens[2]);
                charInfo.width = parseInt(tokens[3]);
                charInfo.height= parseInt(tokens[4]);

                if (charInfo.width > this.maxWidth) this.maxWidth = charInfo.width;
                if (charInfo.height > this.maxHeight) this.maxHeight = charInfo.height;

                charInfo.offsetX= parseInt(tokens[5]);
                charInfo.offsetY= parseInt(tokens[6]);
                this.mCharInfo.push(charInfo);
               // console.log("Char: " + charInfo.char + " x: " + charInfo.x + " y: " + charInfo.y + " w: " + charInfo.width + " h: " + charInfo.height + " ox: " + charInfo.offsetX + " oy: " + charInfo.offsetY);
            }

        
           
        } 
        catch (e) 
        {
            this.isReady = false;
            console.log("Fail process font data"+e);
            return;
        }
        
        this.isReady = true;
    }

    async Create(textureData, data)
    {
        return new Promise((resolve) => 
        {
            console.log("Processando fonte");
            this.processData(atob(data));
            let image = new Image();
            this.texture = new Texture2D();
            this.texture.name = "fontDefault";
                     
            image.onload = () => 
            {
                this.texture.Load(image);
                resolve();
            };
            image.src = textureData;
        });        


    }

    async Load(filename, imageName)
     {
        this.filename = filename;
        this.textureName = imageName;

        try 
        {
            const data = await Assets.LoadFile(this.filename);
            this.processData(data);
            this.texture = Game.GetTexture(this.textureName);
        } catch (error) 
        {
            console.error('Erro ao carregar o arquivo:', error);
        }
    }

    Init()
    {
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer  = gl.createBuffer();
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, this.vertexStrideSize *4, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, this.vertexStrideSize *4, 3 * 4);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, this.vertexStrideSize *4, 5 * 4);

       gl.bindVertexArray(null);


    }

    Flush()
    {
     

       if (this.vertexCount === 0) return;

     
        Renderer.SetBlend(true);
        Renderer.SetBlendMode(BlendMode.Normal);

             

        // let shader = Renderer.GetShader("texture");
        // Renderer.SetShader(shader);
       
 
       
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
       gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.vertexIndex));
       gl.bindBuffer(gl.ARRAY_BUFFER, null);


  

      

        Renderer.SetTexture(this.texture);
        //this.texture.Use();
        gl.bindVertexArray(this.VAO);
        gl.drawElements(gl.TRIANGLES, (this.vertexCount / 4) * 6, gl.UNSIGNED_SHORT, 0);
  
        gl.bindVertexArray(null);


        this.vertexIndex = 0;
        this.vertexCount = 0;


    }

    Render()
    {
        if (!this.isReady || this.vertexCount === 0 ) return;

        this.Flush();
       
     }

     TextCoords(u, v)
     {
         this.uvx = u ;
         this.uvy = v ;
     }
     Vertex2(x, y)
     {
         this.Vertex3(x, y, this.depth);
     }

     Vertex3(x, y, z)
     {
         this.vertices[this.vertexIndex++] = x;
         this.vertices[this.vertexIndex++] = y;
         this.vertices[this.vertexIndex++] = z;
         this.vertices[this.vertexIndex++] = this.uvx;
         this.vertices[this.vertexIndex++] = this.uvy;
         this.vertices[this.vertexIndex++] = this.colorr;
         this.vertices[this.vertexIndex++] = this.colorg;
         this.vertices[this.vertexIndex++] = this.colorb;
         this.vertices[this.vertexIndex++] = this.colora;
 
         if ( this.vertexCount >= this.totalAlloc ) 
         {
             throw "Vertex buffer overflow with " +this.vertexCount + "  max  " + this.totalAlloc;
         }
 
         this.vertexCount++;
 
        }



    SetColor4f(r, g, b, a)
    {
        this.colorr = r;
        this.colorg = g;
        this.colorb = b;
        this.colora = a;
    }
    SetColor3f(r, g, b)
    {
        this.colorr = r;
        this.colorg = g;
        this.colorb = b;
    }

    SetColor(color)
    {
        this.colorr = color.r;
        this.colorg = color.g;
        this.colorb = color.b;
        this.colora = color.a;
    }
    SetSize(size)
    {
        this.size = size;
    }
   
    SetAllignment(allign)
    {
        this.allign = allign;
    }
    
    GetMaxHeight()  
    {
        return this.maxHeight;
    }

    GetMaxWidth()
    {
        return this.maxWidth;
    }

    SetClip(x, y, width, height)
    {
        this.clip.set(x, y, width, height);
        this.useClip = true;
    }
    DisableClip()
    {
        this.useClip = false;
    }
    EnableClip()
    {
        this.useClip = true;
    }
    SetFlip(flipX, flipY)
    {
        this.flip_x = flipX;
        this.flip_y = flipY;
    }
    FlipX(v)
    {
        this.flip_x = v;
    }

    FlipY(v)
    {
        this.flip_y = v;
    }

    GetTextWidth(text)
    {
        let length = text.length;
        let scale = this.size / this.maxWidth * 0.5;
        let offsetX = 0;
        for (let i = 0; i < length; i++)
        {
            let c = text.charCodeAt(i);
 
            let charInfo = this.mCharInfo[c - 32];
            if (charInfo === undefined) continue;
            let clip_w = charInfo.width;
            let off_x = charInfo.offsetX;
    
            offsetX +=  clip_w * scale;
        }
        return offsetX;

    }

    Print( x, y, text)
    {
       
       
      
        let scale = this.size / this.maxWidth * 0.5;
        let offsetX = x;
        let offsetY = y ;
        let moveY =  (this.maxHeight * 0.5) * scale;
        let length = text.length;
        

        if (this.allign === "center")
        {
            offsetX -=  (this.GetTextWidth(text) / 2);
        }
        else if (this.allign === "left")
        {
            offsetX = x;
        }
        else if (this.allign === "right")
        {
            offsetX -= this.GetTextWidth(text);
        }


        for (let i = 0; i < length; i++)
        {
            let c = text.charCodeAt(i);
            if (c === 10)
            {
                offsetY -= this.maxHeight * scale;
                offsetX = x;
                continue;
            }
            let charInfo = this.mCharInfo[c - 32];
            if (charInfo === undefined) continue;
            let clip_x = charInfo.x;
            let clip_y = charInfo.y;
            let clip_w = charInfo.width;
            let clip_h = charInfo.height;
            let off_x = charInfo.offsetX;
            let off_y = charInfo.offsetY + moveY;
          
            this.Draw(  
                 offsetX + off_x  * scale, 
                 offsetY + off_y  * scale, 
                clip_w * scale, clip_h * scale, 
                clip_x, clip_y, clip_w, clip_h);

              offsetX += clip_w * scale;
         
        }

    }

    Draw( x, y, width, height, src_x, src_y, src_width, src_height)
    {

        if (!this.isReady) return;

        let left = 0;
        let right = 1;
        let top = 0;
        let bottom = 1;
    

        let widthTex = this.texture.width;
        let heightTex = this.texture.height;



        if (FIX_ARTIFACTS_BY_STRECHING_TEXEL)
        {
      
         left = (2*src_x+1) / (2*widthTex);
         right =  left +(src_width*2-2) / (2*widthTex);
         top = (2*src_y+1) / (2*heightTex);
         bottom = top +(src_height * 2 - 2) / (2 * heightTex);
           
      
        }else
        {
         left = src_x / widthTex;
         right =  (src_x + src_width) / widthTex;
         top = src_y / heightTex;
         bottom = (src_y + src_height) / heightTex;
        }		
        
        if (this.flip_x)
        {
            let tmp = left;
            left = right;
            right = tmp;
        }

        if (this.flip_y)
        {
            let tmp = top;
            top = bottom;
            bottom = tmp;
        }
       
        
        let x1 =x;                let y1 =y;
        let x2 =x;                let y2 =y + height;
        let x3 =x + width;        let y3 =y + height;
        let x4 =x + width;        let y4 =y;
        
        let minx_x=Min( Min(x1, x2), Min(x3, x4));
        let minx_y=Min( Min(y1, y2), Min(y3, y4));
        let maxx_x=Max( Max(x1, x2), Max(x3, x4));
        let maxx_y=Max( Max(y1, y2), Max(y3, y4));

        let WIDTH  = maxx_x - minx_x;
        let HEIGHT = maxx_y - minx_y;



      

        this.quads[0].x = x1;  this.quads[0].y = y1; 
        this.quads[1].x = x2;  this.quads[1].y = y2;
        this.quads[2].x = x3;  this.quads[2].y = y3;
        this.quads[3].x = x4;  this.quads[3].y = y4;

        this.quads[0].tx = left;  this.quads[0].ty = top;
        this.quads[1].tx = left;  this.quads[1].ty = bottom;
        this.quads[2].tx = right; this.quads[2].ty = bottom;
        this.quads[3].tx = right; this.quads[3].ty = top;

        let quadLeft = Min(Min(this.quads[0].x, this.quads[1].x), Min(this.quads[2].x, this.quads[3].x));
        let quadTop = Min(Min(this.quads[0].y, this.quads[1].y), Min(this.quads[2].y, this.quads[3].y));
        let quadRight = Max(Max(this.quads[0].x, this.quads[1].x), Max(this.quads[2].x, this.quads[3].x));
        let quadBottom = Max(Max(this.quads[0].y, this.quads[1].y), Max(this.quads[2].y, this.quads[3].y));

        if (this.useClip)
        {
            if (quadRight < this.clip.x || quadLeft > this.clip.x + this.clip.width || quadBottom < this.clip.y || quadTop > this.clip.y + this.clip.height)
            {
                return;
            }

            if (x1 < this.clip.x)
            {
                let delta = this.clip.x - x1;
                let ratio = delta / WIDTH;
                this.quads[0].x = this.quads[1].x = this.clip.x;
                this.quads[0].tx = this.quads[1].tx = left + (right - left) * ratio;

            } 

            if (x1 + WIDTH > this.clip.x + this.clip.width)
            {
                let delta = (x1 + WIDTH) - (this.clip.x + this.clip.width);
                let ratio = delta / WIDTH;
                this.quads[2].x = this.quads[3].x = this.clip.x + this.clip.width;
                this.quads[2].tx = this.quads[3].tx = right - (right - left) * ratio;
            }

            if (y1 < this.clip.y)
            {
                let delta = this.clip.y - y1;
                let ratio = delta / HEIGHT;
                this.quads[0].y = this.quads[3].y = this.clip.y;
                this.quads[0].ty = this.quads[3].ty = top + (bottom - top) * ratio;
            }

            if (y1 + HEIGHT > this.clip.y + this.clip.height)
            {
                let delta = (y1 + HEIGHT) - (this.clip.y + this.clip.height);
                let ratio = delta / HEIGHT;
                this.quads[1].y = this.quads[2].y = this.clip.y + this.clip.height;
                this.quads[1].ty = this.quads[2].ty = bottom - (bottom - top) * ratio;
            }

        }
        

           
        this.TextCoords(this.quads[0].tx, this.quads[0].ty);
        this.Vertex2(this.quads[0].x, this.quads[0].y);

        this.TextCoords(this.quads[1].tx, this.quads[1].ty);
        this.Vertex2(this.quads[1].x, this.quads[1].y);

       
        this.TextCoords(this.quads[2].tx, this.quads[2].ty);
        this.Vertex2(this.quads[2].x, this.quads[2].y);

        this.TextCoords(this.quads[3].tx, this.quads[3].ty);
        this.Vertex2(this.quads[3].x, this.quads[3].y);

        
        // this.TextCoords(this.quads[1].tx, this.quads[1].ty);
        // this.Vertex2(this.quads[1].x, this.quads[1].y);

        // this.TextCoords(this.quads[0].tx, this.quads[0].ty);
        // this.Vertex2(this.quads[0].x, this.quads[0].y);

        // this.TextCoords(this.quads[3].tx, this.quads[3].ty);
        // this.Vertex2(this.quads[3].x, this.quads[3].y);

        // this.TextCoords(this.quads[2].tx, this.quads[2].ty);
        // this.Vertex2(this.quads[2].x, this.quads[2].y);



    }


}