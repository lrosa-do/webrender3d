"use strict";




class Gui 
{
    static Init()
    {
        let count = 1024;
        this.line   = new LineBatch(count);
        this.fill    = new FillBatch(count);
        this.sprites = new SpriteBatch(count);
        this.font = Core.GetDefaultFont();
  
   
        this.ID = 0;
        this.FocusId = 0;
        this.X=0;
        this.Y=0;
        this.lastX=0;
        this.lastY=0;
        this.WIDTH=0;
        this.HEIGHT=0;
        this.isBegin = false;
        this.visible = true;
        this.hasFocus = false;
  
     
        this.theme = 
        {
            backgroundColor: new Color(0.5,0.5,0.5,1),
            overColor: new Color(0.43, 0.41, 0.48,1),
            checkBoxSelectedColor: new Color(0.1, 0.1, 0.1,1),
            buttonColor: new Color(0.5,0.5,0.5,1),
            buttonOverColor: new Color(0.93, 0.81, 0.98,1),
            buttonLabelColor: new Color(0.8,0.8,0.8,1),
            sliderFillColor: new Color(0.53, 0.81, 0.98,1),
            progressBarFillColor: new Color(0.3, 0.91, 0.3,1),
            editCursorColor: new Color(0.8, 0.3, 0.3,1),
            editFontColor: new Color(1,1,1,1),
            editFontColorDeactive: new Color(0.89,0.89,0.89,1),
            panelColor : new Color(30/225.0,30/225.0,30/225.0, 0.8),
            windowColor: new Color(0.2,0.2,0.2,1),
            windowBarColor: new Color(0.4,0.4,0.6,1),
            fontOverColor: new Color(0.9, 0.9, 0.99,1),
            fontColor: new Color(1,1,1,1),
            fontOverSize: 20,
            fontSize: 18,
        };
        this.window= {x:0,y:0,enable:false,dragging:false,focus:false,visible:true,id:0,star_x:0,start_y:0,width:0,height:0,dragX:0,dragY:0};
        
    }



    static SetCursor(cursor)
    {
       // if (canvas.style.cursor !== cursor) 
        //    canvas.style.cursor = cursor;
    }

    static Release()
    {
        this.line.Release();
        this.fill.Release();
        this.sprites.Release();
    }

    static Render()
    {
  
        this.fill.Render();
        this.line.Render();
 
        this.sprites.Render();
        this.font.Render();
     
        this.ID = 0;

        this.font.SetClip(0,0,Core.GetWidth(),Core.GetHeight()); 
        this.font.DisableClip();
         
    }
    static HasFocus()
    {
        return this.hasFocus;
    }
    static Begin(x=0,y=0,w=0,h=0,options={})
    {
        this.isBegin = true;
        this.ID++;

       // Core.EnableScissor(true);
       // Core.SetScissor(X, Y, WIDTH, HEIGHT);
    
    
        this.fill.SetColor(WHITE);
        this.line.SetColor(WHITE);
        this.sprites.SetColor(WHITE);
        this.font.SetColor(WHITE);

        this.mouse_last_x = Mouse.X;
        this.mouse_last_y = Mouse.Y;

        this.window.id = this.ID-1;
  
        let dragging = options.dragging || false;
        let bar = options.bar || false;
        let background = options.background || false;
        let title = options.title || "";
        let barHeight = 20;
        if (!this.window.enable)
        {
            this.window.x = x;
            this.window.y = y;
            this.window.width = w;
            this.window.height = h;
            this.window.enable = true;
        }
        
        let X = this.window.x;
        let Y = this.window.y;
        let WIDTH = this.window.width;
        let HEIGHT = this.window.height;

      //  Core.EnableScissor(true);
       // Core.SetScissor(X, Y-barHeight, WIDTH, HEIGHT);
        this.line.SetClip(X, Y-barHeight, WIDTH, HEIGHT);
        this.fill.SetClip(X, Y-barHeight, WIDTH, HEIGHT);
        this.sprites.SetClip(X, Y-barHeight, WIDTH, HEIGHT);
        this.font.SetClip(X, Y, WIDTH, HEIGHT);
 

        
        let OnBar = PointInRect(Mouse.X, Mouse.Y, X, Y-barHeight, WIDTH, barHeight);
        let OnTerminal = PointInRect(Mouse.X, Mouse.Y, X + WIDTH-25, Y-barHeight+4, 20, barHeight-8);

        this.hasFocus = ( (PointInRect(Mouse.X, Mouse.Y, X, Y, WIDTH, HEIGHT) || OnBar || OnTerminal || this.window.dragging))  ;


        if (OnTerminal && Input.IsMousePressed(0))
        {
            this.visible = !this.visible;
        }

    
        
        if (background &&  this.visible)
        {
           
            this.fill.SetColor(this.theme.windowColor);
            this.fill.Rectangle(X, Y, WIDTH, HEIGHT);
        }

        if (OnBar)
        {
            this.line.SetColor(GRAY);
            this.line.Rectangle(X-1, Y-barHeight-2, WIDTH+1, barHeight+3);
        

        }

        if (dragging)
        {
           
            if ( (OnBar || this.window.dragging) && Input.IsMouseDown(0))
            {
               
                
                if (!this.window.dragging)
                {
                    this.window.dragging = true;
                    this.window.dragX = Mouse.X - this.window.x;
                    this.window.dragY = Mouse.Y - this.window.y;
                }

                this.window.x = Mouse.X - this.window.dragX;
                this.window.y = Mouse.Y - this.window.dragY;
        
            } 

            if (this.window.dragging && Input.IsMouseReleased(0))
            {
                this.window.dragging = false;
            }

        }
       
    


        if (bar)
        {

            
            this.fill.SetColor(this.theme.windowBarColor);
            this.fill.Rectangle(X, Y-barHeight, WIDTH, barHeight);


  
            
            if (this.visible)
            {

                this.fill.SetColor(GREEN);
                this.fill.Rectangle( X + WIDTH-25, Y-(barHeight *0.5)-5, 20, 10);
        
            } else 
            {
                this.fill.SetColor(RED);
                this.fill.Rectangle( X + WIDTH-25, Y-barHeight+4, 20, barHeight-8);
                this.hasFocus = false;
        
            }
           

            this.font.SetSize(20);
            this.font.SetAllignment("left");
            let offY = Y - barHeight *0.5 - (this.font.GetMaxHeight() * 0.5);
            this.font.Print(X +5, offY ,title);
        }

        this.X = this.window.x;
        this.Y = this.window.y;
        this.WIDTH  = this.window.width;
        this.HEIGHT = this.window.height;


    }

    static End()
    {
        this.isBegin = false; 
 
    
       
    }

    

    static Line(x1, y1, x2, y2, color = WHITE)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
        if (!this.visible) return;
        
        this.X = this.window.x;
        this.Y = this.window.y;

        this.line.SetColor(color);

        this.line.Line(this.X + x1, this.Y + y1, this.X + x2, this.Y + y2);
    }

    static Rectangle(x, y, w, h, color = WHITE, fill = false)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
        if (!this.visible) return;
        
        this.X = this.window.x;
        this.Y = this.window.y;

        if (fill)
        {
            this.fill.SetColor(color);
            this.fill.Rectangle(this.X + x, this.Y + y, w, h);

        } 
        else
        {
            this.line.SetColor(color);
            this.line.Rectangle(this.X + x, this.Y + y, w, h);
        }
    }
    static Text(x, y, text)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
        if (!this.visible) return ;
    
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;

        this.font.SetColor(this.theme.fontColor);
        this.font.SetSize(this.theme.fontSize);
        this.font.SetAllignment("left");
        this.font.Print( X,Y, text);
    }

    static Panel(x, y, w, h)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }

        if (!this.visible) return;
  
        this.ID++;
        
        let X = this.X - x;
        let Y = this.Y - y;
        let WIDTH  = w;
        let HEIGHT = h;
         
        this.fill.SetColor(this.theme.panelColor);
        this.fill.Rectangle( X, Y, WIDTH, HEIGHT);
    }

    static Slider(x, y, w, h, labelLeft,labelRight, min, max, value)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }

        if (!this.visible) return value;
    
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     


        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y, X, Y, WIDTH, HEIGHT);
        let isPressed = false;
      

        if (isOver && Input.IsMouseDown(0))
        {
              isPressed = true;
        }
  


        this.fill.SetColor(this.theme.backgroundColor);
        this.fill.Rectangle(X, Y, WIDTH, HEIGHT);
        if (isOver)
        {
           this.line.SetColor(this.theme.overColor);
           this.line.Rectangle(X-1, Y-1, WIDTH+2, HEIGHT+2);
            this.SetCursor("pointer");
            this.FocusId = this.ID-1;
        }
  
     


        if (isPressed)
        {
            value = min + (max - min) * ((mouse_x - X) / WIDTH);
    
           
        }

        let percent = (value - min) / (max - min);
        
    
     
        this.fill.SetColor(this.theme.sliderFillColor);
        this.fill.Rectangle(X, Y, WIDTH * percent, HEIGHT);
      
      
        if (isOver)
        {
            this.font.SetColor(this.theme.fontOverColor);
            this.font.SetSize(this.theme.fontOverSize);
          

        } else 
        {
            this.font.SetColor(this.theme.fontColor);
            this.font.SetSize(this.theme.fontSize);
       
        }
        
        if (labelLeft !== "")
        {
            this.font.SetAllignment("right");
            let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
            this.font.Print(X-10,offY,labelLeft);
        }
        if (labelRight !== "")
        {
            this.font.SetAllignment("left");
            let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
            this.font.Print(X+WIDTH+10,offY,labelRight);
        }
        
           return value;
           

    }

    static VerticalSlider(x, y, w, h, labelTop,labelBottom, min, max, value)
    {
            
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
    
        if (!this.visible) return value;
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     

            let mouse_x = Mouse.X;
            let mouse_y = Mouse.Y;

            let isOver = PointInRect( mouse_x, mouse_y, X, Y-2, WIDTH, HEIGHT+2);
            let isPressed = false;
      

            if (isOver && Input.IsMouseDown(0))
            {
                isPressed = true;
              
            }

            this.fill.SetColor(this.theme.backgroundColor);
            this.fill.Rectangle(X, Y, WIDTH, HEIGHT);

            if (isOver)
            {
                this.line.SetColor(this.theme.overColor);
                this.line.Rectangle(X-1, Y-1, WIDTH+2, HEIGHT+2);
                this.SetCursor("pointer");
                this.FocusId = this.ID-1;
            }

            if (isPressed)
            {
                value = min + (max - min) * ((mouse_y - Y) / HEIGHT);
            }

            let percent = (value - min) / (max - min);

            this.fill.SetColor(this.theme.sliderFillColor);
            this.fill.Rectangle(X, Y, WIDTH, percent * HEIGHT);

            if (isOver)
            {
                this.font.SetColor(this.theme.fontOverColor);
                this.font.SetSize(this.theme.fontOverSize);
            }
            else
            {
                this.font.SetColor(this.theme.fontColor);
                this.font.SetSize(this.theme.fontSize);
            }

            if (labelTop !== "")
            {
                this.font.SetAllignment("center");
                let offX = X +(WIDTH * 0.5);// - (this.font.GetMaxWidth() * 0.5) + (this.font.GetMaxWidth() * 0.5);
                let offY = Y  - this.font.GetMaxHeight();
                this.font.Print(offX, offY,labelTop);
            }

            if (labelBottom !== "")
            {
                this.font.SetAllignment("center");
                let offX = X +(WIDTH * 0.5) - (this.font.GetMaxWidth() * 0.5);
                this.font.Print(offX,Y+HEIGHT+10,labelBottom);
            }

            return value;
    }
    
       


   static ProgressBar(x, y, w, h, label,  max, value)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }

        
        if (!this.visible) return value;
    
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     
        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y, X, Y, WIDTH, HEIGHT);



        this.fill.SetColor(this.theme.backgroundColor);
        this.fill.Rectangle( X, Y, WIDTH, HEIGHT);
        this.fill.SetColor(this.theme.progressBarFillColor);
        this.fill.Rectangle( X, Y, WIDTH * (value / max), HEIGHT);
        if (isOver)
        {
            this.FocusId = this.ID-1;
        }

        if (label !== null)
        {
            if (label !== "")
            {
                this.font.SetColor(this.theme.fontColor);
                this.font.SetSize(this.theme.fontSize);
                this.font.SetAllignment("center");
                let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
                this.font.Print(X+(WIDTH*0.5),offY,label);
            }
        }
        
     
        return value;
    }
    
    static CheckBox(x, y, w, h, label, value)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return false;
        }
    
        
        if (!this.visible) return value;
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     


        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y ,X-1, Y-1, WIDTH+1, HEIGHT+1);
        let isPressed = false;
 

        if (isOver && Input.IsMousePressed(0))
        {
              isPressed = true;
            
        }
 
        this.fill.SetColor(this.theme.backgroundColor);
        this.fill.Rectangle(X, Y, WIDTH, HEIGHT);
        if (isOver)
        {
            this.line.SetColor(this.theme.overColor);
            this.line.Rectangle(X-1, Y-1, WIDTH+2, HEIGHT+2);
            this.SetCursor("pointer");
            this.FocusId = this.ID-1;
        }

        if (isPressed)
        {
            value = !value;
        }

        if (value)
        {
            
            this.fill.SetColor(this.theme.checkBoxSelectedColor);
            this.fill.Rectangle(X+2, Y+2, WIDTH-4, HEIGHT-4);

          //  x+5, y+5, w-10, h-10       
         }

        if (isOver)
        {
            this.font.SetColor(this.theme.fontOverColor);
            this.font.SetSize(this.theme.fontOverSize);

        } else 
        {
            this.font.SetColor(this.theme.fontColor);
            this.font.SetSize(this.theme.fontSize);
    
        }
        
        let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
        let offX = X + WIDTH + (this.font.GetMaxWidth() * 0.5);
        this.font.SetAllignment("left");
        this.font.Print(offX,offY,label);
        return value;

    }
   static Button(x, y, w, h, label)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
        if (!this.visible) return ;
    
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
      

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y, X-1, Y-1, WIDTH+2, HEIGHT+2);
        let isPressed = false;
        if (isOver && Input.IsMousePressed(0))
        {
              isPressed = true;
              
        }
      


        this.fill.SetColor(this.theme.backgroundColor);
        let move =0;
        if (isPressed)
        {
            move = 2;
        }
        this.fill.Rectangle(X +move, Y + move, WIDTH, HEIGHT);
        
        if (isOver)
        {
            this.line.SetColor(this.theme.overColor);
          
            this.line.Rectangle(X-1, Y-1, WIDTH+2, HEIGHT+2);
            
            this.font.SetColor(this.theme.fontOverColor);
            this.font.SetSize(this.theme.fontOverSize);
            if (isPressed)
            {
                this.font.SetSize(this.theme.fontOverSize+2);
            }
            this.SetCursor("pointer");
            this.FocusId = this.ID-1;

        } else 
        {
            this.font.SetColor(this.theme.buttonLabelColor);
            this.font.SetSize(this.theme.fontSize);
    
        }
        
        let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
        this.font.SetAllignment("center");
        this.font.Print(X+(WIDTH*0.5),offY,label);


        
        if (isOver && Input.IsMouseReleased(0))
        {
            isPressed = false;
            isOver = false;
        }

        return isPressed;
    }   

    static ImageButton(x, y, w, h, base, over)
    {
         if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
    
        if (!this.visible) return ;
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y,X-1, Y-1, WIDTH+2, HEIGHT+2);
        let isPressed = false;
        if (isOver && Input.IsMousePressed(0))
        {
              isPressed = true;
              this.SetCursor("pointer");
              this.FocusId = this.ID-1;
        }
        if (isOver)
        {
            this.fill.SetColor(this.theme.overColor);
            this.fill.Rectangleline(X-1, Y-1, WIDTH+2, HEIGHT+2);
        } 
        if (base !== null && !isOver)
        {      
              this.sprites.Draw(base, X, Y, WIDTH, HEIGHT);
        }
        if (over !== null && isOver)
        {
              this.sprites.Draw(over, X, Y, WIDTH, HEIGHT);
        }
        return isPressed;
    }

    static Label(x, y, label,size=0)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
        if (!this.visible) return ;
    
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;

        let width = this.font.GetTextWidth(label);
        let height = this.font.GetMaxHeight();

        let WIDTH  = width;
        let HEIGHT = height;
     

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;

       

        let isOver = PointInRect( mouse_x, mouse_y, X, Y, WIDTH, HEIGHT);

        if (isOver)
        {
            this.FocusId = this.ID-1;
        }


        this.font.SetColor(this.theme.fontColor);
        if (size === 0)
        {
            this.font.SetSize(this.theme.fontSize);
        } else 
        {
            this.font.SetSize(size);
        }
        this.font.SetAllignment("center");
        this.font.Print( X,Y, label);
    }

    static InputText(x, y, w, h, obj)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
        
       
    
        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y, X-1, Y-1, WIDTH+1, HEIGHT+1);
        let selected = obj.selected;
        let text = obj.text;
        let state = false;
        if (!this.visible) return state;

        
        this.ID++;



        if (this.FocusId !== this.ID-1)
        {
            selected = false;
          
           // text = campoTexto.value;
           // campoTexto.blur();
            

        }
    

        if (isOver)
        {
            this.SetCursor("text");
            if (Input.IsMousePressed(0))
            {
                selected = true;   
               // campoTexto.focus();    
               // campoTexto.value = text;        
                        
            }
        }

        if (Input.IsMousePressed(0) &&  !isOver &&  selected)
        {
            selected = false;
        //     if (isMobile())
        //     {
        //    // text =  campoTexto.value;
        //     campoTexto.blur();
        //     }
        }
  
        this.fill.SetColor(this.theme.backgroundColor);
        this.fill.Rectangle(X, Y, WIDTH, HEIGHT);
        let clip = this.sprites.GetClip();
        if (selected)
        {
            this.line.SetColor(this.theme.fontOverColor);
            this.line.Rectangle(X-1, Y-1, WIDTH+2, HEIGHT+2);
            this.FocusId = this.ID-1;
        }
  
  
        if (selected)
        {
            this.font.SetColor(this.theme.editFontColor);
            this.font.SetSize(this.theme.fontOverSize);
            this.SetCursor("text");

        } else 
        {
            this.font.SetColor(this.theme.editFontColorDeactive);
            this.font.SetSize(this.theme.fontSize);
    
        }
        let cursorX = X + this.font.GetTextWidth(text) + 2;
        if (cursorX > X + WIDTH - 2) cursorX = X + WIDTH - 2;

       

        if (selected && Input.IsAnyKeyPressed())
        {
            let char = Input.GetLastChar();
            let key = Input.GetLastKey();
            if (char==="Backspace")
            {
                text = text.substring(0, text.length - 1);
            } else 
            if (char==="Delete")
            {
                text = text.substring(0, text.length - 1);
            } else
            if (char === "Enter")
            {
                selected = false;
                state = true;
            }else
            if (char !== ""  && key>=32 && key<=126)
            {
                if (this.font.GetTextWidth(text + char) < WIDTH)
                {
                    text += char;
                }
                
            }   
           
            
        }

        this.sprites.SetClip(X, Y, WIDTH, HEIGHT);
        
        let offY = Y +(HEIGHT * 0.5) - (this.font.GetMaxHeight() * 0.5);
        this.font.SetAllignment("left");
        this.font.Print(X+1,offY,text);
   
        if (selected)
        {
           
            this.line.SetColor(this.theme.editCursorColor);

            Date.now() % 1000 > 500 ? this.fill.SetColor(this.theme.editCursorColor) : this.fill.SetColor(this.theme.backgroundColor);
            this.line.Line(cursorX, Y+2, cursorX, Y+HEIGHT-2) ;
        }

        this.sprites.SetClip(clip.x, clip.y, clip.width, clip.height);

        obj.text = text;
        obj.selected = selected;
        return state;
    }

    static Radio(x, y, w, h, label, value)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return false;
        }
    
        if (!this.visible) return value;
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
        let radius = Math.min(WIDTH, HEIGHT) * 0.5;
     

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver =  PointInRect( mouse_x, mouse_y, X-(WIDTH*0.5), Y - (HEIGHT * 0.5), WIDTH,HEIGHT);
        let isPressed = false;
        if (isOver && Input.IsMousePressed(0))
        {
              isPressed = true;
        }

        this.fill.SetColor(this.theme.backgroundColor);
        this.fill.Circle(X, Y, radius);
        if (isOver)
        {
            this.fill.SetColor(this.theme.overColor);
            this.fill.Circle(X, Y, radius+2);
        }

      //  this.line.Rectangle(X-(WIDTH*0.5), Y - (HEIGHT * 0.5), WIDTH,HEIGHT);

        if (isPressed)
        {
            value = !value;
        }

        if (value)
        {
            this.fill.SetColor(this.theme.checkBoxSelectedColor);
            this.fill.Circle(X, Y, radius * 0.5);
        }

        if (isOver)
        {
            this.font.SetColor(this.theme.fontOverColor);
            this.font.SetSize(this.theme.fontOverSize-2);
            this.FocusId = this.ID-1;
             this.SetCursor("pointer");   

        } else 
        {
            this.font.SetColor(this.theme.fontColor);
            this.font.SetSize(this.theme.fontSize+2);
    
        }

       // X-(WIDTH*0.5), 
        //Y - (HEIGHT * 0.5)

        
        let offY = Y - (this.font.GetMaxHeight() * 0.5);

        let offX = X +  (WIDTH *0.5)  + (this.font.GetMaxWidth() * 0.5);
        this.font.SetAllignment("left");
        this.font.Print(offX,offY,label);
        return value;
    }

    static RadioGroup(x, y, w, h, gap, cols, labels,boder=false,title="")
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
    
        if (!this.visible) return ;
        this.ID++;

        let count =labels.length;
   
        let space = 60;
        let index = -1;
        let row = 0;
        let col = 0;
        let offX = x;
        let offY = y;
        let X = this.X + x;
        let Y = this.Y + y;
 

        let maxWidth=1;
        let max_width = 0;
        let max_height = 0;
        for (let i = 0; i < count; i++)
        {
            let label = labels[i].caption;
            let width = this.font.GetTextWidth(label);
            if (width > maxWidth) maxWidth = width;
     
        }    
        space = (maxWidth + gap) + w;

 


        for (let i = 0; i < count; i++)
        {
            if (col >= cols)
            {
                col = 0;
                row++;
                offX = x ;
                offY += h + gap ;
            }
           let label = labels[i].caption;
           let value = labels[i].state;
           
           value = this.Radio(offX, offY, w, h, label, value);

            if (value)
            {
                index = i;
                for (let j = 0; j < count; j++)
                {
                     if (j !== i) labels[j].state = false;
                }
               
            }

            labels[i].state = value;
            

           
            col++;
            offX += w + space;
            


        }

        max_width  = (w + space) * cols +(w * 0.5);
        max_height = (h + gap) * (row+1) +h;

        if (boder)
        {
            this.line.SetColor(GRAY);
            //this.line.Rectangle(X-w, Y-h, max_width ,max_height);
            this.line.Line(X-w, Y-h, X-w, Y-h+max_height);
            this.line.Line(X-w, Y-h+max_height, X-w+max_width, Y-h+max_height);
            this.line.Line(X-w+max_width, Y-h+max_height, X-w+max_width, Y-h);
            
            let textWidth = this.font.GetTextWidth(title);

            this.line.Line(X-w, Y-h, X-1, Y-h);
            this.line.Line(X-w+textWidth+w, Y-h, X-w+max_width, Y-h);

            
            //this.line.Line(X-w+max_width, Y-h, X-w, Y-h);


        }
        if (title !== "")
        {
            this.font.SetColor(this.theme.fontColor);
            this.font.SetSize(this.theme.fontSize);
            this.font.SetAllignment("left");
            this.font.Print(w+X-w, Y-h-15,title);
        }

        return index;

    }

    static CheckBoxGroup(x, y, w, h, gap, cols, labels,boder=false,title="")
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return false;
        }
    
        if (!this.visible) return false;
        this.ID++;

        let count =labels.length;
   
        let space = 60;
        let index = -1;
        let row = 0;
        let col = 0;
        let offX = x;
        let offY = y;
        let X = this.X + x;
        let Y = this.Y + y;
 

        let maxWidth=1;
        let max_width = 0;
        let max_height = 0;
        for (let i = 0; i < count; i++)
        {
            let label = labels[i].caption;
            let width = this.font.GetTextWidth(label);
            if (width > maxWidth) maxWidth = width;
     
        }    
        space = (maxWidth + gap) + w;

 


        for (let i = 0; i < count; i++)
        {
            if (col >= cols)
            {
                col = 0;
                row++;
                offX = x ;
                offY += h + gap ;
            }
           let label = labels[i].caption;
           let value = labels[i].state;
           
           value = this.CheckBox(offX, offY, w, h, label, value);


            labels[i].state = value;
            

           
            col++;
            offX += w + space;
            


        }

        max_width  = (w + space) * cols +(w * 0.5);
        max_height = (h + gap) * (row+1) +h;

        if (boder)
        {
            this.line.SetColor(GRAY);
           // this.line.Rectangle(X-w, Y-h, max_width ,max_height);
           this.line.Line(X-w, Y-h, X-w, Y-h+max_height);
           this.line.Line(X-w, Y-h+max_height, X-w+max_width, Y-h+max_height);
           this.line.Line(X-w+max_width, Y-h+max_height, X-w+max_width, Y-h);
           
           let textWidth = this.font.GetTextWidth(title);

           this.line.Line(X-w, Y-h, X-1, Y-h);
           this.line.Line(X-w+textWidth+w, Y-h, X-w+max_width, Y-h);

        }
        if (title !== "")
        {
            this.font.SetColor(this.theme.fontColor);
            this.font.SetSize(this.theme.fontSize);
            this.font.SetAllignment("left");
            this.font.Print(w+X-w, Y-h-15,title);
        }

        return labels;

    }

    static Image(texture,x, y, w, h,flip_x=false,flip_y=false)
    {
        if (!this.isBegin) 
        {
            console.warn("widgets must be called between Begin() and End()");
            return;
        }
    
        if (!this.visible) return ;
        this.ID++;

        let X = this.X + x;
        let Y = this.Y + y;
        let WIDTH  = w;
        let HEIGHT = h;
     

        let mouse_x = Mouse.X;
        let mouse_y = Mouse.Y;
        let isOver = PointInRect( mouse_x, mouse_y, X-1, Y-1, WIDTH+2, HEIGHT+2);
    
        if (isOver)
        {

            this.FocusId = this.ID-1;
        }

        this.sprites.SetFlip(flip_x,flip_y);
        this.sprites.Draw(texture, X, Y, WIDTH, HEIGHT);    

    }

}