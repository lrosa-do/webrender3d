
"use strict";

const VBOVERTEX    = 1;
const VBOCOLOR     = 2;
const VBONORMAL    = 4;
const VBOTANGENT   = 8;
const VBOBITANGENT = 16;
const VBOTEXTURE0  = 32;
const VBOTEXTURE1  = 64;
const VBOTEXTURE2  = 128;
const VBOTEXTURE3  = 256;
const VBOTEXTURE4  = 512;
const VBOTEXTURE5  = 1024;
const VBOTEXTURE6  = 2048;
const VBOINDEX     = 4096;

const FLAG1 = 0x0001; // 1
const FLAG2 = 0x0002; // 2
const FLAG3 = 0x0004; // 4
const FLAG4 = 0x0008; // 8
const FLAG5 = 0x0010; // 16
const FLAG6 = 0x0020; // 32
const FLAG7 = 0x0040; // 64
const FLAG8 = 0x0080; // 128
const FLAG9 = 0x0100; // 256
const FLAG10 = 0x0200; // 512
const FLAG11 = 0x0400; // 1024
const FLAG12 = 0x0800; // 2048
const FLAG13 = 0x1000; // 4096
const FLAG14 = 0x2000; // 8192
const FLAG15 = 0x4000; // 16384
const FLAG16 = 0x8000; // 32768
const FLAG17 = 0x10000; // 65536
const FLAG18 = 0x20000; // 131072
const FLAG19 = 0x40000; // 262144
const FLAG20 = 0x80000; // 524288


const POSITION  = 0x0001;
const COLOR     = 0x0002;
const NORMAL    = 0x0004;
const TEXTURE0  = 0x0008;
const TEXTURE1  = 0x0010;
const TANGENT   = 0x0020;
const BITANGENT = 0x0040;

const FaceSides = 
{
    FRONT: 0,
    BACK: 1,
    LEFT: 2,
    RIGHT: 3,
    TOP: 4,
    BOTTOM: 5
};

class Material
{
    constructor(name)
    {
        this.textures=[];
        this.color = new Color(1,1,1,1);
        this.name=name;
        this.attributes = [POSITION,COLOR];
        this.cullFaces = true;
        this.cullMode = CullMode.Back;
        this.depth     =true;
        this.blend    = false;
        this.depthMode = DepthMode.Always;
        this.blendMode = BlendMode.Normal;

    }
    Set(shader)
    {

         Core.SetCullFace(this.cullFaces);
         Core.SetCullFaceMode(this.cullMode);
        // Core.SetDepthFunc(this.depthMode);
         Core.SetDepthTest(this.depth);
         Core.SetBlend(this.blend);

         if (this.blend)
         {
             Core.SetBlendMode(this.blendMode);
         }
        

       
    }
    UnSet(shader)
    {
        
    }
}




class TextureMaterial extends Material
{
    constructor(texture=null)
    {
        super("texture");
        this.texture = texture;
        this.attributes = [POSITION,TEXTURE0,COLOR];
    }
    SetTexture(texture)
    {
        this.texture = texture;
        return this;
    }
    Set(shader)
    {
         super.Set(shader);
         if (shader.ContainsUniform("uTexture0"))
         {
             shader.SetInteger("uTexture0", 0);
            if (this.texture !== null && this.texture !== undefined)
            {
                    Core.SetTexture(this.texture,0);
            }
        }
       

     
    }
}

class SkyBoxMaterial extends Material
{
    constructor()
    {
        super("skybox");
        this.attributes = [POSITION];
        this.cullFaces = false;
        this.depthMode = DepthMode.LEQUAL;
    }
    SetTexture(texture)
    {
        this.texture = texture;
        return this;
    }
    Set(shader)
    {

        super.Set(shader);
      
        shader.SetInteger("cubeTexture", 0);
         if (this.texture !== null && this.texture !== undefined)
        {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture.id);
        }
        return shader;
    }
    UnSet(shader)
    {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}



class LightMaterial extends TextureMaterial
{
    constructor(texture=null)
    {
        super("light",texture);
        
        this.attributes = [POSITION,TEXTURE0,NORMAL];
 
 

    }
    Set(shader)
    {
        super.Set(shader);

      

      
        const light = Core.GetDirectionalLight();
        const position = Core.GetCameraPosition();
        shader.SetUniform3f("light.direction", light.direction.x, light.direction.y, light.direction.z);
        shader.SetUniform3f("light.color", light.color.r, light.color.g, light.color.b);
        shader.SetFloat("light.ambientIntensity", light.ambientIntensity);
        shader.SetFloat("light.diffuseIntensity", light.diffuseIntensity);

        shader.SetFloat("specularIntensity", light.specularIntensity);
        shader.SetFloat("shininess", light.shininess);

        shader.SetUniform3f("cameraPosition", position.x, position.y, position.z);

    }


}

class InstanceMaterial extends TextureMaterial
{
    constructor(texture)
    {
        super(texture);
        this.texture = texture;
        this.shaderName = "instance";
    }
 
    Set()
    {
        let shader = super.Set();
        shader.SetUniform3f("uAmbientColor", Core.light.ambient.r,Core.light.ambient.g,Core.light.ambient.b);
        return shader;
    }
}

class Surface 
{
    constructor(attributes, dynamic=false)
    {
        this.vertices   = [];
        this.indices    = [];
        this.dynamic    = dynamic;
        this.attributes = attributes;
        this.flags = 0;  
        this.data = POSITION;
        this.vbo = [];
        this.material=0;
        this.no_verts = 0;
        this.vertexIndex = 0;
        this.box = new BoundingBox();
    
        this.vao = 0;
        if (attributes.length === 0)
        {
            throw "Attributes must be defined";
        }

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        this.ebo =  gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.Config();
        gl.bindVertexArray(null);      
      
    }

    Config()
    {
        let offset = 0;
       
  

        for (let index in this.attributes)
        {
                let attribute = this.attributes[index];
                this.vbo[index] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                gl.enableVertexAttribArray(index);

                if (attribute === POSITION)
                {
                    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
                //    console.log("Position");
    
                    offset += 3;
                } else
                if (attribute === NORMAL)
                {
                    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
                 //   console.log("Normal");

                    this.data |= NORMAL;     
                    this.normals    = [];
                    offset += 3;
                } else
                if (attribute === COLOR)
                {
                    gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0);
                   // console.log("Color");   
                    this.colors     = [];
                    this.data  |= COLOR;
                    offset += 4;
                } else
                if (attribute === TEXTURE0)
                {
                    gl.vertexAttribPointer(index, 2, gl.FLOAT, false, 0, 0);
                  //  console.log("Texture0");
                    this.texcoord0  = [];
                    this.data |= TEXTURE0;

                    offset += 2;
                } else
                if (attribute === TEXTURE1)
                {
                    gl.vertexAttribPointer(index, 2, gl.FLOAT, false, 0, 0);
                    this.data |= TEXTURE1;
                    this.texcoord1  = [];
                    offset += 2;
                } else 
                if (attribute === TANGENT)
                {
                    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
                    this.data |= TANGENT;
                    this.tangents   = [];
                    offset += 3;
                }
                else
                if (attribute === BITANGENT)
                {
                    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
                    this.data |= BITANGENT;
                    this.bitangents = [];
                    offset += 3;
                }               
         }
        
    }

    Update()
    {

        let state = this.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;


        for (let index in this.attributes)
        {

               
            let attribute = this.attributes[index];
        
            if (attribute === POSITION)
            {
                if (this.flags & VBOVERTEX)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), state);
                    this.flags &= ~VBOVERTEX;
                }
            } else 
            if (attribute === NORMAL)
            {
                if (this.flags & VBONORMAL)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), state);
                    this.flags &= ~VBONORMAL;
                }
            } else 
            if (attribute === COLOR)
            {
                if (this.flags & VBOCOLOR)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), state);
                    this.flags &= ~VBOCOLOR;
                }

            } else 
            if (attribute === TEXTURE0)
            {
                if (this.flags & VBOTEXTURE0)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoord0), state);
                    this.flags &= ~VBOTEXTURE0;

                }
            } else 
            if (attribute === TEXTURE1)
            {
                if (this.flags & VBOTEXTURE1)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoord1), state);
                    this.flags &= ~VBOTEXTURE1;
                } 
            }else
            if (attribute === TANGENT)
            {
                if (this.flags & VBOTANGENT)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangents), state);
                    this.flags &= ~VBOTANGENT;
                 //   console.log("update Tangent");
                }
            } else
            if (attribute === BITANGENT)
            {
                if (this.flags & VBOBITANGENT)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bitangents), state);
                    this.flags &= ~VBOBITANGENT;
                 //   console.log("update Bitangent");
                }
            }
        
        }


        if (this.flags & VBOINDEX)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), state);
            this.flags &= ~VBOINDEX;
           // console.log("update Indices");
        }
        this.flags = 0;
    }

    Clear()
    {

        this.no_verts=0;
        this.vertices=[];
        this.indices=[];
        this.flags |= VBOVERTEX;

        if (this.data & NORMAL)
        {
                this.normals=[];
                this.flags |= VBONORMAL;
        }

        if (this.data & COLOR)
        {
                this.colors=[];
                this.flags |= VBOCOLOR;
        }

        if (this.data & TEXTURE0)
        {
            this.texcoord0=[];
            this.flags |= VBOTEXTURE0;
        }

        if (this.data & TEXTURE1)
        {
            this.texcoord1=[];
            this.flags |= VBOTEXTURE1;
        }
        
    }

    MakePlanarMapping(resolution)
    {

        if ((this.vertices.length === 0) ||
           (this.vertices.length === 0)  ||
           (this.texcoord0.length === 0) ||
           (this.indices.length === 0)) return;

        for (let i=0;i<this.indices.length;i+=3)
        {
            const a = this.indices[i];
            const b = this.indices[i+1];
            const c = this.indices[i+2];

            const v0 = this.GetPosition(a);
            const v1 = this.GetPosition(b);
            const v2 = this.GetPosition(c);

            let plane = Plane3D.FromPoints(v0,v1,v2);

            plane.normal.x = Math.abs(plane.normal.x);
            plane.normal.y = Math.abs(plane.normal.y);
            plane.normal.z = Math.abs(plane.normal.z);

            if (plane.normal.x > plane.normal.y && plane.normal.x > plane.normal.z)
            {
                this.VertexTexCoords(a, v0.y* resolution, v0.z* resolution);
                this.VertexTexCoords(b, v1.y* resolution, v1.z* resolution);
                this.VertexTexCoords(c, v2.y* resolution, v2.z* resolution);
            } else 
            if (plane.normal.y > plane.normal.x && plane.normal.y > plane.normal.z)
            {
                this.VertexTexCoords(a, v0.x* resolution, v0.z* resolution);
                this.VertexTexCoords(b, v1.x* resolution, v1.z* resolution);
                this.VertexTexCoords(c, v2.x* resolution, v2.z* resolution);
            } else
            {
                this.VertexTexCoords(a, v0.x* resolution, v0.y* resolution);
                this.VertexTexCoords(b, v1.x* resolution, v1.y* resolution);
                this.VertexTexCoords(c, v2.x* resolution, v2.y* resolution);
            }

        }


    }

    Render()
    {
        if (this.indices.length === 0) return;
        if (this.flags !== 0) this.Update();
        let count = this.indices.length;
        gl.bindVertexArray(this.vao);
        //gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        Core.DrawElements(gl.TRIANGLES, count,  0);

        gl.bindVertexArray(null);
    }

    AddVertex(x,y,z,u=0.0,v=0.0)
    {
        this.no_verts++;
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);
        this.flags |= VBOVERTEX;
        this.box.addPoint(x,y,z);

        if (this.data & NORMAL)
        {
                this.normals.push(0);
                this.normals.push(0);
                this.normals.push(0);
                this.flags |= VBONORMAL;
        }

        if (this.data & COLOR)
        {
                this.colors.push(1);
                this.colors.push(1);
                this.colors.push(1);
                this.colors.push(1);
                this.flags |= VBOCOLOR;
        }

        if (this.data & TEXTURE0)
        {
            this.texcoord0.push(u);
            this.texcoord0.push(v);
            this.flags |= VBOTEXTURE0;
        }

        if (this.data & TEXTURE1)
        {
            this.texcoord1.push(u);
            this.texcoord1.push(v);
            this.flags |= VBOTEXTURE1;
        }
        return this.no_verts - 1;
    }
    
    VertexNormal(index, x, y, z)
    {
        if (this.data & NORMAL )
        {
        this.normals[index*3] = x;
        this.normals[index*3+1] = y;
        this.normals[index*3+2] = z;
        this.flags |= VBONORMAL;
        }
    }

    VertexColor(index, r, g, b, a)
    {
        if (this.data & COLOR === 0) return;
        this.colors[index*4] = r;
        this.colors[index*4+1] = g;
        this.colors[index*4+2] = b;
        this.colors[index*4+3] = a;
        this.flags |= VBOCOLOR;
    }
    VertexTexCoords(index, u, v, layer=0)
    {
        index = index * 2;
        if (layer === 0)
        {
            if (this.data & TEXTURE0 === 0) return;
            this.texcoord0[index] = u;
            this.texcoord0[index+1] = v;
            this.flags |= VBOTEXTURE0;
        } else
        {
            if (this.data & TEXTURE1 === 0) return;
            this.texcoord1[index] = u;
            this.texcoord1[index+1] = v;
            this.flags |= VBOTEXTURE1;
        }

    }


   
    AddTriangle(a,b,c)
    {
        this.indices.push(a);
        this.indices.push(b);
        this.indices.push(c);
        this.flags |= VBOINDEX;
    }

    VertexPosition(index, x, y, z)
    {
        let offset = index * 3;
        this.vertices[offset] = x;
        this.vertices[offset+1] = y;
        this.vertices[offset+2] = z;
        this.flags |= VBOVERTEX;
    }
    VertexNormal(index, x, y, z)
    {
        if (this.data & NORMAL)
        {
        let offset = index * 3;
        this.normals[offset] = x;
        this.normals[offset+1] = y;
        this.normals[offset+2] = z;
        this.flags |= VBONORMAL;
        }
    }
    VertexColor(index, r, g, b, a)
    {
        if (this.data & COLOR )
        {
        let offset = index * 4;
        this.colors[offset] = r;
        this.colors[offset+1] = g;
        this.colors[offset+2] = b;
        this.colors[offset+3] = a;
        this.flags |= VBOCOLOR;
        } else 
        {
            console.warn("Color not enabled");
        }
    

    }


    // AddFace(side,x,y,z,uvs,index)
    // {
    //     let id = index * 4;
    //     let uv00   = uvs[id+2].x;        let uv01   = uvs[id+2].y;
    //     let uv10   = uvs[id+3].x;        let uv11   = uvs[id+3].y;
    //     let uv20   = uvs[id].x;          let uv21   = uvs[id].y;
    //     let uv30   = uvs[id+1].x;        let uv31   = uvs[id+1].y;


    //     if (side === FaceSides.FRONT)
    //     {
           

    //         let f0 = this.AddVertex(x-0.5, y-0.5,  z+0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x+0.5, y-0.5,  z+0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x+0.5, y+0.5,  z+0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x-0.5, y+0.5,  z+0.5, uv30, uv31);

    //         this.VertexNormal(f0, 0, 0, 1);
    //         this.VertexNormal(f1, 0, 0, 1);
    //         this.VertexNormal(f2, 0, 0, 1);
    //         this.VertexNormal(f3, 0, 0, 1);

    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);

    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);


    //     }  else 
    //     if (side === FaceSides.BACK)
    //     {
            
    //         let f0 = this.AddVertex(x+0.5, y-0.5,  z-0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x-0.5, y-0.5,  z-0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x-0.5, y+0.5,  z-0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x+0.5, y+0.5,  z-0.5, uv30, uv31);
    //         this.VertexNormal(f0, 0, 0, -1);
    //         this.VertexNormal(f1, 0, 0, -1);
    //         this.VertexNormal(f2, 0, 0, -1);
    //         this.VertexNormal(f3, 0, 0, -1);
            
    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);
    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);
    //     } else
    //     if (side === FaceSides.LEFT)
    //     {
     
    //         let f0 = this.AddVertex(x-0.5, y-0.5,  z-0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x-0.5, y-0.5,  z+0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x-0.5, y+0.5,  z+0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x-0.5, y+0.5,  z-0.5, uv30, uv31);
    //         this.VertexNormal(f0, -1, 0, 0);
    //         this.VertexNormal(f1, -1, 0, 0);
    //         this.VertexNormal(f2, -1, 0, 0);
    //         this.VertexNormal(f3, -1, 0, 0);
            
    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);
    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);
    //     } else
    //     if (side === FaceSides.RIGHT)
    //     {
            
    //         let f0 = this.AddVertex(x+0.5, y-0.5,  z+0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x+0.5, y-0.5,  z-0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x+0.5, y+0.5,  z-0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x+0.5, y+0.5,  z+0.5, uv30, uv31);
    //         this.VertexNormal(f0, 1, 0, 0);
    //         this.VertexNormal(f1, 1, 0, 0);
    //         this.VertexNormal(f2, 1, 0, 0);
    //         this.VertexNormal(f3, 1, 0, 0);
            
    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);

    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);
    //     } else
    //     if (side === FaceSides.TOP)
    //     {
           
    //         let f0 = this.AddVertex(x-0.5, y-0.5,  z-0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x+0.5, y-0.5,  z-0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x+0.5, y-0.5,  z+0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x-0.5, y-0.5,  z+0.5, uv30, uv31);
    //         this.VertexNormal(f0, 0, -1, 0);
    //         this.VertexNormal(f1, 0, -1, 0);
    //         this.VertexNormal(f2, 0, -1, 0);
    //         this.VertexNormal(f3, 0, -1, 0);

            
    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);

    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);
    //     } else
    //     if (side === FaceSides.BOTTOM)
    //     {
          
    //         let f0 = this.AddVertex(x-0.5, y+0.5,  z+0.5, uv00, uv01);
    //         let f1 = this.AddVertex(x+0.5, y+0.5,  z+0.5, uv10, uv11);
    //         let f2 = this.AddVertex(x+0.5, y+0.5,  z-0.5, uv20, uv21);
    //         let f3 = this.AddVertex(x-0.5, y+0.5,  z-0.5, uv30, uv31);
    //         this.VertexNormal(f0, 0, 1, 0);
    //         this.VertexNormal(f1, 0, 1, 0);
    //         this.VertexNormal(f2, 0, 1, 0);
    //         this.VertexNormal(f3, 0, 1, 0);
            
    //         this.MoveVertex(f0, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f1, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f2, 0.5,  0.5, 0.5);
    //         this.MoveVertex(f3, 0.5,  0.5, 0.5);
    //         this.AddTriangle(f0,f1,f2);
    //         this.AddTriangle(f0,f2,f3);
    //     }

       


      
    
    

        
    // }

    AddFace(side,x,y,z, widthTex, heightTex, clips, frame, flip_x =false, flip_y=false)
    {
        let id = frame ;
        let left   = 0;
        let right  = 1;
        let top    = 0;
        let bottom = 1;
        
        if (id<=0) id=0;
        
        if (id>=clips.length) id = clips.length;


        let rect = clips[id];

        left = (2*rect.x+1) / (2*widthTex);
        right =  left +(rect.width*2-2) / (2*widthTex);
        top = (2*rect.y+1) / (2*heightTex);
        bottom = top +(rect.height * 2 - 2) / (2 * heightTex);

        if (flip_x)
        {
            let tmp = left;
            left = right;
            right = tmp;
        }
    
        if (flip_y)
        {
            let tmp = top;
            top = bottom;
            bottom = tmp;
        }
    


        if (side === FaceSides.FRONT)
        {

            

            let f0 = this.AddVertex(   x+1,     y,    z+1, right, bottom);
            let f1 = this.AddVertex(   x+1,     y+1,  z+1, right, top);
            let f2 = this.AddVertex(   x,       y+1,  z+1, left, top);
            let f3 = this.AddVertex(   x,       y,    z+1, left, bottom);

            this.VertexNormal(f0, 0, 0, 1);
            this.VertexNormal(f1, 0, 0, 1);
            this.VertexNormal(f2, 0, 0, 1);
            this.VertexNormal(f3, 0, 0, 1);


            this.AddTriangle(f0,f1,f2);
            this.AddTriangle(f0,f2,f3);

         
        } else 
        if (side === FaceSides.BACK)
        {

            

            let f0 = this.AddVertex(   x+1,     y,    z, left, bottom);
            let f1 = this.AddVertex(   x+1,     y+1,  z, left, top);
            let f2 = this.AddVertex(   x,        y+1,  z, right, top);
            let f3 = this.AddVertex(   x,        y,    z, right, bottom);

            this.VertexNormal(f0, 0, 0, -1);
            this.VertexNormal(f1, 0, 0, -1);
            this.VertexNormal(f2, 0, 0, -1);
            this.VertexNormal(f3, 0, 0, -1);


            this.AddTriangle(f2,f1,f0);
            this.AddTriangle(f3,f2,f0);

         
        } else 
        if (side ===  FaceSides.LEFT)
        {

            let f0 = this.AddVertex(   x,     y,    z, left, bottom);
            let f1 = this.AddVertex(   x,     y+1,  z, left, top);
            let f2 = this.AddVertex(   x,     y+1,  z+1, right, top);
            let f3 = this.AddVertex(   x,     y,    z+1, right, bottom);

            this.VertexNormal(f0, -1, 0, 0);
            this.VertexNormal(f1, -1, 0, 0);
            this.VertexNormal(f2, -1, 0, 0);
            this.VertexNormal(f3, -1, 0, 0);

            
            // this.AddTriangle(f0,f1,f2);
            // this.AddTriangle(f0,f2,f3);

            this.AddTriangle(f2,f1,f0);
            this.AddTriangle(f3,f2,f0);

        }else 
        if (side ===  FaceSides.RIGHT)
        {

            let f0 = this.AddVertex(   x+1,     y,    z, right, bottom);
            let f1 = this.AddVertex(   x+1,     y+1,  z, right, top);
            let f2 = this.AddVertex(   x+1,     y+1,  z+1, left, top);
            let f3 = this.AddVertex(   x+1,     y,    z+1, left, bottom);

            this.VertexNormal(f0, 1, 0, 0);
            this.VertexNormal(f1, 1, 0, 0);
            this.VertexNormal(f2, 1, 0, 0);
            this.VertexNormal(f3, 1, 0, 0);


            this.AddTriangle(f0,f1,f2);
            this.AddTriangle(f0,f2,f3);

        }else
        if (side ===  FaceSides.TOP)
        {

            let f0 = this.AddVertex(   x+1,     y+1,    z+1, right, bottom);
            let f1 = this.AddVertex(   x+1,     y+1,    z, right, top);
            let f2 = this.AddVertex(   x,       y+1,    z, left, top);
            let f3 = this.AddVertex(   x,       y+1,    z+1, left, bottom);

            this.VertexNormal(f0, 0, 1, 0);
            this.VertexNormal(f1, 0, 1, 0);
            this.VertexNormal(f2, 0, 1, 0);
            this.VertexNormal(f3, 0, 1, 0);

            

            this.AddTriangle(f0,f1,f2);
            this.AddTriangle(f0,f2,f3);
    

        }
        else
        if (side ===  FaceSides.BOTTOM)
        {

            let f0 = this.AddVertex(   x+1,     y,    z+1, right, bottom);
            let f1 = this.AddVertex(   x+1,     y,    z, right, top);
            let f2 = this.AddVertex(   x,       y,    z, left, top);
            let f3 = this.AddVertex(   x,       y,    z+1, left, bottom);

            this.VertexNormal(f0, 0, 1, 0);
            this.VertexNormal(f1, 0, 1, 0);
            this.VertexNormal(f2, 0, 1, 0);
            this.VertexNormal(f3, 0, 1, 0);

            


            this.AddTriangle(f2,f1,f0);
            this.AddTriangle(f3,f2,f0);
    

        }
        

       


      
    
    

        
    }
    AddQuad(side)
    {

        if (side === FaceSides.FRONT)
        {
            let a = this.AddVertex(-0.5, -0.5, 0.5, 0.0, 1.0);
            let b = this.AddVertex( 0.5, -0.5, 0.5, 1.0, 1.0);

            


            let c = this.AddVertex( 0.5,  0.5, 0.5, 1.0, 0.0);
            let d = this.AddVertex(-0.5,  0.5, 0.5, 0.0, 0.0);


            this.VertexNormal(a, 0, 0, 1);
            this.VertexNormal(b, 0, 0, 1);

            this.VertexNormal(c, 0, 0, 1);
            this.VertexNormal(d, 0, 0, 1);



            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);

        } else
        if (side === FaceSides.BACK)
        {
            let a = this.AddVertex( 0.5, -0.5, -0.5, 0.0, 1.0);
            let b = this.AddVertex(-0.5, -0.5, -0.5, 1.0, 1.0);

            let c = this.AddVertex(-0.5,  0.5, -0.5, 1.0, 0.0);
            let d = this.AddVertex( 0.5,  0.5, -0.5, 0.0, 0.0);


            this.VertexNormal(a, 0, 0, -1);
            this.VertexNormal(b, 0, 0, -1);
            this.VertexNormal(c, 0, 0, -1);
            this.VertexNormal(d, 0, 0, -1);

            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);
        } else
        if (side === FaceSides.LEFT)
        {
            let a = this.AddVertex(-0.5, -0.5, -0.5, 0.0, 1.0);
            let b = this.AddVertex(-0.5, -0.5,  0.5, 1.0, 1.0);

            let c = this.AddVertex(-0.5,  0.5,  0.5, 1.0, 0.0);
            let d = this.AddVertex(-0.5,  0.5, -0.5, 0.0, 0.0);



            this.VertexNormal(a, -1, 0, 0);
            this.VertexNormal(b, -1, 0, 0);
            this.VertexNormal(c, -1, 0, 0);
            this.VertexNormal(d, -1, 0, 0);

            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);
        } else
        if (side === FaceSides.RIGHT)
        {
            let a = this.AddVertex( 0.5, -0.5,  0.5, 0.0, 1.0);
            let b = this.AddVertex( 0.5, -0.5, -0.5, 1.0, 1.0);

            let c = this.AddVertex( 0.5,  0.5, -0.5, 1.0, 0.0);
            let d = this.AddVertex( 0.5,  0.5,  0.5, 0.0, 0.0);

            this.VertexNormal(a, 1, 0, 0);
            this.VertexNormal(b, 1, 0, 0);
            this.VertexNormal(c, 1, 0, 0);
            this.VertexNormal(d, 1, 0, 0);


            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);
        } else
        if (side === FaceSides.TOP)
        {
            let a = this.AddVertex(-0.5,  0.5,  0.5, 0.0, 1.0);
            let b = this.AddVertex( 0.5,  0.5,  0.5, 1.0, 1.0);

            let c = this.AddVertex( 0.5,  0.5, -0.5, 1.0, 0.0);
            let d = this.AddVertex(-0.5,  0.5, -0.5, 0.0, 0.0);



            this.VertexNormal(a, 0, 1, 0);
            this.VertexNormal(b, 0, 1, 0);
            this.VertexNormal(c, 0, 1, 0);
            this.VertexNormal(d, 0, 1, 0);

            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);
        } else
        if (side === FaceSides.BOTTOM)
        {
            let a = this.AddVertex(-0.5, -0.5, -0.5, 0.0, 1.0);
            let b = this.AddVertex( 0.5, -0.5, -0.5, 1.0, 1.0);

            let c = this.AddVertex( 0.5, -0.5,  0.5, 1.0, 0.0);
            let d = this.AddVertex(-0.5, -0.5,  0.5, 0.0, 0.0);

            this.VertexNormal(a, 0, -1, 0);
            this.VertexNormal(b, 0, -1, 0);
            this.VertexNormal(c, 0, -1, 0);
            this.VertexNormal(d, 0, -1, 0);



            this.AddTriangle(a,b,c);
            this.AddTriangle(a,c,d);
        }

        

    
    }

    MoveVertices(x,y,z)
    {
        for (let i = 0; i < this.vertices.length; i+=3)
        {
            this.vertices[i] += x;
            this.vertices[i+1] += y;
            this.vertices[i+2] += z;
        }
        this.flags |= VBOVERTEX;
    }
    MoveVertex(index, x,y,z)
    {
        let offset = index * 3;
        this.vertices[offset] += x;
        this.vertices[offset+1] += y;
        this.vertices[offset+2] += z;
        this.flags |= VBOVERTEX;
    }

    ChangeColor(r,g,b,a)
    {
        if (this.data & COLOR)
        {
            for (let i = 0; i < this.vertices.length; i+=4)
            {
                this.colors[i] = r;
                this.colors[i+1] = g;
                this.colors[i+2] = b;
                this.colors[i+3] = a;
            }
            this.flags |= VBOCOLOR;
        } else 
        {
            console.warn("Color not enabled");
        }
    }

    GetPosition(index)
    {
        let offset = index * 3;
        return new Vector3(this.vertices[offset], this.vertices[offset+1], this.vertices[offset+2]);
    }
    GetNormal(index)
    {
        if (this.data & NORMAL === 0) return undefined;
        let offset = index * 3;
        return new Vector3(this.normals[offset], this.normals[offset+1], this.normals[offset+2]);
    }
    GetColor(index)
    {
        if (this.data & COLOR === 0) return undefined;
        let offset = index * 4;
        return new Color(this.colors[offset], this.colors[offset+1], this.colors[offset+2], this.colors[offset+3]);
    }

    GetTexture(index, layer=0)
    {
        let offset = index * 2;
        if (layer === 0)
        {
            if (this.data & TEXTURE0 === 0) return undefined;
            return new Vector2(this.texcoord0[offset], this.texcoord0[offset+1]);
        } else
        {
            if (this.data & TEXTURE1 === 0) return undefined;
            return new Vector2(this.texcoord1[offset], this.texcoord1[offset+1]);
        }

    }
    GetIndice(index)
    {
        this.indices[index];
    }

    SetIndices(indices)
    {
        this.indices = indices;
        this.flags |= VBOINDEX;
    }

    GetFace(index, layer=0)
    {
        let offset = index * 3;
        return this.indices[offset+layer];
    }
    GetTotalVertices()
    {
        return this.vertices.length / 3;
    }
    GetTotalTriangles()
    {
        return this.indices.length / 3;
    }

    CalculateNormals()
    {
        if (this.data & NORMAL)
        {
        for (let i = 0; i < this.vertices.length; i++)
        {
            this.normals.push(0);
        }
        for (let i = 0; i < this.indices.length; i+=3)
        {
            let a = this.indices[i];
            let b = this.indices[i+1];
            let c = this.indices[i+2];
            let v1 = this.GetPosition(a);
            let v2 = this.GetPosition(b);
            let v3 = this.GetPosition(c);
            let normal =Vector3.Normalize(Vector3.Cross(Vector3.Sub(v2,v1), Vector3.Sub(v3,v1)));
            this.VertexNormal(a, normal.x, normal.y, normal.z);
            this.VertexNormal(b, normal.x, normal.y, normal.z);
            this.VertexNormal(c, normal.x, normal.y, normal.z);
        }
        this.flags |= VBONORMAL;
        }else 
        {
            console.warn("Normals not enabled");
        }

    }
    CalculateSmothNormals()
    {   
        if (this.data & NORMAL)
        {
        let normals = [];
        for (let i = 0; i < this.vertices.length; i++)
        {
            normals.push(new Vector3(0,0,0));
        }
        for (let i = 0; i < this.indices.length; i+=3)
        {
            let a = this.indices[i];
            let b = this.indices[i+1];
            let c = this.indices[i+2];
            let v1 = this.GetPosition(a);
            let v2 = this.GetPosition(b);
            let v3 = this.GetPosition(c);
            let normal = Vector3.Normalize(Vector3.Cross(Vector3.Sub(v2,v1), Vector3.Sub(v3,v1)));
            normals[a] = Vector3.Add(normals[a], normal);
            normals[b] = Vector3.Add(normals[b], normal);
            normals[c] = Vector3.Add(normals[c], normal);
        }
        for (let i = 0; i < normals.length; i++)
        {
            let normal = Vector3.Normalize(normals[i]);
            this.VertexNormal(i, normal.x, normal.y, normal.z);
        }
        this.flags |= VBONORMAL;
      }else 
        {
            console.warn("Normals not enabled");
        }

    }

    CalculateBoudingBox()
    {
        let min = new Vector3(999999,999999,999999);
        let max = new Vector3(-999999,-999999,-999999);
        for (let i = 0; i < this.vertices.length; i+=3)
        {
            let x = this.vertices[i];
            let y = this.vertices[i+1];
            let z = this.vertices[i+2];
            if (x<min.x) min.x = x;
            if (y<min.y) min.y = y;
            if (z<min.z) min.z = z;
            if (x>max.x) max.x = x;
            if (y>max.y) max.y = y;
            if (z>max.z) max.z = z;
        }
        this.box.min = min;
        this.box.max = max;
    }

}


class Mesh
{
    constructor()
    {
        this.surfaces = [];
        this.materials = [];
        this.box = new BoundingBox();
    }
    AddSurface(surface)
    {
        this.surfaces.push(surface);
    }
    AddMaterial(material)
    {
        if (this.ContainsMaterial(material)) return;
        this.materials.push(material);
    }
    CalculateBoudingBox()
    {
        for (let i = 0; i < this.surfaces.length; i++)
        {
            this.surfaces[i].CalculateBoudingBox();
            mesh.box.addBox(surf.box);
        }
    }

    Render()
    {
        Core.UseShader();
        for (let i = 0; i < this.surfaces.length; i++)
        {
            let material = this.materials[this.surfaces[i].materialIndex];
            Core.UseMaterial(material);
            this.surfaces[i].Render();
           
        }
    }

    Draw()
    {
    
        for (let i = 0; i < this.surfaces.length; i++)
        {
            this.surfaces[i].Render();
        }
    }

    GetMaterial(index)
    {
        return this.materials[index];
    }
    MakePlanarMapping(resolution)
    {
        for (let i = 0; i < this.surfaces.length; i++)
        {
            this.surfaces[i].MakePlanarMapping(resolution);
        }
    }
    CalculateNormals(smoth=false)
    {
        for (let i = 0; i < this.surfaces.length; i++)
        {
            if (smoth) this.surfaces[i].CalculateSmothNormals(); else   this.surfaces[i].CalculateNormals();
        }
    }
    ContainsMaterial(material)
    {
        for (let i = 0; i < this.materials.length; i++)
        {
            if (this.materials[i].shaderName === material.shaderName) return true;
        }
        return false;
    }

    CreateSurface(materialIndex,dynamic=false)
    {
        let material = this.materials[materialIndex];
        let surface = new Surface(material.attributes, dynamic);
        surface.materialIndex = materialIndex;
        this.AddSurface(surface);
        return surface;
    }


    static CreateCube(size, material)
    {
            let mesh = new Mesh();
            mesh.AddMaterial(material);

            let surf =  mesh.CreateSurface(0, false);

           surf.AddVertex(0, 0, 0, 0.0, 1.0);
           surf.AddVertex(1, 0, 0, 1.0, 1.0);

       
           surf.AddVertex(1, 1, 0, 1.0, 0.0);
           surf.AddVertex(0, 1, 0, 0.0, 0.0);

         

           surf.AddVertex(1, 0, 1, 0.0, 1.0);
           surf.AddVertex(1, 1, 1, 0.0, 0.0);

   

           surf.AddVertex(0, 1, 1, 1.0, 0.0);
           surf.AddVertex(0, 0, 1, 1.0, 1.0);

 
        
           surf.AddVertex(0, 1, 1, 0.0, 1.0);
           surf.AddVertex(0, 1, 0, 1.0, 1.0);

   
        
           surf.AddVertex(1, 0, 1, 1.0, 0.0);
           surf.AddVertex(1, 0, 0, 0.0, 0.0);

         
           let indices = [ 0,2,1,   0,3,2,   
            1,5,4,   1,2,5,   
            4,6,7,   4,5,6,        
            7,3,0,   7,6,3,   
            9,5,2,   9,8,5,   
            0,11,10,   0,10,7];

            surf.SetIndices(indices);
            
            
            for (let i = 0; i < 12; ++i)
            {
                let v = surf.GetPosition(i);
                v.x -= 0.5;
                v.y -= 0.5;
                v.z -= 0.5;
              
            

                surf.VertexPosition(i, v.x * size, v.y * size, v.z * size);
                
            }


            mesh.CalculateNormals(true);
            mesh.box.addBox(surf.box);
            surf.Update();

            return mesh;

      
    }
    static CreatePlane(stacks, slices, tilesX,tilesY,material)
    {
        let mesh = new Mesh();
        mesh.AddMaterial(material);
        let surf = mesh.CreateSurface(0, false);

        let center = new Vector3(0,0,0);
        let count =0;

        for (let i = 0; i <= stacks; ++i)
        {
            let y = i / stacks * tilesY;
            for (let j = 0; j <= slices; ++j)
            {
                let x = j / slices * tilesX;

                if (x>center.x) center.x = x;
                if (y>center.z) center.z = y;
                if (x<center.x) center.x = x;
                if (y<center.z) center.z = y;


                count = surf.AddVertex(x, 0, y, x, y);
            }
        }

        for (let i = 0; i <= count; i++)
        {
            let v = surf.GetPosition(i);
            v.x -= center.x * 0.5;
            v.z -= center.z * 0.5;
            surf.VertexPosition(i, v.x, v.y, v.z);
            surf.VertexNormal(i, 0, 1, 0);
            
        }

        for (let i = 0; i < stacks; ++i)
        {
            for (let j = 0; j < slices; ++j)
            {
                let index = (slices + 1) * i + j;
                surf.AddTriangle(index, index + slices + 1, index + slices + 2);
                surf.AddTriangle(index, index + slices + 2, index + 1);
            }
        }
        mesh.CalculateNormals(true);
        mesh.box.addBox(surf.box);
         
        surf.Update();
        return mesh;

    }
    static CreateSphere(stacks, slices, material)
    {

        let mesh = new Mesh();
        mesh.AddMaterial(material);
        let surf = mesh.CreateSurface(0, false);
        let pi = 3.14159265359;
     
        for (let i = 0; i <= stacks; ++i)
        {
            let phi = i * pi / stacks;
            for (let j = 0; j <= slices; ++j)
            {
                let theta = j * 2.0 * pi / slices;
                let x = Math.sin(phi) * Math.cos(theta);
                let y = Math.cos(phi);
                let z = Math.sin(phi) * Math.sin(theta);
                let u = j / slices;
                let v = i / stacks;
                surf.AddVertex(x, y, z, u, v);
            }
        }

        for (let i = 0; i < stacks; ++i)
        {
            for (let j = 0; j < slices; ++j)
            {
                let index = (slices + 1) * i + j;
                surf.AddTriangle(index, index + slices + 2, index + slices + 1); 
                surf.AddTriangle(index, index + 1, index + slices + 2);           
            }
        }
        mesh.CalculateNormals(true);
        mesh.box.addBox(surf.box);
        surf.Update();
        return mesh;

    }
    static CreateCylinder(stacks, slices, material)
    {
        let mesh = new Mesh();
        mesh.AddMaterial(material);
        let surf = mesh.CreateSurface(0, false);
        let topSurfaceStartIndex = 0;

        const pi = 3.14159265359;
        const stackHeight = 1.0 / stacks;
        const sliceAngle = 2.0 * pi / slices;

        for (let i = 0; i <= stacks; ++i)
         {
            let y = -0.5 + i * stackHeight;
            for (let j = 0; j <= slices; ++j) 
            {
                let x = Math.cos(j * sliceAngle);
                let z = Math.sin(j * sliceAngle);
                surf.AddVertex(x, y, z, j / slices, i / stacks);
            }
        }

        for (let i = 0; i < stacks; ++i)
        {
            for (let j = 0; j < slices; ++j)
            {
                let index = (slices + 1) * i + j;
                surf.AddTriangle(index, index + slices + 1, index + slices + 2);
                surf.AddTriangle(index, index + slices + 2, index + 1);
            }
        }

        topSurfaceStartIndex = surf.GetTotalVertices();

        surf.AddVertex(0.0, 0.5, 0.0, 0.5, 0.5); // Vértice do topo

        for (let i = 0; i <= slices; ++i)
        {
            let x = Math.cos(i * sliceAngle);
            let z = Math.sin(i * sliceAngle);
            surf.AddVertex(x, 0.5, z, 0.5 * (x + 1.0), 0.5 * (z + 1.0));
        }

        for (let i = 0; i < slices; ++i)
        {
           // surf.AddTriangle(topSurfaceStartIndex, topSurfaceStartIndex + i + 1, topSurfaceStartIndex + (i + 1) % slices + 1);
            surf.AddTriangle(topSurfaceStartIndex, topSurfaceStartIndex + (i + 1) % slices + 1, topSurfaceStartIndex + i + 1);
        }

        let bottomSurfaceStartIndex = surf.GetTotalVertices();

        surf.AddVertex(0.0, -0.5, 0.0, 0.5, 0.5); // Vértice da base

        for (let i = 0; i <= slices; ++i)
        {
            let x = Math.cos(i * sliceAngle);
            let z = Math.sin(i * sliceAngle);
            surf.AddVertex(x, -0.5, z, 0.5 * (x + 1.0), 0.5 * (z + 1.0));
        }

        for (let i = 0; i < slices; ++i)
        {
            //surf.AddTriangle(bottomSurfaceStartIndex, bottomSurfaceStartIndex + (i + 1) % slices + 1, bottomSurfaceStartIndex + i + 1);
            surf.AddTriangle(bottomSurfaceStartIndex, bottomSurfaceStartIndex + i + 1, bottomSurfaceStartIndex + (i + 1) % slices + 1);

        }
        mesh.CalculateNormals(true);
        mesh.box.addBox(surf.box);
        surf.Update();
    


        return mesh;
    }
    static CreateCone(stacks, slices, material)
    {
        let mesh = new Mesh();
        mesh.AddMaterial(material);
        const pi = 3.14159265359;
        const stackHeight = 1.0 / stacks;
        const sliceAngle = 2.0 * pi / slices;
        let surf = mesh.CreateSurface(0, false);
        for (let i = 0; i <= stacks; ++i) 
        {
            let y = -0.5 + i * stackHeight;
            let radius = 0.5 - y; // Reduzir o raio à medida que subimos o cone
            for (let j = 0; j <= slices; ++j) 
            {
                let x = radius * Math.cos(j * sliceAngle);
                let z = radius * Math.sin(j * sliceAngle);
                surf.AddVertex(x, y, z, j / slices, i / stacks);
            }
        }
        
        for (let i = 0; i < stacks; ++i) 
        {
            for (let j = 0; j < slices; ++j) 
            {
                let index = (slices + 1) * i + j;
                surf.AddTriangle(index,
                index + slices + 1,
                index + slices + 2);

                surf.AddTriangle(index,
                index + slices + 2,
                index + 1);
            }
        }

        //floor

        let baseStartIndex = surf.GetTotalVertices();
        let yBottom = -0.5;
        surf.AddVertex(0.0, yBottom, 0.0, 0.5, 0.5); // Vértice central da base

        for (let i = 0; i <= slices; ++i)
        {
            let x = Math.cos(i * sliceAngle);
            let z = Math.sin(i * sliceAngle);
            surf.AddVertex(x, yBottom, z, 0.5 * (x + 1.0), 0.5 * (z + 1.0));
        }

        for (let i = 0; i < slices; ++i)
        {
            surf.AddTriangle(baseStartIndex,
            baseStartIndex + i + 1,
            baseStartIndex + (i + 1) % slices + 1);
        }
        mesh.CalculateNormals(true);
        mesh.box.addBox(surf.box);
        surf.Update();
        return mesh;
    

    }

    static CreateTorus(stacks, slices, innerRadius, outerRadius, material)
    {
        let mesh = new Mesh();
        mesh.AddMaterial(material);
        const pi = 3.14159265359;
        const stackAngle = 2.0 * pi / stacks;
        const sliceAngle = 2.0 * pi / slices;
        let surf = mesh.CreateSurface(0, false);

        
        for (let i = 0; i <= stacks; ++i) 
        {
            let u = i * stackAngle;
            for (let j = 0; j <= slices; ++j) 
            {
                let v = j * sliceAngle;
                let x = (outerRadius + innerRadius * Math.cos(v)) * Math.cos(u);
                let y = (outerRadius + innerRadius * Math.cos(v)) * Math.sin(u);
                let z = innerRadius * Math.sin(v);
                let textureU = i / stacks;
                let textureV = j / slices;
                surf.AddVertex(x, y, z, textureU, textureV);
            }
        }

        for (let i = 0; i < stacks; ++i) 
        {
            for (let j = 0; j < slices; ++j) 
            {
                let index = (slices + 1) * i + j;
                surf.AddTriangle(index,
                index + slices + 1,
                index + slices + 2);
                surf.AddTriangle(index,
                index + slices + 2,
                index + 1);
            }
        }
        mesh.CalculateNormals(true);
        mesh.box.addBox(surf.box);
        surf.Update();
        return mesh;
    

    }
    LoadOBJ(data, material)
    {
       this.AddMaterial(material);
        let surf = this.CreateSurface(0, false);
        let lines = data.split("\n");
        let vertices = [];
        let normals = [];
        let texcoord = [];

        let generateNormals =true;
        let generateTexcoord = true;
      

        const addTriangle = (vertices,normals,texcoord,a,b,c) =>
        {
                    const data_a = a.split("/");
                    const data_b = b.split("/");
                    const data_c = c.split("/");

                    let vertID_a = parseInt(data_a[0]) - 1;
                    let vertID_b = parseInt(data_b[0]) - 1;
                    let vertID_c = parseInt(data_c[0]) - 1;

                    let hasNormals = normals.length > 0;
                    let hasTexcoord = texcoord.length > 0;

                    if (vertID_a < 0) vertID_a+=vertices.length;
                    if (vertID_b < 0) vertID_b+=vertices.length;
                    if (vertID_c < 0) vertID_c+=vertices.length;
                    
                    let v_a = vertices[vertID_a];
                    let v_b = vertices[vertID_b];
                    let v_c = vertices[vertID_c];

                    let n_a = new Vector3(0,0,0);
                    let n_b = new Vector3(0,0,0);
                    let n_c = new Vector3(0,0,0);

                    let uv_a = new Vector2(0,0);
                    let uv_b = new Vector2(0,0);
                    let uv_c = new Vector2(0,0);

                    if (hasNormals)
                    {
                        let normID_a = parseInt(data_a[2]) - 1;
                        let normID_b = parseInt(data_b[2]) - 1;
                        let normID_c = parseInt(data_c[2]) - 1;
                        if (normID_a < 0) normID_a+=normals.length;
                        if (normID_b < 0) normID_b+=normals.length;
                        if (normID_c < 0) normID_c+=normals.length;
                        n_a = normals[normID_a];
                        n_b = normals[normID_b];
                        n_c = normals[normID_c];
                        generateNormals = false;
                    }

                    if (hasTexcoord)
                    {
                        let texID_a = parseInt(data_a[1]) - 1;
                        let texID_b = parseInt(data_b[1]) - 1;
                        let texID_c = parseInt(data_c[1]) - 1;
                        if (texID_a < 0) texID_a+=texcoord.length;
                        if (texID_b < 0) texID_b+=texcoord.length;
                        if (texID_c < 0) texID_c+=texcoord.length;
                        uv_a = texcoord[texID_a];
                        uv_b = texcoord[texID_b];
                        uv_c = texcoord[texID_c];

                        generateTexcoord = false;
                    }
                    if (!v_a ) 
                    {
                        console.warn("Invalid vertex a index",data_a);
                        console.log(v_a);
                       return;

                    }

                    if (!v_b )

                    {
                        console.warn("Invalid vertex b index",data_b);
                        console.log(v_b);
                        return;
                    }

                    if (!v_c )
                    {
                        console.warn("Invalid vertex c index",data_c);
                        console.log(v_c);
                        return;
                    }

                    let index_a = surf.AddVertex(v_a.x, v_a.y, v_a.z, uv_a.x, uv_a.y);
                    let index_b = surf.AddVertex(v_b.x, v_b.y, v_b.z, uv_b.x, uv_b.y);
                    let index_c = surf.AddVertex(v_c.x, v_c.y, v_c.z, uv_c.x, uv_c.y);

                    if (hasNormals)
                    {
                        surf.VertexNormal(index_a, n_a.x, n_a.y, n_a.z);
                        surf.VertexNormal(index_b, n_b.x, n_b.y, n_b.z);
                        surf.VertexNormal(index_c, n_c.x, n_c.y, n_c.z);
                    }

                    surf.AddTriangle(index_a, index_b, index_c);



        }

        for (let i = 0; i < lines.length; i++)
        {
            let line = lines[i].trim();
          //  let tokens = line.split(" ");
            let tokens = line.split(/\s+/);
            if (tokens[0] === "v")
            {
                let v = new Vector3(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
                vertices.push(v);
      
            } else 
            if (tokens[0] === "vn")
            {
                let n = new Vector3(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
                normals.push(n);
            
            } else 
            if (tokens[0] === "vt")
            {
                let uv = new Vector2(parseFloat(tokens[1]), parseFloat(tokens[2]));
                texcoord.push(uv);
            } else 
            if (tokens[0] === "f")
            {

               
                if (tokens.length===4) //triangulo
                {   
                   

                    if (tokens[1] === "") continue;
                    if (tokens[2] === "") continue;
                    if (tokens[3] === "") continue;
                    
                    addTriangle(vertices,normals,texcoord,tokens[1],tokens[2],tokens[3]);

                } else 
                if (tokens.length===5) //quads
                {
                 
                    if (tokens[1] === "") continue;
                    if (tokens[2] === "") continue;
                    if (tokens[3] === "") continue;
                    if (tokens[4] === "") continue;

                    addTriangle(vertices,normals,texcoord,tokens[1],tokens[2],tokens[3]);
                    addTriangle(vertices,normals,texcoord,tokens[1],tokens[3],tokens[4]);
                }

              
            }
        }


        if (generateNormals)   surf.CalculateNormals(true);
        if (generateTexcoord)  surf.MakePlanarMapping(0.5);
    

        this.box.addBox(surf.box);
        surf.Update();
        return this;

    }
}


class SkyBox 
{
    constructor()
    {
        this.material = new SkyBoxMaterial();
        this.mesh = Mesh.CreateCube(100.0, this.material);

    }
    SetTexture(texture)
    {
        this.material.SetTexture(texture);
    }
 
    
    Render()
    {
        let shader = Core.GetShader("skybox");
        Core.SetShader(shader);
        Core.SetCullFace(false);
        Core.SetDepthFunc(gl.LEQUAL);
        this.mesh.Render();
        Core.SetCullFace(true);
        Core.SetDepthFunc(gl.LESS);

    }

}

class InstanceMesh
{
    constructor(material)
    {
        this.normals   = [];
        this.vertices  = [];
        this.positions = [];
        this.indices   = [];
        this.texcoord  = [];
        this.vbo = [];
        this.numVertex = 0;
        this.material  = material;
        this.isBuild   = false;
        this.isDirty   = false;
        this.Init();
    }

    SetTexture(texture)
    {
        this.material.SetTexture(texture);
    }

    GetVertexPosition(index)
    {
        index = index * 3;
        return new Vector3(this.vertices[index], this.vertices[index+1], this.vertices[index+2]);
    }

    SetVertexPosition(index, x, y, z)
    {
        index = index * 3;
        this.vertices[index] = x;
        this.vertices[index+1] = y;
        this.vertices[index+2] = z;
        this.isBuild = false;
    }


    Init()
    {
      
        this.vbo[0] = gl.createBuffer();
        this.vbo[1] = gl.createBuffer();
        this.vbo[2] = gl.createBuffer();


        this.vao = gl.createVertexArray();
      
        gl.bindVertexArray(this.vao);
        this.ebo =  gl.createBuffer();
      
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[0]);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); //vertex position

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[1]);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);//texture



        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[2]);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);//instance position
        gl.vertexAttribDivisor(2,1);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
      
        gl.bindVertexArray(null);      
    }

    Add(x,y,z)
    {
        this.positions.push(x);
        this.positions.push(y);
        this.positions.push(z);
        this.isDirty = true;
    }
    AddVertex(x,y,z,u,v)
    {
        this.numVertex++;
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);

        this.texcoord.push(u);
        this.texcoord.push(v);

        // this.normals.push(nx);
        // this.normals.push(ny);
        // this.normals.push(nz);

        this.isBuild = false;

        return this.numVertex-1;
    }

    AddTriangle(a,b,c)
    {
        this.indices.push(a);
        this.indices.push(b);
        this.indices.push(c);
        this.isBuild = false;
    }

    BuildCube(size) 
    {
        this.AddVertex(0, 0, 0, 0.0, 1.0);
        this.AddVertex(1, 0, 0, 1.0, 1.0);
     
        this.AddVertex(1, 1, 0, 1.0, 0.0);
        this.AddVertex(0, 1, 0, 0.0, 0.0);
     
        this.AddVertex(1, 0, 1, 0.0, 1.0);
        this.AddVertex(1, 1, 1, 0.0, 0.0);
     
        this.AddVertex(0, 1, 1, 1.0, 0.0);
        this.AddVertex(0, 0, 1, 1.0, 1.0);
     
        this.AddVertex(0, 1, 1, 0.0, 1.0);
        this.AddVertex(0, 1, 0, 1.0, 1.0);
     
        this.AddVertex(1, 0, 1, 1.0, 0.0);
        this.AddVertex(1, 0, 0, 0.0, 0.0);
      
        this.indices = [ 0,2,1,   0,3,2,   
         1,5,4,   1,2,5,   
         4,6,7,   4,5,6,        
         7,3,0,   7,6,3,   
         9,5,2,   9,8,5,   
         0,11,10,   0,10,7];

    
         
         
         for (let i = 0; i < 12; ++i)
         {
             let v = this.GetVertexPosition(i);
             v.x -= 0.5;
             v.y -= 0.5;
             v.z -= 0.5;
             this.SetVertexPosition(i, v.x * size, v.y * size, v.z * size);
             
         }

        this.Update();
    }
    Update()
    {
        if (!this.isBuild)
        {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[0]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[1]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoord), gl.STATIC_DRAW);



                if (this.positions.length!==0)
                {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[2]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

                this.isBuild = true;
                this.isDirt=false;
        }

        if (this.isDirty)
        {
            if (this.positions.length!==0)
            {
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[2]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
            this.isDirty = false;
            }
        }

    }

    Clear()
    {
        this.positions = [];
        this.isDirty = true;
    }
  
    Render()
    {
        this.Update();
        this.material.Set();
        gl.bindVertexArray(this.vao);
        gl.drawElementsInstanced(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0, this.positions.length / 3);
        gl.bindVertexArray(null);
        this.material.UnSet();
      
    }
}