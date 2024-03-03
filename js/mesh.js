
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



class Material
{
    constructor()
    {
        this.textures=[];
        this.color = new Color(1,1,1,1);
        this.shaderName="solid";
        this.attributes = [POSITION,COLOR];
    }
    Set()
    {
        let shader = Renderer.GetShader(this.shaderName);
        Renderer.SetShader(shader);

        Renderer.SetCullFace(true);
        Renderer.SetDepthFunc(gl.LESS);
        return shader;
    }
    UnSet()
    {
        
    }
}

class TextureMaterial extends Material
{
    constructor(texture=null)
    {
        super();
        this.texture = texture;
        this.shaderName = "texture";
        this.attributes = [POSITION,TEXTURE0,COLOR];
    }
    SetTexture(texture)
    {
        this.texture = texture;
        return this;
    }
    Set()
    {
         let s = super.Set();
         if (this.texture !== null && this.texture !== undefined)
         Renderer.SetTexture(this.texture);
         return s;
    }
}

class SkyBoxMaterial extends Material
{
    constructor()
    {
        super(null);
       
        this.shaderName = "skybox";
        this.attributes = [POSITION];
    }
    SetTexture(texture)
    {
        this.texture = texture;
        return this;
    }
    Set()
    {

        let shader = super.Set();
      
        shader.SetInteger("cubeTexture", 0);
        Renderer.SetCullFace(false);
        Renderer.SetDepthFunc(gl.LEQUAL);
        if (this.texture !== null && this.texture !== undefined)
        {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture.id);
        }
        return shader;
    }
    UnSet()
    {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}

class AmbientMaterial extends TextureMaterial
{
    constructor(texture)
    {
        super(texture);
        this.texture = texture;
        this.shaderName = "ambient";
        this.attributes = [POSITION,TEXTURE0,NORMAL];
 
    }
 
    Set()
    {
        let shader = super.Set();
     
        shader.SetFloat("light.intensity", Renderer.light.intensity);
        shader.SetUniform3f("light.color", Renderer.light.color.r,Renderer.light.color.g,Renderer.light.color.b);
        shader.SetUniform3f("light.ambient", Renderer.light.ambient.r,Renderer.light.ambient.g,Renderer.light.ambient.b);
        shader.SetUniform3f("light.position",  Renderer.light.position.x, Renderer.light.position.y, Renderer.light.position.z);

        shader.SetInteger("uTexture0", 0);

        return shader;
    }
}

class DiffuseMaterial extends Material
{
    constructor()
    {
        super();
        this.shaderName = "DIFFUSE";
        this.attributes = [POSITION,TEXTURE0,NORMAL];
        this.ambient = new Color(1.0, 0.5, 0.31);
        this.diffuse = new Color(1.0, 0.5, 0.31);
        this.specular = new Color(0.5, 0.5, 0.5);
        this.shininess = 32;
    }
    Set()
    {
        super.Set();
        let shader = Renderer.GetShader(this.shaderName);
        Renderer.SetShader(shader);
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
                    console.log("Position");
    
                    offset += 3;
                } else
                if (attribute === NORMAL)
                {
                    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
                    console.log("Normal");

                    this.data |= NORMAL;     
                    this.normals    = [];
                    offset += 3;
                } else
                if (attribute === COLOR)
                {
                    gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0);
                    console.log("Color");   
                    this.colors     = [];
                    this.data  |= COLOR;
                    offset += 4;
                } else
                if (attribute === TEXTURE0)
                {
                    gl.vertexAttribPointer(index, 2, gl.FLOAT, false, 0, 0);
                    console.log("Texture0");
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
                    console.log("update Tangent");
                }
            } else
            if (attribute === BITANGENT)
            {
                if (this.flags & VBOBITANGENT)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[index]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bitangents), state);
                    this.flags &= ~VBOBITANGENT;
                    console.log("update Bitangent");
                }
            }
        
        }


        if (this.flags & VBOINDEX)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), state);
            this.flags &= ~VBOINDEX;
            console.log("update Indices");
        }
        this.flags = 0;
    }

    Render()
    {
        if (this.indices.length === 0) return;
        if (this.flags !== 0) this.Update();
        let count = this.indices.length;
        gl.bindVertexArray(this.vao);
        //gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        Renderer.DrawElements(gl.TRIANGLES, count,  0);

        gl.bindVertexArray(null);
    }

    AddVertex(x,y,z,u=0.0,v=0.0)
    {
        this.no_verts++;
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);
        this.flags |= VBOVERTEX;

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
        if (this.data & NORMAL === 0) return;
        this.normals[index*3] = x;
        this.normals[index*3+1] = y;
        this.normals[index*3+2] = z;
        this.flags |= VBONORMAL;
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
        if (this.data & NORMAL === 0) return;
        let offset = index * 3;
        this.normals[offset] = x;
        this.normals[offset+1] = y;
        this.normals[offset+2] = z;
        this.flags |= VBONORMAL;
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

}


class Mesh
{
    constructor()
    {
        this.surfaces = [];
        this.materials = [];
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
    Render()
    {
        for (let i = 0; i < this.surfaces.length; i++)
        {
            let material = this.materials[this.surfaces[i].materialIndex];
            material.Set();
            this.surfaces[i].Render();
            material.UnSet();
        }
    }
    GetMaterial(index)
    {
        return this.materials[index];
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
        surf.Update();
        return mesh;
    

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
        Renderer.SetCullFace(false);
        Renderer.SetDepthFunc(gl.LEQUAL);
        this.mesh.Render();
        Renderer.SetCullFace(true);
        Renderer.SetDepthFunc(gl.LESS);

    }

}