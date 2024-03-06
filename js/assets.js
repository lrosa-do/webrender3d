"use strict";




class Assets
{
    static imagesToLoad = [];
    static audioToLoad = [];
    static texturesToLoad = [];
    static cubeTexturesToLoad = [];

    static images = {};
    static textures = {};
    static audio = {};


    static progress = 0;
    static total = 0;
    static DefaultDelay = 1000;

    static Init()
    {
        console.log("Init");
        this.OnProgress = function(filename, progress,  total){};
        this.OnComplete = function(){};
        this.OnLoad= function(filename){};

    }

    static Ready()
    {
        return this.progress === this.total;
    }

  


    static ClearImages()
    {
        this.images = {};
    }
    static ClearTexture()
    {
        for (let key in this.textures)
        {
            this.textures[key].Release();
        }
        this.textures = {};
    }
    static ClearAudio()
    {
        this.audio = {};
    }
    static  Clear()
    {
        this.audioToLoad = [];
        this.imagesToLoad = [];
        this.texturesToLoad = [];
        this.ClearImages();
        this.ClearTexture();
        this.ClearAudio();
    }




    static Progress(filename, progress, total)
    {
       // console.log("Progresso: " + this.progress + "/" + this.total);
        this.OnProgress(filename, progress, total);
    }
    static Delay(delayTime)
     {
        return new Promise((resolve) => 
        {
            setTimeout(() => 
            {
                console.log("Delay: " + delayTime);
                resolve();
            }, delayTime);
        });
    
    }



    static async LoadAudio(name, src)
    {
       // await Assets.Delay(Assets.DefaultDelay);
        return new Promise((resolve) => 
        {

        

            // resolve();
            // Assets.progress++;
            // Assets.Progress(src, Assets.progress, Assets.total);
        
            const audio = new Audio();
            audio.oncanplaythrough = () => 
            {
                Assets.progress++;
                Assets.Progress(src, Assets.progress, Assets.total);
                this.audio[name] = audio;
                this.OnLoad(src);
                resolve();
            };
            audio.src = src;
        });
    } 

    static async GetQueueTexture(name)
    {
        return new Promise(async (resolve) => 
        {
            while (this.textures[name] === undefined) 
            {
                console.log("Waiting for texture ...");
                await new Promise(innerResolve => setTimeout(innerResolve, 500));
            }
            resolve(this.textures[name]);
        });

    }
    
    static async LoadTexture(name, src)
    {
       // await Assets.Delay(Assets.DefaultDelay);
        return new Promise((resolve,reject) => 
        {
                    

            const image = new Image();
            image.onload = () => 
            {
                const texture = new Texture2D();
                if (texture.Load(image)) 
                {
                    texture.name = name;
                    this.textures[name] = texture;
                    Assets.progress++;
                    Assets.Progress(src, Assets.progress, Assets.total);
                    this.OnLoad(src);
                    resolve();
                } 
                else 
                {
                    console.error('Erro ao carregar a textura:', src);
                    reject();
                }
            };
           image.src = src;
        });
    }

    static async LoadTextureCube(name, list)
    {
       // await Assets.Delay(Assets.DefaultDelay);
       return new Promise((resolve) => 
       {
                    
            
            Assets.progress++;
            Assets.Progress(name, Assets.progress, Assets.total);

            console.log("Build Cube Texture  "+name+ "   " +list);
            const texture = new TextureCube();
            texture.name = name;
            this.textures[name] = texture;
            let images =[];
            images.push(Assets.GetImage(list+"0"));
            images.push(Assets.GetImage(list+"1"));
            images.push(Assets.GetImage(list+"2"));
            images.push(Assets.GetImage(list+"3"));
            images.push(Assets.GetImage(list+"4"));
            images.push(Assets.GetImage(list+"5"));
           
            texture.Build(images);

        
            resolve();
           
            // const images =[];
            // console.log("Load images to cube ...");
 
            // let index =0;
            // for (let i = 0; i < list.length; i++)
            // {
            //     const image = new Image();
            //     image.onload = () => 
            //     {
                    
            //             Assets.progress++;
            //             Assets.Progress(list[i], Assets.progress, Assets.total);
            //             this.OnLoad(list[i]);
            //             images.push(image);
              
            //             index++;
            //             if (index >= 6) 
            //             {
                          
                          
            //                 console.log("Build Cube Texture ...");
            //                 const texture = new TextureCube();
            //                 texture.name = name;
            //                 this.textures[name] = texture;
            //                 texture.Build(images);
            //         //        resolve();
                          
                        
            //             }
                      
                  
            //     };
            //     image.src = list[i];
            // }

          
        });
    }

    static async LoadImage(name, src) 
    {
      //  await Assets.Delay(Assets.DefaultDelay);
        return new Promise((resolve) => 
        {
           

            //             Assets.progress++;
            //      Assets.Progress(src, Assets.progress, Assets.total);

            
            // resolve();
           
         
            const image = new Image();
            image.onload = () => 
            {
                this.images[name] = image;
                Assets.progress++;
                Assets.Progress(src, Assets.progress, Assets.total);
                this.OnLoad(src);
   
                resolve();
            };
            image.src = src;
        });
    }

    static async LoadFile(filename) 
    {
        return new Promise((resolve, reject) => 
        {
            fetch(filename)
                .then(response => 
                    {
                    if (!response.ok)
                    {
                        throw new Error('Erro ao carregar o arquivo');
                    }
                    this.OnLoad(filename);
                    return response.text();
                })
                .then(data =>
                    {
                    resolve(data);
                })
                .catch(error => 
                    {
                    console.error('Erro ao carregar o arquivo:', error);
                    reject(error);
                });
        });
    }

    static AddTexture(name, filename)
    {
        this.texturesToLoad.push({name: name, src: filename});
    }

    static AddImage(name, filename)
    {
        this.imagesToLoad.push({name: name, src: filename});
    }

    static AddAudio(name, filename)
    {
        this.audioToLoad.push({name: name, src: filename});
    }

    static AddTextureCube(name, list)
    {
        this.cubeTexturesToLoad.push({name: name, start: list});
    }

    static async LoadAll()
    {
        this.total = this.imagesToLoad.length + this.audioToLoad.length + this.texturesToLoad.length + this.cubeTexturesToLoad.length;
        this.progress = 0;
        for (let i = 0; i < this.imagesToLoad.length; i++)
        {
            await this.LoadImage(this.imagesToLoad[i].name, this.imagesToLoad[i].src);
        }
        for (let i = 0; i < this.audioToLoad.length; i++)
        {
            await this.LoadAudio(this.audioToLoad[i].name, this.audioToLoad[i].src);
        }
        for (let i = 0; i < this.texturesToLoad.length; i++)
        {

           await this.LoadTexture(this.texturesToLoad[i].name, this.texturesToLoad[i].src);
        }

        for (let i = 0; i < this.cubeTexturesToLoad.length; i++)
        {
            await this.LoadTextureCube(this.cubeTexturesToLoad[i].name, this.cubeTexturesToLoad[i].start);
        }
        this.audioToLoad = [];
        this.imagesToLoad = [];
        this.texturesToLoad = [];
        this.cubeTexturesToLoad = [];
        this.OnComplete();

    }


    static SaveBinaryFile(filename, arrayBuffer)
    {
        let blob = new Blob([arrayBuffer], {type: "application/octet-stream"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);

        a.type='application/octet-stream';
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        document.body.removeChild(a);
    }

    static SaveTextFile(filename, text)
    {
        let blob = new Blob([text], {type: "text/plain"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);

        a.type='text/plain';
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);   
    }
    

    static ExportImage(src,saveName)
    {
        
                const image = new Image();
                image.onload = () => 
                {
                    
                    let canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);
                const dataArray = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                    const uint8Array = new TextEncoder().encode(canvas.toDataURL("image/png"));
                    Assets.SaveTextFile(saveName, uint8Array);
                        
                };
                image.src = src;


    }

    static GetImage(name)
    {
        let image = this.images[name];
        if (image)
        {
            return image;
        } else 
        {
            console.warn('Imagem não encontrada: ' + name);
        }
    }

    static GetTexture(name)
    {
        let texture = this.textures[name];
        if (texture)
        {
            return texture;
        } else 
        {
           console.warn('Textura não encontrada: ' + name);
        }
    }

    static SetTexture(name)
    {
        let texture = this.textures[name];
        if (texture)
        {
            texture.Use();
        } else 
        {
            throw new Error('Textura não encontrada: ' + name);
        }
    }



      
}


/*
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g1 = 0;
		var _g = len;
		while(_g1 < _g) {
			var i = _g1++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
$hxClasses["js.html.compat.ArrayBuffer"] = js_html_compat_ArrayBuffer;
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null ? null : end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	this.offset = byteOffset == null ? 0 : byteOffset;
	this.length = byteLength == null ? buffer.byteLength - this.offset : byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) {
		throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
	}
	this.byteLength = this.length;
	this.byteOffset = this.offset;
	this.buffer = this.buf;
};
$hxClasses["js.html.compat.DataView"] = js_html_compat_DataView;
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) {
			return v - 256;
		} else {
			return v;
		}
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) {
			return v - 65536;
		} else {
			return v;
		}
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) {
			return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8;
		} else {
			return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
		}
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) {
			return a | b << 8 | c << 16 | d << 24;
		} else {
			return d | c << 8 | b << 16 | a << 24;
		}
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) {
			return v + 4294967296.;
		} else {
			return v;
		}
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian ? a : b,littleEndian ? b : a);
	}
	,setInt8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value < 0 ? value + 128 & 255 : value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0 ? value + 65536 : value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
*/