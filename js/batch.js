

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
class Batch 
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
        this.depth=0;
        this.clip = new Rectangle(0, 0, Core.GetWidth(), Core.GetHeight());
        this.useClip = false;
   
        this.transform = new Matrix4();
 
        this.stack = [new Matrix4()];
   
 
        this.UseTransform = false;
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

    PointInView(x, y)
    {
        if (this.useClip)
        {
            return this.clip.contains(x, y);
        }
        return true;
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
    PushMatrix()
    {
        this.UseTransform = true;
        let top = this.stack[this.stack.length - 1].clone();
        this.stack.push(top);
    }
    PopMatrix()
    {
        this.UseTransform = false;   
        if (this.stack.length > 1) 
        {
            this.stack.pop();
        } else 
        {
            console.error("A pilha de matrizes não pode ficar vazia.");
        }
    }
    Identity()
    {
        this.stack[this.stack.length - 1].identity();
    }
    Scale(x, y, z)
    {
        let mat = Matrix4.Scale(x, y, z);
        this.stack[this.stack.length - 1] = Matrix4.Multiply(mat,this.stack[this.stack.length - 1]);
    }
    Translate(x, y, z)
    {
        let mat = Matrix4.Translate(x, y, z);
        this.stack[this.stack.length - 1] = Matrix4.Multiply(mat,this.stack[this.stack.length - 1]);
    }
    Rotate(angle, x, y, z)
    {
        let mat = Matrix4.Rotate(angle, x, y, z);
        this.stack[this.stack.length - 1] = Matrix4.Multiply(mat,this.stack[this.stack.length - 1]);
    }
 
    GetTopMatrix() 
    {
        return this.stack[this.stack.length - 1];
    }

    Vertex3f(x, y, z)
    {

        let tx =x;
        let ty =y;
        let tz =z;

        if (this.UseTransform)
        {
            if (this.stack.length > 0) 
            {

                 this.transform.copy(this.GetTopMatrix());
                 let m = this.transform.m;
               
                  tx =  m[0] * x + m[4] * y + m[8]  * z + m[12];
                  ty =  m[1] * x + m[5] * y + m[9]  * z + m[13];
                  tz =  m[2] * x + m[6] * y + m[10] * z + m[14];
             }
        }
      
     
        this.vertices[this.indexCount++] = tx;
        this.vertices[this.indexCount++] = ty;
        this.vertices[this.indexCount++] = tz;
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
    Clear()
    {

        this.vertices.fill(0);
              
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      

        this.indexCount = 0;
        this.vertexCount = 0;
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
        
        let shader = Core.GetShader("solid");
        Core.SetShader(shader);
        this.Flush();   
    }

    Flush()
    {
        this.indexCount = 0;
        this.vertexCount = 0;
    }
}
//********************************************************************************************************************************************/
class LineBatch extends Batch
{
  
    constructor(maxVertex)
    {
        super(maxVertex);
        this.showCapLines = false;
    }
    Flush()
    {
     
        if (this.indexCount === 0) return;

     

       
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.indexCount));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      




        let count =this.vertexCount;

   
        gl.bindVertexArray(this.VAO);
 
        Core.DrawArrays(LINES, 0, count);

        gl.bindVertexArray(null);

        super.Flush();
       
    }

    Line3D(x1, y1, z1, x2, y2, z2)
    {
        this.Vertex3f(x1, y1, z1);
        this.Vertex3f(x2, y2, z2);
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
    
    


Line(x0, y0, x1, y1)
{
   

        if (this.useClip)
        {
            
            let xmin = this.clip.x;	
            let xmax = this.clip.x + this.clip.width;
            let ymin = this.clip.y;
            let ymax = this.clip.y + this.clip.height;

            let t0 = 0;
            let t1 = 1;

            let dx = x1 - x0;
            let dy = y1 - y0;

            let accept = true;

            if (dx !== 0) 
            {
                let tMin = (xmin - x0) / dx;
                let tMax = (xmax - x0) / dx;

                if (tMin > tMax) 
                {
                    let temp = tMin;
                    tMin = tMax;
                    tMax = temp;
                }

                if (tMin > t0) t0 = tMin;
                if (tMax < t1) t1 = tMax;

                if (t0 > t1) accept = false;
            } else if (x0 < xmin || x0 > xmax)
             {
                accept = false;
            }

            if (accept && dy !== 0) 
            {
                let tMin = (ymin - y0) / dy;
                let tMax = (ymax - y0) / dy;

                if (tMin > tMax) 
                {
                    let temp = tMin;
                    tMin = tMax;
                    tMax = temp;
                }

                if (tMin > t0) t0 = tMin;
                if (tMax < t1) t1 = tMax;

                if (t0 > t1) accept = false;
            } else if (y0 < ymin || y0 > ymax) 
            {
                accept = false;
            }

            if (accept) 
            {
                let x0Clip = x0 + t0 * dx;
                let y0Clip = y0 + t0 * dy;
                let x1Clip = x0 + t1 * dx;
                let y1Clip = y0 + t1 * dy;

                this.Vertex2f(x0Clip, y0Clip);
                this.Vertex2f(x1Clip, y1Clip);
            }

     
    } else 
    {
        this.Vertex2f(x0, y0);
        this.Vertex2f(x1, y1);
    }           

   
}


CircleSector(x, y, radius, startAngle, endAngle,  segments)
{
    if (radius <= 0.0) radius = 0.1;
    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/radius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;
   


    
    if (this.showCapLines)
    {
    this.Line(x, y, x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }

    for (let i = 0; i < segments; i++)
    {
        this.Line(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius, x + Math.sin(DEG2RAD*(angle + stepLength))*radius, y + Math.cos(DEG2RAD*(angle + stepLength))*radius);
        angle += stepLength;
    }
    if(this.showCapLines)
    {
       this.Line(x, y, x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }

}

Circle(x, y, radius)
{
    this.CircleSector(x, y, radius, 0, 360, 18);

}
Ring(x, y, innerRadius, outerRadius, startAngle, endAngle,  segments)
{
    if (startAngle == endAngle) return;

    if (outerRadius < innerRadius)
    {
        let tmp = outerRadius;
        outerRadius = innerRadius;
        innerRadius = tmp;

        if (outerRadius <= 0.0) outerRadius = 0.1;
    }

    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/outerRadius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    if (innerRadius <= 0.0)
    {
        this.CircleSector(x, y, outerRadius, startAngle, endAngle, segments);
        return;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;


 
    if (this.showCapLines)
    {
  
        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);
    }

    for (let i = 0; i < segments; i++)
    {
    
        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, 
                  x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius);

    
        this.Line(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius,
                  x + Math.sin(DEG2RAD*(angle + stepLength))*innerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*innerRadius);

        angle += stepLength;
    }

    if (this.showCapLines)
    {

        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, 
                  x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);

    }

}


Ellipse(x, y, width, height)
{

    let segments = 36;
    let stepLength = 360/segments;
    let angle = 0;
    for (let i = 0; i < segments; i++)
    {
       this.Line(x + Math.sin(DEG2RAD*angle)*width, y + Math.cos(DEG2RAD*angle)*height,
                x + Math.sin(DEG2RAD*(angle + stepLength))*width, y + Math.cos(DEG2RAD*(angle + stepLength))*height);
        
        angle += stepLength;
    }       
}
RectangleFromTo(x, y,x2,y2)
{
    this.Line(x, y, x2, y);
    this.Line(x2, y, x2, y2);
    this.Line(x2, y2, x, y2);
    this.Line(x, y2, x, y);
}
Rectangle(x, y,width,height)
{

    let x0 = x;
    let y0 = y;
    let x1 = x + width;
    let y1 = y + height; 

    this.Line(x0, y0, x1, y0);
    this.Line(x1, y0, x1, y1);
    this.Line(x1, y1, x0, y1);
    this.Line(x0, y1, x0, y0);

}
Line(x0, y0, x1, y1)
{
   

        if (this.useClip)
        {
            
            let xmin = this.clip.x;	
            let xmax = this.clip.x + this.clip.width;
            let ymin = this.clip.y;
            let ymax = this.clip.y + this.clip.height;

            let t0 = 0;
            let t1 = 1;

            let dx = x1 - x0;
            let dy = y1 - y0;

            let accept = true;

            if (dx !== 0) 
            {
                let tMin = (xmin - x0) / dx;
                let tMax = (xmax - x0) / dx;

                if (tMin > tMax) 
                {
                    let temp = tMin;
                    tMin = tMax;
                    tMax = temp;
                }

                if (tMin > t0) t0 = tMin;
                if (tMax < t1) t1 = tMax;

                if (t0 > t1) accept = false;
            } else if (x0 < xmin || x0 > xmax)
             {
                accept = false;
            }

            if (accept && dy !== 0) 
            {
                let tMin = (ymin - y0) / dy;
                let tMax = (ymax - y0) / dy;

                if (tMin > tMax) 
                {
                    let temp = tMin;
                    tMin = tMax;
                    tMax = temp;
                }

                if (tMin > t0) t0 = tMin;
                if (tMax < t1) t1 = tMax;

                if (t0 > t1) accept = false;
            } else if (y0 < ymin || y0 > ymax) 
            {
                accept = false;
            }

            if (accept) 
            {
                let x0Clip = x0 + t0 * dx;
                let y0Clip = y0 + t0 * dy;
                let x1Clip = x0 + t1 * dx;
                let y1Clip = y0 + t1 * dy;

                this.Vertex2f(x0Clip, y0Clip);
                this.Vertex2f(x1Clip, y1Clip);
            }

     
    } else 
    {
        this.Vertex2f(x0, y0);
        this.Vertex2f(x1, y1);
    }           

   
}


CircleSector(x, y, radius, startAngle, endAngle,  segments)
{
    if (radius <= 0.0) radius = 0.1;
    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/radius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;
   


    
    if (this.showCapLines)
    {
    this.Line(x, y, x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }

    for (let i = 0; i < segments; i++)
    {
        this.Line(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius, x + Math.sin(DEG2RAD*(angle + stepLength))*radius, y + Math.cos(DEG2RAD*(angle + stepLength))*radius);
        angle += stepLength;
    }
    if(this.showCapLines)
    {
       this.Line(x, y, x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }

}

Circle(x, y, radius)
{
    this.CircleSector(x, y, radius, 0, 360, 18);

}
Ring(x, y, innerRadius, outerRadius, startAngle, endAngle,  segments)
{
    if (startAngle == endAngle) return;

    if (outerRadius < innerRadius)
    {
        let tmp = outerRadius;
        outerRadius = innerRadius;
        innerRadius = tmp;

        if (outerRadius <= 0.0) outerRadius = 0.1;
    }

    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/outerRadius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    if (innerRadius <= 0.0)
    {
        this.CircleSector(x, y, outerRadius, startAngle, endAngle, segments);
        return;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;


 
    if (this.showCapLines)
    {
  
        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);
    }

    for (let i = 0; i < segments; i++)
    {
    
        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, 
                  x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius);

    
        this.Line(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius,
                  x + Math.sin(DEG2RAD*(angle + stepLength))*innerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*innerRadius);

        angle += stepLength;
    }

    if (this.showCapLines)
    {

        this.Line(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius, 
                  x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);

    }

}


Ellipse(x, y, width, height)
{

    let segments = 36;
    let stepLength = 360/segments;
    let angle = 0;
    for (let i = 0; i < segments; i++)
    {
       this.Line(x + Math.sin(DEG2RAD*angle)*width, y + Math.cos(DEG2RAD*angle)*height,
                x + Math.sin(DEG2RAD*(angle + stepLength))*width, y + Math.cos(DEG2RAD*(angle + stepLength))*height);
        
        angle += stepLength;
    }       
}
RectangleFromTo(x, y,x2,y2)
{
    this.Line(x, y, x2, y);
    this.Line(x2, y, x2, y2);
    this.Line(x2, y2, x, y2);
    this.Line(x, y2, x, y);
}
Rectangle(x, y,width,height)
{

    let x0 = x;
    let y0 = y;
    let x1 = x + width;
    let y1 = y + height; 

    this.Line(x0, y0, x1, y0);
    this.Line(x1, y0, x1, y1);
    this.Line(x1, y1, x0, y1);
    this.Line(x0, y1, x0, y0);

}
Triangle(x0, y0, x1, y1, x2, y2) 
{
    this.Line(x0, y0, x1, y1);
    this.Line(x1, y1, x2, y2);
    this.Line(x2, y2, x0, y0);
}

Polygon(points) 
{
    const numPoints = points.length;
    for (let i = 0; i < numPoints; i++) 
    {
        const x0 = points[i][0];
        const y0 = points[i][1];
        const x1 = points[(i + 1) % numPoints][0];
        const y1 = points[(i + 1) % numPoints][1];
        this.Line(x0, y0, x1, y1);
    }
}
CircleArc(x, y, radius, startAngle, endAngle, segments) 
{
    if (radius <= 0.0) radius = 0.1;

    let stepLength = (endAngle - startAngle) / segments;
    let angle = startAngle;

    for (let i = 0; i < segments; i++) 
    {
        this.Line
        (
            x + Math.sin(DEG2RAD * angle) * radius,
            y + Math.cos(DEG2RAD * angle) * radius,
            x + Math.sin(DEG2RAD * (angle + stepLength)) * radius,
            y + Math.cos(DEG2RAD * (angle + stepLength)) * radius
        );
        angle += stepLength;
    }
}

Star(x, y, outerRadius, innerRadius, points) 
{
    const stepAngle = (2 * Math.PI) / (2 * points);
    let angle = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) 
    {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x0 = x + radius * Math.cos(angle);
        const y0 = y + radius * Math.sin(angle);
        angle += stepAngle;
        const x1 = x + radius * Math.cos(angle);
        const y1 = y + radius * Math.sin(angle);
        this.Line(x0, y0, x1, y1);
    }
}
Arrow(x0, y0, x1, y1, headSize) 
{
    this.Line(x0, y0, x1, y1);
    const angle = Math.atan2(y1 - y0, x1 - x0);
    const x2 = x1 - headSize * Math.cos(angle - Math.PI / 6);
    const y2 = y1 - headSize * Math.sin(angle - Math.PI / 6);
    const x3 = x1 - headSize * Math.cos(angle + Math.PI / 6);
    const y3 = y1 - headSize * Math.sin(angle + Math.PI / 6);
    this.Line(x1, y1, x2, y2);
    this.Line(x1, y1, x3, y3);
}

QuadraticBezierCurve(x0, y0, x1, y1, x2, y2,steps=100) 
{
    
    for (let t = 0; t <= 1; t += 1 / steps) 
    {
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
        this.Vertex2f(x, y);
    }
}
Grid(x, y, width, height, rows, columns) 
{
    const deltaX = width / columns;
    const deltaY = height / rows;
    for (let i = 0; i <= rows; i++) 
    {
        this.Line(x, y + i * deltaY, x + width, y + i * deltaY);
    }
    for (let j = 0; j <= columns; j++) 
    {
        this.Line(x + j * deltaX, y, x + j * deltaX, y + height);
    }
}
   


}
//********************************************************************************************************************************************/
class FillBatch extends Batch
{
constructor(maxVertex)
{
    super(maxVertex);

}


Flush()
{
 
    if (this.indexCount === 0) return;
    Core.SetBlend(true);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.indexCount));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
    let count =this.vertexCount;


    gl.bindVertexArray(this.VAO);

    Core.DrawArrays(TRIANGLES, 0, count);

    gl.bindVertexArray(null);

    super.Flush();
   
}
  


clipTriangle(x0, y0, x1, y1, x2, y2) 
{

     let xmin = this.clip.x;	
     let xmax = this.clip.x + this.clip.width;
     let ymin = this.clip.y;
     let ymax = this.clip.y + this.clip.height;

    if (x0 < xmin && x1 < xmin && x2 < xmin) return;
    if (x0 > xmax && x1 > xmax && x2 > xmax) return;
    if (y0 < ymin && y1 < ymin && y2 < ymin) return;
    if (y0 > ymax && y1 > ymax && y2 > ymax) return;

    if (x0< xmin)        {             x0 = xmin;        }
    if (x1 < xmin)        {            x1 = xmin;        }
    if (x2 < xmin)        {            x2 = xmin;        }
    if (x0 > xmax)        {            x0 = xmax;        }
    if (x1 > xmax)        {            x1 = xmax;        }
    if (x2 > xmax)        {            x2 = xmax;        }
    if (y0 < ymin)        {            y0 = ymin;        }
    if (y1 < ymin)        {            y1 = ymin;        }
    if (y2 < ymin)        {            y2 = ymin;        }
    if (y0 > ymax)        {            y0 = ymax;        }
    if (y1 > ymax)        {            y1 = ymax;        }
    if (y2 > ymax)        {            y2 = ymax;        }

       
    this.DrawTriangle(x0, y0, x1, y1, x2, y2);
    
}

DrawTriangle (x0, y0, x1, y1, x2, y2)
{
    
    this.Vertex2f(x0, y0);
    this.Vertex2f(x2, y2);
    this.Vertex2f(x1, y1);
 
   
}


Triangle(x0, y0, x1, y1, x2, y2) 
{

    if (this.useClip)
    {
        this.clipTriangle(x0, y0, x1, y1, x2, y2);
        return;
    }
    this.DrawTriangle(x0, y0, x1, y1, x2, y2);
   
   
}

Triangle3D(x0, y0,z0, x1, y1,z1, x2, y2, z2) 
{
    this.Vertex3f(x0, y0,z0);
    this.Vertex3f(x1, y1,z1);
    this.Vertex3f(x2, y2,z2);
   
}


Rectangle(x, y,width,height)
{



    let x0 = x;
    let y0 = y;
    let x1 = x + width;
    let y1 = y + height;
    this.Triangle(x0, y0, x1, y0, x1, y1);
    this.Triangle(x1, y1, x0,  y1, x0, y0);

}




RotateRectangle(x, y, w, h, pivot_x, pivot_y,rotation)
{
    let cosRotation = Math.cos(rotation*DEG2RAD);
    let sinRotation = Math.sin(rotation*DEG2RAD);


    let dx = -pivot_x * w;
    let dy = -pivot_y * h;

    let topLeftX = x + dx * cosRotation - dy * sinRotation;
    let topLeftY = y + dx * sinRotation + dy * cosRotation;

    let topRightX = x + (dx + w) * cosRotation - dy * sinRotation;
    let topRightY = y + (dx + w) * sinRotation + dy * cosRotation;

    let bottomLeftX = x + dx * cosRotation - (dy + h) * sinRotation;
    let bottomLeftY = y + dx * sinRotation + (dy + h) * cosRotation;

    let bottomRightX = x + (dx + w) * cosRotation - (dy + h) * sinRotation;
    let bottomRightY = y + (dx + w) * sinRotation + (dy + h) * cosRotation;






    this.Triangle(topLeftX, topLeftY, topRightX, topRightY, bottomRightX, bottomRightY);
    this.Triangle(bottomRightX, bottomRightY, bottomLeftX, bottomLeftY, topLeftX, topLeftY);
    
}

CircleSector(x, y, radius, startAngle, endAngle,  segments)
{
        

        if (radius <= 0.0) radius = 0.1;
        if (endAngle < startAngle)
        {
            let tmp = startAngle;
            startAngle = endAngle;
            endAngle = tmp;
        }

        let minSegments = Math.ceil((endAngle - startAngle)/90);

        if (segments < minSegments)
        {
            let th = Math.acos(2*Math.pow(1 - 0.5/radius, 2) - 1);
            segments = Math.ceil(2*Math.PI/th);
            if (segments <= 0) segments = minSegments;
        }

        let stepLength = (endAngle - startAngle)/segments;
        let angle = startAngle;
       

        for (let i = 0; i < segments; i++)
        {
         
            let x0 =x;
            let y0 =y;

            let x1 =x + Math.sin(DEG2RAD*angle)*radius;
            let y1 =y + Math.cos(DEG2RAD*angle)*radius;

            let x2 =x + Math.sin(DEG2RAD*(angle + stepLength))*radius;
            let y2 =y + Math.cos(DEG2RAD*(angle + stepLength))*radius;

            this.Triangle(x2, y2, x1, y1, x0, y0);

                
            angle += stepLength;
        }


}
Circle(x, y, radius)    
{
    this.CircleSector(x, y, radius, 0, 360, 28);
}


Ring(x, y, innerRadius, outerRadius, startAngle, endAngle,  segments)
{
    if (startAngle == endAngle) return;

    if (outerRadius < innerRadius)
    {
        let tmp = outerRadius;
        outerRadius = innerRadius;
        innerRadius = tmp;

        if (outerRadius <= 0.0) outerRadius = 0.1;
    }

    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/outerRadius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    if (innerRadius <= 0.0)
    {
        this.CircleSector(x, y, outerRadius, startAngle, endAngle, segments);
        return;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;

    for (let i = 0; i < segments; i++)
    {
        let x0 =x + Math.sin(DEG2RAD*angle)*outerRadius;
        let y0 =y + Math.cos(DEG2RAD*angle)*outerRadius;

        let x1 =x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius;
        let y1 =y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius;

        let x2 =x + Math.sin(DEG2RAD*angle)*innerRadius;
        let y2 =y + Math.cos(DEG2RAD*angle)*innerRadius;

       // this.Triangle(x0, y0, x1, y1, x2, y2);
       this.Triangle(x2, y2, x1, y1, x0, y0);


        x0 =x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius;
        y0 =y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius;

        x1 =x + Math.sin(DEG2RAD*(angle + stepLength))*innerRadius;
        y1 =y + Math.cos(DEG2RAD*(angle + stepLength))*innerRadius;

        x2 =x + Math.sin(DEG2RAD*angle)*innerRadius;
        y2 =y + Math.cos(DEG2RAD*angle)*innerRadius;

      //  this.Triangle(x0, y0, x1, y1, x2, y2);
      this.Triangle(x2, y2, x1, y1, x0, y0);

        angle += stepLength;
    }



}



RectangleFromTo(x, y,x2,y2)
{

    this.Triangle(
        x, y, 
        x2, y, 
        x2, y2);

    this.Triangle(
        x2, y2,
        x, y2,
        x, y);
}
Star(x, y, outerRadius, innerRadius)
 {
    let angleStep = 72;
    for (let i = 0; i < 5; i++)
     {
        let x0 = x + outerRadius * Math.cos(i * angleStep * DEG2RAD);
        let y0 = y + outerRadius * Math.sin(i * angleStep * DEG2RAD);
        let x1 = x + innerRadius * Math.cos((i + 0.5) * angleStep * DEG2RAD);
        let y1 = y + innerRadius * Math.sin((i + 0.5) * angleStep * DEG2RAD);
        let x2 = x + outerRadius * Math.cos((i + 1) * angleStep * DEG2RAD);
        let y2 = y + outerRadius * Math.sin((i + 1) * angleStep * DEG2RAD);

       // this.clipTriangle(x0, y0, x1, y1, x2, y2);
        this.Triangle(x2, y2, x1, y1, x0, y0);
    }
}

Cross(x, y, armLength) 
{
    this.Triangle(x, y, x + armLength, y, x, y + armLength);
    this.Triangle(x, y, x, y + armLength, x - armLength, y);
}
//3d
Cube(x, y, z, size)
{
   
    let halfSize = size / 2;
    let x0 = x - halfSize;
    let y0 = y - halfSize;
    let z0 = z - halfSize;
    let x1 = x + halfSize;
    let y1 = y + halfSize;
    let z1 = z + halfSize;
     // Face frontal

    this.Triangle3D(x0, y0, z0, x1, y0, z0, x1, y1, z0);
    this.Triangle3D(x1, y1, z0, x0, y1, z0, x0, y0, z0);

    // Face traseira
    this.Triangle3D(x1, y0, z1, x0, y0, z1, x0, y1, z1);
    this.Triangle3D(x0, y1, z1, x1, y1, z1, x1, y0, z1);

    // Face superior
    this.Triangle3D(x0, y1, z0, x1, y1, z0, x1, y1, z1);
    this.Triangle3D(x1, y1, z1, x0, y1, z1, x0, y1, z0);

    // Face inferior
    this.Triangle3D(x1, y0, z0, x0, y0, z0, x0, y0, z1);
    this.Triangle3D(x0, y0, z1, x1, y0, z1, x1, y0, z0);

    // Face lateral esquerda
    this.Triangle3D(x0, y0, z1, x0, y0, z0, x0, y1, z0);
    this.Triangle3D(x0, y1, z0, x0, y1, z1, x0, y0, z1);

    // Face lateral direita
    this.Triangle3D(x1, y0, z0, x1, y0, z1, x1, y1, z1);
    this.Triangle3D(x1, y1, z1, x1, y1, z0, x1, y0, z0);





}
Sphere(x, y, z, radius, numLines=12) 
{
    var segments = numLines / 2;
    var step = Math.PI / segments;

    for (let i = 0; i < segments; i++)
    {
        let angle0 = i * step;
        let angle1 = (i + 1) * step;
        let y0 = y + Math.cos(angle0) * radius;
        let y1 = y + Math.cos(angle1) * radius;
        let r0 = Math.sin(angle0) * radius;
        let r1 = Math.sin(angle1) * radius;

        for (let j = 0; j < numLines; j++)
        {
            let angle0 = j * 2 * Math.PI / numLines;
            let angle1 = (j + 1) * 2 * Math.PI / numLines;
            let x0 = x + Math.cos(angle0) * r0;
            let x1 = x + Math.cos(angle1) * r0;
            let x2 = x + Math.cos(angle1) * r1;
            let x3 = x + Math.cos(angle0) * r1;
            let z0 = z + Math.sin(angle0) * r0;
            let z1 = z + Math.sin(angle1) * r0;
            let z2 = z + Math.sin(angle1) * r1;
            let z3 = z + Math.sin(angle0) * r1;

            this.Triangle3D(x0, y0, z0, x1, y0, z1, x2, y1, z2);
            this.Triangle3D(x2, y1, z2, x3, y1, z3, x0, y0, z0);
        }
    }

   
}
Cylinder(x, y, z, radius, height, numLines=16)
 {
    var segments = numLines;
    var step = Math.PI * 2 / segments;

    for (let i = 0; i < segments; i++)
    {
        let angle0 = i * step;
        let angle1 = (i + 1) * step;
        let x0 = x + Math.cos(angle0) * radius;
        let x1 = x + Math.cos(angle1) * radius;
        let z0 = z + Math.sin(angle0) * radius;
        let z1 = z + Math.sin(angle1) * radius;

        this.Triangle3D(x0, y, z0, x1, y, z1, x1, y + height, z1);
        this.Triangle3D(x1, y + height, z1, x0, y + height, z0, x0, y, z0);
    }

    for (let i = 0; i < segments; i++)
    {
        let angle0 = i * step;
        let angle1 = (i + 1) * step;
        let x0 = x + Math.cos(angle0) * radius;
        let x1 = x + Math.cos(angle1) * radius;
        let z0 = z + Math.sin(angle0) * radius;
        let z1 = z + Math.sin(angle1) * radius;

        this.Triangle3D(x0, y, z0, x1, y, z1, x, y, z);
        this.Triangle3D(x0, y + height, z0, x, y + height, z, x1, y + height, z1);
    }
 
    
}
Cone(x, y, z, radius, height, numLines=16)
{
    var segments = numLines;
    var step = Math.PI * 2 / segments;

    for (let i = 0; i < segments; i++)
    {
        let angle0 = i * step;
        let angle1 = (i + 1) * step;
        let x0 = x + Math.cos(angle0) * radius;
        let x1 = x + Math.cos(angle1) * radius;
        let z0 = z + Math.sin(angle0) * radius;
        let z1 = z + Math.sin(angle1) * radius;

        this.Triangle3D(x0, y, z0, x1, y, z1, x, y + height, z);
    }

    for (let i = 0; i < segments; i++)
    {
        let angle0 = i * step;
        let angle1 = (i + 1) * step;
        let x0 = x + Math.cos(angle0) * radius;
        let x1 = x + Math.cos(angle1) * radius;
        let z0 = z + Math.sin(angle0) * radius;
        let z1 = z + Math.sin(angle1) * radius;

        this.Triangle3D(x0, y, z0, x1, y, z1, x, y, z);
    }



}

Torus(x, y, z,stacks, slices, innerRadius, outerRadius)
{
   
    var bodyStep = Math.PI * 2 / slices;
    var tubeStep = Math.PI * 2 / stacks;

    for (let i = 0; i < slices; i++) {
        for (let j = 0; j < stacks; j++) {
            let angleBody0 = i * bodyStep;
            let angleBody1 = (i + 1) * bodyStep;
            let angleTube0 = j * tubeStep;
            let angleTube1 = (j + 1) * tubeStep;

            let x0 = x + Math.cos(angleBody0) * (outerRadius + Math.cos(angleTube0) * innerRadius);
            let y0 = y + Math.sin(angleTube0) * innerRadius;
            let z0 = z + Math.sin(angleBody0) * (outerRadius + Math.cos(angleTube0) * innerRadius);

            let x1 = x + Math.cos(angleBody1) * (outerRadius + Math.cos(angleTube0) * innerRadius);
            let y1 = y + Math.sin(angleTube0) * innerRadius;
            let z1 = z + Math.sin(angleBody1) * (outerRadius + Math.cos(angleTube0) * innerRadius);

            let x2 = x + Math.cos(angleBody1) * (outerRadius + Math.cos(angleTube1) * innerRadius);
            let y2 = y + Math.sin(angleTube1) * innerRadius;
            let z2 = z + Math.sin(angleBody1) * (outerRadius + Math.cos(angleTube1) * innerRadius);

            let x3 = x + Math.cos(angleBody0) * (outerRadius + Math.cos(angleTube1) * innerRadius);
            let y3 = y + Math.sin(angleTube1) * innerRadius;
            let z3 = z + Math.sin(angleBody0) * (outerRadius + Math.cos(angleTube1) * innerRadius);

            this.Triangle3D(x0, y0, z0, x1, y1, z1, x2, y2, z2);
            this.Triangle3D(x0, y0, z0, x2, y2, z2, x3, y3, z3);
        }
    }


}




}
//********************************************************************************************************************************************/
class PolyBatch extends Batch
{
constructor(maxVertex)
{
    super(maxVertex);
    this.mode = -1;

}


Flush()
{
 
    if (this.indexCount === 0) return;
    if (this.mode === -1) return;
    Core.SetSolidRender();

    Core.EnableBlend(true);

   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.indexCount));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  




    let count =this.vertexCount;


    gl.bindVertexArray(this.VAO);

    Core.DrawArrays(this.mode, 0, count);

    gl.bindVertexArray(null);

    this.indexCount = 0;
    this.vertexCount = 0;
   
}

SetMode(mode)
{
    if (this.mode !== mode)
    {
        this.Flush();
    }
 
    this.mode = mode;
}
Line(x1, y1, x2, y2)
{
    this.SetMode(LINES);
    this.Vertex2f(x1, y1);
    this.Vertex2f(x2, y2);
}

DrawRotateRectangle(x, y, w, h, pivot_x, pivot_y,rotation)
{
    let cosRotation = Math.cos(rotation*DEG2RAD);
    let sinRotation = Math.sin(rotation*DEG2RAD);


    let dx = -pivot_x * w;
    let dy = -pivot_y * h;

    let topLeftX = x + dx * cosRotation - dy * sinRotation;
    let topLeftY = y + dx * sinRotation + dy * cosRotation;

    let topRightX = x + (dx + w) * cosRotation - dy * sinRotation;
    let topRightY = y + (dx + w) * sinRotation + dy * cosRotation;

    let bottomLeftX = x + dx * cosRotation - (dy + h) * sinRotation;
    let bottomLeftY = y + dx * sinRotation + (dy + h) * cosRotation;

    let bottomRightX = x + (dx + w) * cosRotation - (dy + h) * sinRotation;
    let bottomRightY = y + (dx + w) * sinRotation + (dy + h) * cosRotation;


    this.SetMode(TRIANGLES);

    
    this.Vertex2f(topLeftX, topLeftY);
    this.Vertex2f(topRightX, topRightY);
    this.Vertex2f(bottomRightX, bottomRightY);

    this.Vertex2f(bottomRightX, bottomRightY);
    this.Vertex2f(bottomLeftX, bottomLeftY);
    this.Vertex2f(topLeftX, topLeftY);

    
}
DrawCircleSector(x, y, radius, startAngle, endAngle,  segments)
{
        
        this.SetMode(TRIANGLES);
        if (radius <= 0.0) radius = 0.1;
        if (endAngle < startAngle)
        {
            let tmp = startAngle;
            startAngle = endAngle;
            endAngle = tmp;
        }

        let minSegments = Math.ceil((endAngle - startAngle)/90);

        if (segments < minSegments)
        {
            let th = Math.acos(2*Math.pow(1 - 0.5/radius, 2) - 1);
            segments = Math.ceil(2*Math.PI/th);
            if (segments <= 0) segments = minSegments;
        }

        let stepLength = (endAngle - startAngle)/segments;
        let angle = startAngle;
       

        for (let i = 0; i < segments; i++)
        {
            this.Vertex2f(x, y);
            this.Vertex2f(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
            this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*radius, y + Math.cos(DEG2RAD*(angle + stepLength))*radius);
                
            angle += stepLength;
        }


}
DrawCircle(x, y, radius)    
{
    this.DrawCircleSector(x, y, radius, 0, 360, 28);
}


DrawCircleSectorLines(x, y, radius, startAngle, endAngle,  segments)
{

    this.SetMode(LINES);
    if (radius <= 0.0) radius = 0.1;
    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/radius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;
    let showCapLines = false;


    
    if (showCapLines)
    {
    this.Vertex2f(x, y);
    this.Vertex2f(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }

    for (let i = 0; i < segments; i++)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*radius, y + Math.cos(DEG2RAD*(angle + stepLength))*radius);
            
        angle += stepLength;
    }
    if(showCapLines)
    {
    this.Vertex2f(x, y);
    this.Vertex2f(x + Math.sin(DEG2RAD*angle)*radius, y + Math.cos(DEG2RAD*angle)*radius);
    }


}

DrawCircleLines(x, y, radius)
{
    this.DrawCircleSectorLines(x, y, radius, 0, 360, 18);

}
DrawRingLines(x, y, innerRadius, outerRadius, startAngle, endAngle,  segments)
{
    if (startAngle == endAngle) return;

    if (outerRadius < innerRadius)
    {
        let tmp = outerRadius;
        outerRadius = innerRadius;
        innerRadius = tmp;

        if (outerRadius <= 0.0) outerRadius = 0.1;
    }

    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/outerRadius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    if (innerRadius <= 0.0)
    {
        this.DrawCircleSectorLines(x, y, outerRadius, startAngle, endAngle, segments);
        return;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;
    let showCapLines = true;

    this.SetMode(LINES);
    if (showCapLines)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);
    }

    for (let i = 0; i < segments; i++)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius);

        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*innerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*innerRadius);

        angle += stepLength;
    }

    if (showCapLines)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);
    }

}
DrawRing(x, y, innerRadius, outerRadius, startAngle, endAngle,  segments)
{
    if (startAngle == endAngle) return;

    if (outerRadius < innerRadius)
    {
        let tmp = outerRadius;
        outerRadius = innerRadius;
        innerRadius = tmp;

        if (outerRadius <= 0.0) outerRadius = 0.1;
    }

    if (endAngle < startAngle)
    {
        let tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
    }

    let minSegments = Math.ceil((endAngle - startAngle)/90);

    if (segments < minSegments)
    {
        let th = Math.acos(2*Math.pow(1 - 0.5/outerRadius, 2) - 1);
        segments = Math.ceil(2*Math.PI/th);
        if (segments <= 0) segments = minSegments;
    }

    if (innerRadius <= 0.0)
    {
        this.DrawCircleSector(x, y, outerRadius, startAngle, endAngle, segments);
        return;
    }

    let stepLength = (endAngle - startAngle)/segments;
    let angle = startAngle;

    this.SetMode(TRIANGLES);
    for (let i = 0; i < segments; i++)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*outerRadius, y + Math.cos(DEG2RAD*angle)*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);

        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*outerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*outerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*innerRadius, y + Math.cos(DEG2RAD*(angle + stepLength))*innerRadius);
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*innerRadius, y + Math.cos(DEG2RAD*angle)*innerRadius);

        angle += stepLength;
    }

}


DrawEllipseLine(x, y, width, height)
{
    this.SetMode(LINES);
    let segments = 36;
    let stepLength = 360/segments;
    let angle = 0;
    for (let i = 0; i < segments; i++)
    {
        this.Vertex2f(x + Math.sin(DEG2RAD*angle)*width, y + Math.cos(DEG2RAD*angle)*height);
        this.Vertex2f(x + Math.sin(DEG2RAD*(angle + stepLength))*width, y + Math.cos(DEG2RAD*(angle + stepLength))*height);
        angle += stepLength;
    }       
}
DrawRectangleLinesFromTo(x, y,x2,y2)
{
    this.SetMode(LINES);
    this.Vertex2f(x, y);
    this.Vertex2f(x2, y);
    this.Vertex2f(x2, y);
    this.Vertex2f(x2, y2);
    this.Vertex2f(x2, y2);
    this.Vertex2f(x, y2);
    this.Vertex2f(x, y2);
    this.Vertex2f(x, y);
}
DrawRectangleLines(x, y,width,height)
{
    this.SetMode(LINES);
    this.Vertex2f(x, y);
    this.Vertex2f(x + width, y);
    this.Vertex2f(x + width, y);
    this.Vertex2f(x + width, y + height);
    this.Vertex2f(x + width, y + height);
    this.Vertex2f(x, y + height);
    this.Vertex2f(x, y + height);
    this.Vertex2f(x, y);
}
DrawRectangle(x, y,width,height)
{
    this.SetMode(TRIANGLES);
    this.Vertex2f(x, y);
    this.Vertex2f(x + width, y);
    this.Vertex2f(x + width, y + height);

    this.Vertex2f(x + width, y + height);
    this.Vertex2f(x, y + height);
    this.Vertex2f(x, y);
}
DrawRectangleFromTo(x, y,x2,y2)
{
    this.SetMode(TRIANGLES);
    this.Vertex2f(x, y);
    this.Vertex2f(x2, y);
    this.Vertex2f(x2, y2);

    this.Vertex2f(x2, y2);
    this.Vertex2f(x, y2);
    this.Vertex2f(x, y);
}
///just for testing

DrawTrianglesStrip(points)
{
    this.SetMode(TRIANGLE_STRIP);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawTrianglesFan(points)
{
    this.SetMode(TRIANGLE_FAN);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawLines(points)
{
    this.SetMode(LINES);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawPoints(points)
{
    this.SetMode(POINTS);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawLinesStrip(points)
{
    this.SetMode(LINE_STRIP);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawLinesLoop(points)
{
    this.SetMode(LINE_LOOP);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}
DrawTriangles(points)
{
    this.SetMode(TRIANGLES);
    for (let i = 0; i < points.length; i++)
    {
        this.Vertex2f(points[i].x, points[i].y);
    }
}

}
//********************************************************************************************************************************************/
class SpriteBatch 
{
static  FIX_ARTIFACTS_BY_STRECHING_TEXEL = true;

constructor(capacity)
{
    this.maxVertex = capacity;
    this.vertexStrideSize = (3 + 2 + 4);
    this.vertices = new Float32Array(capacity * 4 * this.vertexStrideSize);
    this.indices  = new Uint16Array(capacity *  4 * 6);
    this.maxElemnts = capacity * 4 * 6;

    this.quad = new Float32Array(8);
    this.quads=[];
    this.quads.push(new Quad());
    this.quads.push(new Quad());
    this.quads.push(new Quad());
    this.quads.push(new Quad());

    this.clip = new Rectangle(0, 0, Core.GetWidth(), Core.GetHeight());
    this.useClip = false;


    this.totalAlloc = Math.floor( ( this.maxVertex * 4 * this.vertexStrideSize * 4) / 9);

    this.vertexCount  = 0;
    this.vertexIndex  = 0;


    this.invTexWidth  = 1;
    this.invTexHeight = 1;




    this.colorr=1.0;
    this.colorg=1.0;
    this.colorb=1.0;
    this.colora=1.0;
    this.uvx=0;
    this.uvy=0;
    this.flip_x = false;
    this.flip_y = false;
    
    this.defaultTexture  = Core.defaultTexture;
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
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.indexBuffer);
    this.defaultTexture.Release();
}
Init()
{
   


 //   this.defaultTexture.Create(1, 1, 4, new Uint8Array([255, 0, 255, 255]));
    this.currentBaseTexture = this.defaultTexture;


    
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



SwitchTexture(texture)
{
   
    this.Flush();
    
    this.currentBaseTexture = texture;
    this.invTexWidth =  1.0 / texture.width;
    this.invTexHeight = 1.0 / texture.height;
    this.textureCount++;
}

Render()
{
    this.Flush();

}


Flush()
{
 

   if (this.vertexCount === 0) return;

 
    Core.EnableBlend(true);
    Core.SetBlendMode(BlendMode.Normal);
    Core.SetTextureShader();

   
   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
   gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.vertexIndex));
   gl.bindBuffer(gl.ARRAY_BUFFER, null);




  


    gl.bindVertexArray(this.VAO);
    this.currentBaseTexture.Use();
    Core.DrawElements(gl.TRIANGLES, (this.vertexCount / 4) * 6, 0);

    gl.bindVertexArray(null);


    this.vertexIndex = 0;
    this.vertexCount = 0;




  //  this.currentBaseTexture = this.defaultTexture;
}




Clear()
{
    this.vertices.fill(0);
          
   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
   gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.vertexIndex = 0;
    this.vertexCount = 0;

  
}
PointInView(x, y)
{
    if (this.useClip)
    {
        return this.clip.contains(x, y);
    }
    return true;
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

SetColor4f(r, g, b, a)
{
    this.colorr = r;
    this.colorg = g;
    this.colorb = b;
    this.colora = a;
}
SetColor (color)
{
    this.colorr = color.r;
    this.colorg = color.g;
    this.colorb = color.b;
    this.colora = color.a;
}
Vertex2(x, y)
{
    this.Vertex3(x, y, 0.0);
}

TextCoords(u, v)
{
    this.uvx = u ;
    this.uvy = v ;
}

Color4f(r, g, b, a)
{
    this.colorr = r;
    this.colorg = g;
    this.colorb = b;
    this.colora = a;
}
Color3f(r, g, b)
{
    this.colorr = r;
    this.colorg = g;
    this.colorb = b;
}

Color(color)
{
    this.colorr = color.r;
    this.colorg = color.g;
    this.colorb = color.b;
    this.colora = color.a;
}



DrawScrollingTiled(texture, x, y, width, height, xAmount , yAmount, xTiles, yTiles)
{
    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }


    
    let totalTilesX = Math.floor(xTiles);
    let totalTilesY = Math.floor(yTiles);



    // Calcula as coordenadas de textura ajustadas com base no número total de tiles
    let left = 0 + (xAmount * totalTilesX);
    let right = left + (width / texture.width) * (1 * totalTilesX);
    let top = 0 + (yAmount / totalTilesY);
    let bottom = top + (height / texture.height) * (1 *totalTilesY);



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

    let fx2 = x + width;
    let fy2 = y + height;

    this.TextCoords(left, top);
    this.Vertex2(x, y);

    this.TextCoords(left, bottom);
    this.Vertex2(x, fy2);

    this.TextCoords(right, bottom);
    this.Vertex2(fx2, fy2);

    this.TextCoords(right, top);
    this.Vertex2(fx2, y);
}

DrawScrolling(texture, x, y, width, height, xAmount , yAmount)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }


    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;
   
    

    if (xAmount !== 0)
    {
        let widthTex = (right - left) * texture.width;
        left = (left + xAmount) % 1;
        right = left + widthTex / texture.width;
    }

    if (yAmount !== 0)
    {
        let heightTex = (bottom - top) * texture.height;
        top = (top + yAmount) % 1;
        bottom = top + heightTex / texture.height;
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

    

    let fx2 = x + width;
    let fy2 = y + height;

    this.TextCoords(left, top);
    this.Vertex2(x, y);

    this.TextCoords(left, bottom);
    this.Vertex2(x, fy2);

    this.TextCoords(right, bottom);
    this.Vertex2(fx2, fy2);

    this.TextCoords(right, top);
    this.Vertex2(fx2, y);



}


DrawTransformedClip(texture, src_x, src_y, src_width,src_height, matrix, x_align=Allign.Left,y_align=Allign.Top)
{
    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


    let widthTex  = texture.width;
    let heightTex = texture.height;



    if (this.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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


    if (x_align === Allign.Left)
    {
        this.quad[0] = 0;
        this.quad[2] = 0;
        this.quad[4] = src_width;
        this.quad[6] = src_width;
    } else 
    if (x_align === Allign.Right)
    {
        this.quad[0] = -src_width;
        this.quad[2] = -src_width;
        this.quad[4] = 0;
        this.quad[6] = 0;
    } else
    if (x_align === Allign.Center)
    {
        this.quad[0] = -src_width * 0.5;
        this.quad[2] = -src_width * 0.5;
        this.quad[4] = src_width * 0.5;
        this.quad[6] = src_width * 0.5;
    }

    if (y_align === Allign.Top)
    {
        this.quad[1] = 0;
        this.quad[3] = src_height;
        this.quad[5] = src_height;
        this.quad[7] = 0;
    } else
    if (y_align === Allign.Bottom)
    {
        this.quad[1] = -src_height;
        this.quad[3] = 0;
        this.quad[5] = 0;
        this.quad[7] = -src_height;
    } else
    if (y_align === Allign.Center)
    {
        this.quad[1] = -src_height * 0.5;
        this.quad[3] = src_height * 0.5;
        this.quad[5] = src_height * 0.5;
        this.quad[7] = -src_height * 0.5;
    }



    for (let i = 0; i < 4; i++)
    {
        let x = this.quad[i * 2];
        let y = this.quad[i * 2 + 1];

        this.quad[i * 2] = matrix.a * x + matrix.c * y + matrix.tx;
        this.quad[i * 2 + 1] = matrix.d * y + matrix.b * x + matrix.ty;
    }
        
  


    this.TextCoords(left, top);
    this.Vertex2( this.quad[0], this.quad[1]);

    this.TextCoords(left, bottom);
    this.Vertex2( this.quad[2], this.quad[3]);

    this.TextCoords(right, bottom);
    this.Vertex2( this.quad[4], this.quad[5]);

    this.TextCoords(right, top);
    this.Vertex2( this.quad[6], this.quad[7]);


  
}

DrawTransformed(texture,  matrix, x_align=Allign.Left,y_align=Allign.Top)
{
    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


    let widthTex  = texture.width;
    let heightTex = texture.height;


    
    
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


    if (x_align === Allign.Left)
    {
        this.quad[0] = 0;
        this.quad[2] = 0;
        this.quad[4] = widthTex;
        this.quad[6] = widthTex;
    } else 
    if (x_align === Allign.Right)
    {
        this.quad[0] = -widthTex;
        this.quad[2] = -widthTex;
        this.quad[4] = 0;
        this.quad[6] = 0;
    } else
    if (x_align === Allign.Center)
    {
        this.quad[0] = -widthTex * 0.5;
        this.quad[2] = -widthTex * 0.5;
        this.quad[4] = widthTex * 0.5;
        this.quad[6] = widthTex * 0.5;
    }

    if (y_align === Allign.Top)
    {
        this.quad[1] = 0;
        this.quad[3] = heightTex;
        this.quad[5] = heightTex;
        this.quad[7] = 0;
    } else
    if (y_align === Allign.Bottom)
    {
        this.quad[1] = -heightTex;
        this.quad[3] = 0;
        this.quad[5] = 0;
        this.quad[7] = -heightTex;
    } else
    if (y_align === Allign.Center)
    {
        this.quad[1] = -heightTex * 0.5;
        this.quad[3] = heightTex * 0.5;
        this.quad[5] = heightTex * 0.5;
        this.quad[7] = -heightTex * 0.5;
    }



    for (let i = 0; i < 4; i++)
    {
        let x = this.quad[i * 2];
        let y = this.quad[i * 2 + 1];

        this.quad[i * 2] = matrix.a * x + matrix.c * y + matrix.tx;
        this.quad[i * 2 + 1] = matrix.d * y + matrix.b * x + matrix.ty;
    }
        
  


    this.TextCoords(left, top);
    this.Vertex2( this.quad[0], this.quad[1]);

    this.TextCoords(left, bottom);
    this.Vertex2( this.quad[2], this.quad[3]);

    this.TextCoords(right, bottom);
    this.Vertex2( this.quad[4], this.quad[5]);

    this.TextCoords(right, top);
    this.Vertex2( this.quad[6], this.quad[7]);


  
}


DrawTiled(texture, x, y, width, height,texture_repeat_x,texture_repeat_y)
{
    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

   
    let widthTex  = texture.width;
    let heightTex = texture.height;

    let left = 0;
    let right = texture_repeat_x;
    let top = 0;
    let bottom =texture_repeat_y;

    if (this.flip_x) {
        let tmp = left;
        left = right;
        right = tmp;
    }

    if (this.flip_y) {
        let tmp = top;
        top = bottom;
        bottom = tmp;
    }

    let fx2 = x + width;
    let fy2 = y + height;

    this.TextCoords(left, top);
    this.Vertex2(x, y);

    this.TextCoords(left, bottom);
    this.Vertex2(x, fy2);

    this.TextCoords(right, bottom);
    this.Vertex2(fx2, fy2);

    this.TextCoords(right, top);
    this.Vertex2(fx2, y);


  
  
}

Draw(texture, x, y, width, height)
{
 
    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }


  
    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


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
    


    
    this.TextCoords(this.quads[1].tx, this.quads[1].ty);
    this.Vertex2(this.quads[1].x, this.quads[1].y);

    this.TextCoords(this.quads[0].tx, this.quads[0].ty);
    this.Vertex2(this.quads[0].x, this.quads[0].y);

    this.TextCoords(this.quads[3].tx, this.quads[3].ty);
    this.Vertex2(this.quads[3].x, this.quads[3].y);

    this.TextCoords(this.quads[2].tx, this.quads[2].ty);
    this.Vertex2(this.quads[2].x, this.quads[2].y);


}

DrawRotate(texture, x, y, w, h, pivot_x, pivot_y, rotation)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let spin = (rotation * DEG2RAD);
    let cosRotation = Math.cos(spin);
    let sinRotation = Math.sin(spin);


    let dx = -pivot_x * w;
    let dy = -pivot_y * h;

    let topLeftX = x + dx * cosRotation - dy * sinRotation;
    let topLeftY = y + dx * sinRotation + dy * cosRotation;

    let topRightX = x + (dx + w) * cosRotation - dy * sinRotation;
    let topRightY = y + (dx + w) * sinRotation + dy * cosRotation;

    let bottomLeftX = x + dx * cosRotation - (dy + h) * sinRotation;
    let bottomLeftY = y + dx * sinRotation + (dy + h) * cosRotation;

    let bottomRightX = x + (dx + w) * cosRotation - (dy + h) * sinRotation;
    let bottomRightY = y + (dx + w) * sinRotation + (dy + h) * cosRotation;


    let u = 0;
    let v = 0;
    let u2 = 1;
    let v2 = 1;

    if (this.flip_x)
    {
        let tmp = u;
        u = u2;
        u2 = tmp;
    }

    if (this.flip_y)
    {
        let tmp = v;
        v = v2;
        v2 = tmp;
    }


    this.TextCoords(u, v);
    this.Vertex2(topLeftX, topLeftY);

    this.TextCoords(u, v2);
    this.Vertex2(bottomLeftX, bottomLeftY);

    this.TextCoords(u2, v2);
    this.Vertex2(bottomRightX, bottomRightY);

    this.TextCoords(u2, v);
    this.Vertex2(topRightX, topRightY);

    
}

DrawRotateClip(texture, x, y, w, h, pivot_x, pivot_y,rotation, src_x, src_y, src_width, src_height)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let spin = (rotation * DEG2RAD);
    let cosRotation = Math.cos(spin);
    let sinRotation = Math.sin(spin);


    let dx = -pivot_x * w;
    let dy = -pivot_y * h;

    let topLeftX = x + dx * cosRotation - dy * sinRotation;
    let topLeftY = y + dx * sinRotation + dy * cosRotation;

    let topRightX = x + (dx + w) * cosRotation - dy * sinRotation;
    let topRightY = y + (dx + w) * sinRotation + dy * cosRotation;

    let bottomLeftX = x + dx * cosRotation - (dy + h) * sinRotation;
    let bottomLeftY = y + dx * sinRotation + (dy + h) * cosRotation;

    let bottomRightX = x + (dx + w) * cosRotation - (dy + h) * sinRotation;
    let bottomRightY = y + (dx + w) * sinRotation + (dy + h) * cosRotation;

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


    let widthTex = texture.width;
    let heightTex = texture.height;



    if (this.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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
   

    this.TextCoords(left, top);
    this.Vertex2(topLeftX, topLeftY);

    this.TextCoords(left, bottom);
    this.Vertex2(bottomLeftX, bottomLeftY);

    this.TextCoords(right, bottom);
    this.Vertex2(bottomRightX, bottomRightY);

    this.TextCoords(right, top);
    this.Vertex2(topRightX, topRightY);

    
}


DrawRotateClipScale(texture, x, y, pivot_x, pivot_y,rotation, scale_x, scale_y, src_x, src_y, src_width, src_height)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let spin = (rotation * DEG2RAD);
    let cosRotation = Math.cos(spin);
    let sinRotation = Math.sin(spin);

    let w = src_width * scale_x;
    let h = src_height * scale_y;


    let dx = -pivot_x * w;
    let dy = -pivot_y * h;

    let topLeftX = x + dx * cosRotation - dy * sinRotation;
    let topLeftY = y + dx * sinRotation + dy * cosRotation;

    let topRightX = x + (dx + w) * cosRotation - dy * sinRotation;
    let topRightY = y + (dx + w) * sinRotation + dy * cosRotation;

    let bottomLeftX = x + dx * cosRotation - (dy + h) * sinRotation;
    let bottomLeftY = y + dx * sinRotation + (dy + h) * cosRotation;

    let bottomRightX = x + (dx + w) * cosRotation - (dy + h) * sinRotation;
    let bottomRightY = y + (dx + w) * sinRotation + (dy + h) * cosRotation;

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


    let widthTex = texture.width;
    let heightTex = texture.height;



    if (this.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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
   

    this.TextCoords(left, top);
    this.Vertex2(topLeftX, topLeftY);

    this.TextCoords(left, bottom);
    this.Vertex2(bottomLeftX, bottomLeftY);

    this.TextCoords(right, bottom);
    this.Vertex2(bottomRightX, bottomRightY);

    this.TextCoords(right, top);
    this.Vertex2(topRightX, topRightY);

    
}


DrawClip(texture, x, y, width, height, src_x, src_y, src_width, src_height)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;


    let widthTex = texture.width;
    let heightTex = texture.height;



    if (this.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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
    


    
    this.TextCoords(this.quads[1].tx, this.quads[1].ty);
    this.Vertex2(this.quads[1].x, this.quads[1].y);

    this.TextCoords(this.quads[0].tx, this.quads[0].ty);
    this.Vertex2(this.quads[0].x, this.quads[0].y);

    this.TextCoords(this.quads[3].tx, this.quads[3].ty);
    this.Vertex2(this.quads[3].x, this.quads[3].y);

    this.TextCoords(this.quads[2].tx, this.quads[2].ty);
    this.Vertex2(this.quads[2].x, this.quads[2].y);




    // this.TextCoords(left, top);
    // this.Vertex2(x, y);

    // this.TextCoords(left, bottom);
    // this.Vertex2(x, y + height);

    // this.TextCoords(right, bottom);
    // this.Vertex2(x + width, y + height);

    // this.TextCoords(right, top);
    // this.Vertex2(x + width, y);


}


DrawClipScale(texture, x, y, scale_x, scale_y, src_x, src_y, src_width, src_height)
{

    if (texture===null || texture === undefined) 
    {
        this.SwitchTexture(this.defaultTexture);
    } else 
    if (texture.id !== this.currentBaseTexture.id)
    { 
        this.SwitchTexture(texture);
    }

    let left = 0;
    let right = 1;
    let top = 0;
    let bottom = 1;

    let width  = src_width * scale_x;
    let height = src_height * scale_y;


    let widthTex = texture.width;
    let heightTex = texture.height;



    if (this.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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






    this.TextCoords(left, top);
    this.Vertex2(x, y);

    this.TextCoords(left, bottom);
    this.Vertex2(x, y + height);

    this.TextCoords(right, bottom);
    this.Vertex2(x + width, y + height);

    this.TextCoords(right, top);
    this.Vertex2(x + width, y);


}


}
//********************************************************************************************************************************************/
class PolySprite 
{
    static VBOVERTEX=2;
    static VBOCOLOR =4;
    static VBOUV    =8;

    constructor()
    {
        this.points = [];
        this.colors = [];
        this.vertices = [];
        this.uvs = [];
        this.vertexBuffer = null;
        this.texture = null;
        this.color = new Color(1, 1, 1, 1);
        this.depth=0;
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.regionWidth = 0;
        this.regionHeight = 0;
        this.flags = 0;
        this.isTriangulated = false;
        this.triangles =0;
        this.Init();

        
    }

    Init()
    {
        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer  = gl.createBuffer();
        this.uvBuffer     = gl.createBuffer();
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

        gl.bindVertexArray(null);
      
    }

    TotalPoints()
    {
        return this.points.length / 2;
    }

    Clear()
    {
        this.points = [];
        this.colors = [];
        this.vertices = [];
        this.uvs = [];
        this.isTriangulated = false;
        this.triangles = 0;
        this.Update();
    }

    Move(x, y)
    {
        for (let i = 0; i < this.points.length; i += 2)
        {
            this.points[i] += x;
            this.points[i + 1] += y;
        }
    }

    Update()
    {
        if (this.texture === null || this.texture === undefined)  
        {
            throw new Error('[Render] The texture is not set.');
        };
        if (!this.isTriangulated) return;

        if (this.flags & PolySprite.VBOVERTEX)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~PolySprite.VBOVERTEX;
        }
        
        if (this.flags & PolySprite.VBOCOLOR)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~PolySprite.VBOCOLOR;
        }

        if (this.flags & PolySprite.VBOUV)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~PolySprite.VBOUV;
        }

   

    }

    SetRegion(x, y, width, height)
    {
        if (this.texture === null || this.texture === undefined) 
        {
            throw new Error('[SetRegion] The texture is not set.');
        };
        let invTexWidth  = 1 / this.texture.width;
        let invTexHeight = 1 / this.texture.height;
        this.SetUv(x * invTexWidth, y * invTexHeight, (x + width) * invTexWidth, (y + height) * invTexHeight);
        this.regionWidth = Math.abs(width);
        this.regionHeight = Math.abs(height);
    }

    SetUv(u, v, u2, v2)
    {
        this.left = u;
        this.top = v;
        this.right = u2;
        this.bottom = v2;
        this.flags |= PolySprite.VBOUV;

    }



    Release()
    {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteVertexArray(this.vertexArray);
    }

    SetTexture(texture)
    {
        this.texture = texture;
        this.SetRegion(0, 0, texture.width, texture.height);
    }

    AddPoint(x, y)
    {
        this.points.push(x);
        this.points.push(y);
    }

    PointX(index)
    {
        return this.points[index * 2];
    }
    PointY(index)
    {
        return this.points[index * 2 + 1];
    }
    ScaleVertex(factorX, factorY)
    {
        let no_verts = this.vertices.length;
        for (let i = 0; i < no_verts; i += 3)
        {
            this.vertices[i] *= factorX;
            this.vertices[i + 1] *= factorY;
        }
        this.flags |= PolySprite.VBOVERTEX;
    }
    ScaleTexCoords(factorX, factorY)
    {
        let no_uvs = this.uvs.length;
        for (let i = 0; i < no_uvs; i += 2)
        {
            this.uvs[i] *= factorX;
            this.uvs[i + 1] *= factorY;
        }
        this.flags |= PolySprite.VBOUV;
    }
    AddTriangle(x,y)
    {
        if (this.texture === null || this.texture === undefined)
        {
            throw new Error('[AddTriangle] The texture is not set.');
        };
        
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(this.depth);
        this.colors.push(this.color.r);
        this.colors.push(this.color.g);
        this.colors.push(this.color.b);
        this.colors.push(this.color.a);

      

        let uvWidth  = this.right - this.left;
        let uvHeight = this.bottom - this.top;

        let width  = this.regionWidth;
        let height = this.regionHeight;

        let xu = this.left + uvWidth * (x / width);
        let xv = this.top + uvHeight * (y / height);

        this.uvs.push(xu);
        this.uvs.push(xv);    
        this.triangles++;
    
    }

    Triangulate()
    {
        let no_verts = this.points.length / 2;
        if (no_verts < 3) return;

        this.colors = [];
        this.vertices = [];
        this.uvs = [];

        // for (let i = 0; i < no_verts; i++)
        // {
        //     this.AddTriangle(this.PointX(i), this.PointY(i));
        // }
        
        let tris = Triangulate(this.points);

        for (let i = 0; i < tris.length; i += 3)
        {
            let i0 = tris[i];
            let i1 = tris[i + 1];
            let i2 = tris[i + 2];

            this.AddTriangle(this.PointX(i0), this.PointY(i0));
            this.AddTriangle(this.PointX(i1), this.PointY(i1));
            this.AddTriangle(this.PointX(i2), this.PointY(i2));
   
        }


       
        console.log("Triangulate PolySprite" + this.triangles);
        this.isTriangulated = true;
        this.flags |= PolySprite.VBOVERTEX | PolySprite.VBOCOLOR | PolySprite.VBOUV;
    }


    Render()
    {
        this.Update();
        if (this.vertices.length === 0 || !this.isTriangulated) return;
      

        if (this.texture === null || this.texture === undefined)  
        {
            throw new Error('[Render] The texture is not set.');
        };

   
        Core.EnableBlend(true);
        Core.SetBlendMode(BlendMode.Normal);
        Core.SetTextureShader();
     
        this.texture.Use();
     

   

        gl.bindVertexArray(this.vertexArray);
        gl.drawArrays(gl.TRIANGLES, 0, this.triangles);
        gl.bindVertexArray(null);
  

    }

    Transform(matrix)
    {
        if (this.vertices.length === 0) return;
        let no_verts = this.vertices.length / 3;

        let is2D = matrix instanceof Matrix2D;
 
        for (let i = 0; i < no_verts; i++)
        {
            let x = this.vertices[i * 3];
            let y = this.vertices[i * 3 + 1];
            let z = this.vertices[i * 3 + 2];

            if (is2D)
            {
                this.vertices[i * 3] = matrix.a * x + matrix.c * y + matrix.tx;
                this.vertices[i * 3 + 1] = matrix.d * y + matrix.b * x + matrix.ty;
                this.vertices[i * 3 + 2] = z;
            } else 
            {
                        console.log("TODO: 3D Transform PolySprite");
            }
        }
        this.flags |= PolySprite.VBOVERTEX;
    }

    DrawPointsLines(PolyBatch ,color)
    {
        if (this.points.length === 0) return;
        PolyBatch.SetColor(color);
        let no_verts = this.points.length / 2;
        if (no_verts < 2) return;
        for (let i = 0; i < no_verts - 1; i++)
        {
            let x0 = this.PointX(i);
            let y0 = this.PointY(i);
            let x1 = this.PointX(i + 1);
            let y1 = this.PointY(i + 1);
            PolyBatch.Line(x0, y0, x1, y1);
        }

        if (no_verts > 2)
        {
            let x0 = this.PointX(no_verts - 1);
            let y0 = this.PointY(no_verts - 1);
            let x1 = this.PointX(0);
            let y1 = this.PointY(0);
            PolyBatch.Line(x0, y0, x1, y1);
        }


    
    }

    DrawLines(PolyBatch ,color)
    {
        if (this.points.length === 0) return;
        if (this.points.length < 2) return;
        if (!this.isTriangulated)    return;
        PolyBatch.SetColor(color);
             //triangles
        
        for (let i = 0; i < this.triangles; i++)
        {
            let i0 = i * 3;
            let i1 = i0 + 1;
            let i2 = i0 + 2;
            let x0 = this.vertices[i0 * 3];
            let y0 = this.vertices[i0 * 3 + 1];
            let x1 = this.vertices[i1 * 3];
            let y1 = this.vertices[i1 * 3 + 1];
            let x2 = this.vertices[i2 * 3];
            let y2 = this.vertices[i2 * 3 + 1];
            PolyBatch.Line(x0, y0, x1, y1);
            PolyBatch.Line(x1, y1, x2, y2);
            PolyBatch.Line(x2, y2, x0, y0);
        }
    
    }
}
//********************************************************************************************************************************************/
class SpriteTerrain 
{
    constructor()
    {
        this.terrainTop = new PolySprite();
        this.terrain   = new PolySprite();
        this.terrainTop.color.Set(1,1,1, 1);
        this.points = [];
        this.select = -1;
        this.dragging = false;
        this.radius   = 20;
        this.thickness = 50; // Height of the terrain
        this.splinePoints = [];
    }
    Pick(x, y)
    {
        for (let i = 0; i < this.points.length; i++) 
        {
            if (this.points[i].distance(x, y) < this.radius)
            {
                return i;
            }
        }
        return -1;
    }
    TotalPoints()
    {
        return this.points.length;
    }
    CalculateCenter()
    {
        let center = new Vector2(0, 0);
        for (let i = 0; i < this.points.length; i++) 
        {
            center.x += this.points[i].x;
            center.y += this.points[i].y;
        }
        center.x /= this.points.length;
        center.y /= this.points.length;
        return center;
    }

    AddPoint(x, y)
    {
        this.points.push(new Vector2(x, y));
        
    }

    Move(x, y)
    {
       for (let i = 0; i < this.points.length; i++)
       {
           this.points[i].x += x;
           this.points[i].y += y;
       }
    }

    Clear()
    {
        this.points = [];
        this.splinePoints = [];
        this.terrain.Clear();
        this.terrainTop.Clear();
    }
    PointX(index)
    {
        return this.points[index].x;
    }
    PointY(index)
    {
        return this.points[index].y;
    }

    Triangulate(spline=true)
    {
        this.terrain.Clear();
        this.terrainTop.Clear();

        if (spline)
        {
            this.splinePoints = CatmullRomSplineInterpolationClean(this.points,0.05, this.radius*4);
            let count = this.splinePoints.length;
            if (count < 2) return;
            for (let i = 0; i < count; i++)
            {
                let point = this.splinePoints[i]; 
                this.terrainTop.AddPoint(point.x, point.y);
            }

            for (let i = 0; i < count; i++)
            {
                let p0 = (i==0) ? this.splinePoints[count-1] : this.splinePoints[i-1];
                let p1 = this.splinePoints[i];
                let p2 = this.splinePoints[(i+1) % count];

                let n1 = Vector2.NormalVector(p0,p1);
                let n2 = Vector2.NormalVector(p1,p2);

                let factor = 1 + (n1.x * n2.x + n1.y * n2.y);
                let normal = new Vector2((n1.x + n2.x)/factor, (n1.y + n2.y)/factor);
                let point = new Vector2(p1.x + normal.x * this.thickness, p1.y + normal.y * this.thickness);
                this.terrain.AddPoint(point.x, point.y);
            }

        } else 
        {

        

        let count = this.points.length;
        if (count < 2) return;
        for (let i = 0; i < count; i++)
        {

            let point = this.points[i]; 
            this.terrainTop.AddPoint(point.x, point.y);

        }


        for (let i = 0; i < count; i++)
        {
            let p0 = (i==0) ? this.points[count-1] : this.points[i-1];
            let p1 = this.points[i];
            let p2 = this.points[(i+1) % count];

            let n1 = Vector2.NormalVector(p0,p1);
            let n2 = Vector2.NormalVector(p1,p2);

            let factor = 1 + (n1.x * n2.x + n1.y * n2.y);
            let normal = new Vector2((n1.x + n2.x)/factor, (n1.y + n2.y)/factor);
            let point = new Vector2(p1.x + normal.x * this.thickness, p1.y + normal.y * this.thickness);
            this.terrain.AddPoint(point.x, point.y);
              

           
        }

       
        }
        

     



        this.terrain.Triangulate();
        this.terrainTop.Triangulate();
    }
    Render()
    {
     
      
        this.terrainTop.Render();
        this.terrain.Render();
      
    }
    Pop()
    {
        if (this.points.length > 0)
        {
            this.points.pop();
        }
    }

    Editor(PolyBatch )
    {
        if (Input.IsMousePressed(0) && !this.dragging)
        {
            let x = Mouse.X;
            let y = Mouse.Y;
            this.select = this.Pick(x, y);
            if (this.select != -1)
            {
                this.dragging = true;
            } else 
            {
                this.AddPoint(x, y);
            }
        }

        
        PolyBatch.SetColor(WHITE);
        for (let i = 0; i < this.points.length; i++)
        {
            PolyBatch.DrawCircleLines(this.points[i].x, this.points[i].y, this.radius);
        }
        let count = this.points.length;
        if (count < 2) return;
        for (let i = 0; i < this.points.length - 1; i++)
        {
            PolyBatch.Line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
        }
        PolyBatch.Line(this.points[count - 1].x, this.points[count - 1].y, this.points[0].x, this.points[0].y);

      

        if (Input.IsKeyPressed(Key.D))
        {
            this.Pop();
        }
       
     
       
        
        if (Input.IsMouseReleased(0))
        {
            this.dragging = false;
            this.select = -1;
        }

        if (this.dragging)
        {
            let x = Mouse.X;
            let y = Mouse.Y;
            
            this.points[this.select].x = x;
            this.points[this.select].y = y;
            
        
        }
    
        PolyBatch.SetColor(RED);
        const center = this.CalculateCenter();
        PolyBatch.DrawCircleLines(center.x, center.y, this.radius/2);
 

        if (this.select != -1)
        {
            PolyBatch.SetColor(RED);
            PolyBatch.DrawCircleLines(this.points[this.select].x, this.points[this.select].y, this.radius + 0.9);
        }

        for (let i = 0; i < this.splinePoints.length - 1; i++)
        {
            PolyBatch.Line(this.splinePoints[i].x, this.splinePoints[i].y, this.splinePoints[i + 1].x, this.splinePoints[i + 1].y);
        }
        for (let i = 0; i < this.splinePoints.length; i++)
        {
            PolyBatch.SetColor(WHITE);
            PolyBatch.DrawCircle(this.splinePoints[i].x, this.splinePoints[i].y, 6);
        }
    }

   

}
//********************************************************************************************************************************************/
class SpriteCloud 
{
    static VBOVERTEX=2;
    static VBOCOLOR =4;
    static VBOUV    =8;
    static VBOINDEX =16;
    static  FIX_ARTIFACTS_BY_STRECHING_TEXEL = true;

    constructor()
    {

        this.colors = [];
        this.vertices = [];
        this.uvs = [];
        this.indices = [];


        this.texture = null;

        this.vertexCount  = 0;
        this.vertexIndex  = 0;

        this.invTexWidth  = 1;
        this.invTexHeight = 1;

        this.depth = 0.0;


        this.colorr=1.0;
        this.colorg=1.0;
        this.colorb=1.0;
        this.colora=1.0;

        this.flip_x = false;
        this.flip_y = false;

        this.depth=0;
        this.flags = 0;
        this.triangles =0;
        this.Init();        
    }


    Init()
    {
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
      
    }

   

    Clear()
    {
      
        this.colors = [];
        this.vertices = [];
        this.uvs = [];
        this.indices = [];

        this.vertexCount  = 0;
        this.vertexIndex  = 0;

        this.Update();
    }
 
    SetColor (color)
    {
        this.colorr = color.r;
        this.colorg = color.g;
        this.colorb = color.b;
        this.colora = color.a;
    }


    Update()
    {
        if (this.texture === null || this.texture === undefined)  
        {
            throw new Error('[Render] The texture is not set.');
        };
      
       if (this.flags & SpriteCloud.VBOVERTEX)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~SpriteCloud.VBOVERTEX;
        }
        
       if (this.flags & SpriteCloud.VBOCOLOR)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~SpriteCloud.VBOCOLOR;
        }

       if (this.flags & SpriteCloud.VBOUV)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.flags &= ~SpriteCloud.VBOUV;
        }

        if (this.flags & SpriteCloud.VBOINDEX)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this.flags &= ~SpriteCloud.VBOINDEX;
        }
        this.flags = 0;
 

    }


    Release()
    {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vertexArray);
    }

    SetTexture(texture)
    {
        this.texture = texture;
        this.invTexWidth =  1.0 / texture.width;
        this.invTexHeight = 1.0 / texture.height;
    }

 
    ScaleVertex(factorX, factorY)
    {
        let no_verts = this.vertices.length;
        for (let i = 0; i < no_verts; i += 3)
        {
            this.vertices[i] *= factorX;
            this.vertices[i + 1] *= factorY;
        }
        this.flags |= SpriteCloud.VBOVERTEX;
    }
    ScaleTexCoords(factorX, factorY)
    {
        let no_uvs = this.uvs.length;
        for (let i = 0; i < no_uvs; i += 2)
        {
            this.uvs[i] *= factorX;
            this.uvs[i + 1] *= factorY;
        }
        this.flags |= SpriteCloud.VBOUV;
    }
   



    Render()
    {

        if (this.vertexCount === 0) return;
        this.Update();

      
        if (this.texture === null || this.texture === undefined)  
        {
            throw new Error('[Render] The texture is not set.');
        };

   
        Core.EnableBlend(true);
        Core.SetBlendMode(BlendMode.Normal);
        Core.SetTextureShader();
     
        this.texture.Use();
     
  

        gl.bindVertexArray(this.vertexArray);
       
        Core.DrawElements(gl.TRIANGLES, (this.vertexCount / 4) * 6,  0);

     //   console.log("DrawElements " + (this.vertexCount / 4));


        gl.bindVertexArray(null);
  

    }

    Transform(matrix)
    {
        if (this.vertices.length === 0) return;
        let no_verts = this.vertices.length / 3;

        let is2D = matrix instanceof Matrix2D;
 
        for (let i = 0; i < no_verts; i++)
        {
            let x = this.vertices[i * 3];
            let y = this.vertices[i * 3 + 1];
            let z = this.vertices[i * 3 + 2];

            if (is2D)
            {
                this.vertices[i * 3] = matrix.a * x + matrix.c * y + matrix.tx;
                this.vertices[i * 3 + 1] = matrix.d * y + matrix.b * x + matrix.ty;
                this.vertices[i * 3 + 2] = z;
            } else 
            {
                        console.log("TODO: 3D Transform PolySprite");
            }
        }
        this.flags |= PolySprite.VBOVERTEX;
    }

    AddQuad(x1, y1, x2, y2, x3, y3, x4, y4, u1, v1, u2, v2, u3, v3, u4, v4)
    {
        this.vertices.push(x1);        this.vertices.push(y1);        this.vertices.push(this.depth);
        this.uvs.push(u1);        this.uvs.push(v1);
        this.colors.push(this.colorr);
        this.colors.push(this.colorg);
        this.colors.push(this.colorb);
        this.colors.push(this.colora);

        this.vertices.push(x2);        this.vertices.push(y2);        this.vertices.push(this.depth);
        this.uvs.push(u2);        this.uvs.push(v2);
        this.colors.push(this.colorr);
        this.colors.push(this.colorg);
        this.colors.push(this.colorb);
        this.colors.push(this.colora);

        this.vertices.push(x3);        this.vertices.push(y3);        this.vertices.push(this.depth);
        this.uvs.push(u3);        this.uvs.push(v3);
        this.colors.push(this.colorr);
        this.colors.push(this.colorg);
        this.colors.push(this.colorb);
        this.colors.push(this.colora);

        this.vertices.push(x4);        this.vertices.push(y4);        this.vertices.push(this.depth);
        this.uvs.push(u4);        this.uvs.push(v4);
        this.colors.push(this.colorr);
        this.colors.push(this.colorg);
        this.colors.push(this.colorb);
        this.colors.push(this.colora);



        //add indices
        let index = this.vertexCount ;
        this.indices.push(index);
        this.indices.push(index + 1);
        this.indices.push(index + 2);
        this.indices.push(index);
        this.indices.push(index + 2);
        this.indices.push(index + 3);


        this.vertexCount += 4;
        this.indexCount += 6;

        this.flags |= SpriteCloud.VBOVERTEX | SpriteCloud.VBOCOLOR | SpriteCloud.VBOUV ;
        
        this.flags |= SpriteCloud.VBOINDEX;

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

    Add( x, y, width, height)
    {
     
          
        let left = 0;
        let right = 1;
        let top = 0;
        let bottom = 1;
    

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
       

      

        let fx2 = x + width;
        let fy2 = y + height;

        this.AddQuad(x, y, 
                     x, fy2, 
                     fx2, fy2, 
                     fx2, y, 
                     left, top, 
                     left, bottom, 
                     right, bottom, 
                     right, top);



    }
    AddTiled( x, y, width, height, src_x, src_y, src_width, src_height)
    {
        let left = 0;
        let right = 1;
        let top = 0;
        let bottom = 1;
        let widthTex = this.texture.width;
        let heightTex = this.texture.height;

        if (SpriteCloud.FIX_ARTIFACTS_BY_STRECHING_TEXEL)
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

        let fx2 = x + width;
        let fy2 = y + height;

        this.AddQuad(x, y, 
                     x, fy2, 
                     fx2, fy2, 
                     fx2, y, 
                     left, top, 
                     left, bottom, 
                     right, bottom, 
                     right, top);

    


    }

  
}
//********************************************************************************************************************************************/
class TileLayer 
{
    imageWidth = 0;
    imageHeight = 0;
    depth = 0;
    numRows = 1;
    numCols = 1;
    numTiles =0xffffff;


    constructor(width, height, tileWidth, tileHeight)
    {
        this.tiles = [];
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.width = width;
        this.height = height;
        this.texture =  Core.defaultTexture;
       
   


    }

    LoadTiles(data)
    {
        let lines = data.split('\n');
        this.tiles=[];
        for (let y = 0; y < this.height; y++)
        {
            let tokens = lines[y].split(',');
            for (let x = 0; x < this.width; x++)
            {
                this.tiles[y * this.width + x] = parseInt(tokens[x]);
            }
        }
    }

    Fill(tile)
    {
        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.SetTile(x, y, tile);
            }
        }
    }
    FillRandom(min, max)
    {
        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.SetTile(x, y, RandomInt(min, max));
            }
        }
    }

    SetTile(x, y, tile)
    {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.tiles[y * this.width + x] = tile;
    }

    GetTile(x, y)
    {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        return this.tiles[y * this.width + x];
    }

    GetTileSourceRect(id)
    {
        if (!this.texture) 
        {
            console.error("Texture not set. Please call SetTexture(texture) first.");
            return;
        }
        this.imageWidth  = this.texture.width;
        this.imageHeight = this.texture.height;

        let cols  = Math.floor( this.imageWidth/this.tileWidth);
        let clip_x =( id  %  cols) *  this.tileWidth;
        let clip_y = Math.floor(id  / cols) * this.tileHeight ;

         //    console.log("numCols: " + this.numCols + " numRows: " + this.numRows + " numTiles: " + this.numTiles + " imageWidth: " + this.imageWidth + " imageHeight: " + this.imageHeight);



      //  console.log("numCols: " + cols + " imageWidth: " + this.imageWidth + " imageHeight: " + this.imageHeight);

        return {x: clip_x, y: clip_y};
    }
    SetTexture(texture)
    {
        this.texture = texture;
        this.imageWidth  = this.texture.width;
        this.imageHeight = this.texture.height;
        
        this.numCols =Math.floor(this.imageWidth  / this.tileWidth);
        this.numRows =Math.floor(this.imageHeight / this.tileHeight);
        this.numTiles = this.numRows * this.numCols;
   
      //  console.log("numCols: " + this.numCols + " numRows: " + this.numRows + " numTiles: " + this.numTiles + " imageWidth: " + this.imageWidth + " imageHeight: " + this.imageHeight);


    }



   

}
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
    
        this.clip = new Rectangle(0, 0, Core.GetWidth(), Core.GetHeight());
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

     
        Core.SetBlend(true);
        Core.SetBlendMode(BlendMode.Normal);

             

        let shader = Core.GetShader("texture");
        Core.SetShader(shader);

       
 
       
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
       gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.vertexIndex));
       gl.bindBuffer(gl.ARRAY_BUFFER, null);


  

      

        Core.SetTexture(this.texture);
      //  this.texture.Use();
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