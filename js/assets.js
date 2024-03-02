"use strict";




class Assets
{
    static imagesToLoad = [];
    static audioToLoad = [];
    static texturesToLoad = [];

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


    static async LoadImage(name, src) 
    {
        await Assets.Delay(Assets.DefaultDelay);
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

    static async LoadAll()
    {
        this.total = this.imagesToLoad.length + this.audioToLoad.length + this.texturesToLoad.length;
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
        this.audioToLoad = [];
        this.imagesToLoad = [];
        this.texturesToLoad = [];
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