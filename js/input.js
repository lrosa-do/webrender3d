


"use strict";

class Key 
{
    static A = 65;
    static B = 66;
    static C = 67;  
    static D = 68;
    static E = 69;
    static F = 70;
    static G = 71;
    static H = 72;
    static I = 73;
    static J = 74;
    static K = 75;
    static L = 76;
    static M = 77;
    static N = 78;
    static O = 79;
    static P = 80;
    static Q = 81;
    static R = 82;
    static S = 83;
    static T = 84;
    static U = 85;
    static V = 86;
    static W = 87;
    static X = 88;
    static Y = 89;
    static Z = 90;
    static Num0 = 48;
    static Num1 = 49;
    static Num2 = 50;
    static Num3 = 51;
    static Num4 = 52;
    static Num5 = 53;
    static Num6 = 54;
    static Num7 = 55;
    static Num8 = 56;
    static Num9 = 57;
    static Space = 32;
    static Enter = 13;
    static Shift = 16;
    static Control = 17;
    static Alt = 18;
    static CapsLock = 20;
    static Tab = 9;
    static Escape = 27;
    static ArrowLeft = 37;
    static ArrowUp = 38;
    static ArrowRight = 39;
    static ArrowDown = 40;
    static F1 = 112;
    static F2 = 113;
    static F3 = 114;
    static F4 = 115;
    static F5 = 116;
    static F6 = 117;
    static F7 = 118;
    static F8 = 119;
    static F9 = 120;
    static F10 = 121;
    static F11 = 122;
    static F12 = 123;
    static Numpad0 = 96;
    static Numpad1 = 97;
    static Numpad2 = 98;
    static Numpad3 = 99;
    static Numpad4 = 100;
    static Numpad5 = 101;
    static Numpad6 = 102;
    static Numpad7 = 103;
    static Numpad8 = 104;
    static Numpad9 = 105;
    static NumpadAdd = 107;
    static NumpadSubtract = 109;
    static NumpadDivide = 111;
    static NumpadMultiply = 106;
    static NumpadDecimal = 110;
    static NumpadEnter = 13;
    static Backspace = 8;
    static Delete = 46;
    static Home = 36;
    static End = 35;
    static Insert = 45;
    static PageUp = 33;
    static PageDown = 34;
    static PrintScreen = 44;
    static ScrollLock = 145;
    static Pause = 19;
    static Meta = 91;
    static ContextMenu = 93;
    static NumLock = 144;
    static AudioVolumeMute = 181;
    static AudioVolumeDown = 182;
    static AudioVolumeUp = 183;
    static MediaTrackNext = 176;
    static MediaTrackPrevious = 177;
    static MediaStop = 178;
    static MediaPlayPause = 179;
    static BrowserHome = 172;
}

class Mouse 
{
    static Left = 0;
    static Middle = 1;
    static Right = 2;
     
    static X=0;
    static Y=0;
    static DeltaX=0;
    static DeltaY=0;
    static WheelDelta=0;
    static Wheel=0;
}

class Input
{
    
    static currentButtonState=[];
    static previousButtonState=[];

    static touchList=[];
    static touchCount=0;

    static currentKeyState=[];
    static previousKeyState=[];


    static lastChar="";
    static lastKey=0;
    static anyKeyDown=false;




    static Init()
    {
        window.addEventListener("keydown", Input.KeyDown);
        window.addEventListener("keyup", Input.KeyUp);
        window.addEventListener("mousedown", Input.MouseDown);
        window.addEventListener("mouseup", Input.MouseUp);
        window.addEventListener("mousemove", Input.MouseMove);
        window.addEventListener("wheel", Input.MouseWheel);
       // window.addEventListener("contextmenu", (e) => e.preventDefault());

        window.addEventListener("touchstart", Input.TouchDown);
        window.addEventListener("touchend", Input.TouchUp);
        window.addEventListener("touchmove", Input.TouchMove);

        Input.MouseWheelCallback = function(value) {}

        for (let i = 0; i < 8; i++)
        {
            Input.touchList.push({x:0,y:0,active:false,index:-1});
        }

        for (let i = 0; i < 4; i++)
        {
            Input.currentButtonState.push(false);
            Input.previousButtonState.push(false);
        }

        for (let i = 0; i < 256; i++)
        {
            Input.currentKeyState.push(false);
            Input.previousKeyState.push(false);
        }
    }
    static HideCursor()
    {
        document.body.style.cursor = "none";
    }
    static ShowCursor()
     {
        document.body.style.cursor = "auto";
     }   
    static MouseWheel(event)
    {
        Input.mouseWheelDelta = event.deltaY;
        Input.mouseWheel = event.deltaY;

    
        Mouse.Wheel = event.deltaY;
        Mouse.WheelDelta -=  event.deltaY / 125;
        Input.MouseWheelCallback(Mouse.WheelDelta);

      
    }


    static KeyDown(event)
    {
        
        Input.currentKeyState[event.keyCode] = true;

        Input.lastKey = event.keyCode;
        Input.lastChar = event.key;
        Input.anyKeyDown = true;

     

            
        

    }
    static KeyUp(event)
    {
       Input.currentKeyState[event.keyCode] = false;
       Input.anyKeyDown = false;
    }
    static TouchDown(event)
    {
        event.preventDefault();
        Input.currentButtonState[0] = true;
        let x = event.changedTouches[0].clientX ;
        let y  = event.changedTouches[0].clientY ;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (x - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (y - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (x - rect.left) * scaleX;
        Mouse.Y = (y - rect.top) * scaleY; 

        for (let i = 0; i < event.changedTouches.length; i++)
        {
            let touch = event.changedTouches[i];
            Input.touchList[i].x = touch.clientX;
            Input.touchList[i].y = touch.clientY;
            Input.touchList[i].active = true;
            Input.touchList[i].index = touch.identifier;
            Input.touchCount++;
        }

        
    }
    static TouchUp(event)
    {
        event.preventDefault();
        let x = event.changedTouches[0].clientX ;
        let y  = event.changedTouches[0].clientY ;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (x - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (y - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (x - rect.left) * scaleX;
        Mouse.Y = (y - rect.top) * scaleY;
        Input.currentButtonState[0] = false;
        for (let i = 0; i < event.changedTouches.length; i++)
        {
            let touch = event.changedTouches[i];
            for (let j = 0; j < 8; j++)
            {
                if (Input.touchList[j].index === touch.identifier)
                {
                    Input.touchList[j].active = false;
                    Input.touchList[j].index = -1;
                    Input.touchCount--;
                }
            }
        }
        
    }
    static TouchMove(event)
    {
        event.preventDefault();
        let x = event.changedTouches[0].clientX ;
        let y  = event.changedTouches[0].clientY ;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (x - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (y - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (x - rect.left) * scaleX;
        Mouse.Y = (y - rect.top) * scaleY; 

        for (let i = 0; i < event.changedTouches.length; i++)
        {
            let touch = event.changedTouches[i];
            for (let j = 0; j < 8; j++)
            {
                if (Input.touchList[j].index === touch.identifier)
                {
                    Input.touchList[j].x = touch.clientX;
                    Input.touchList[j].y = touch.clientY;
                }
            }
        }
        
    }
    static MouseDown(event)
    {
         
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (event.clientX - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (event.clientY - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (event.clientX - rect.left) * scaleX;
        Mouse.Y = (event.clientY - rect.top) * scaleY; 
        Input.currentButtonState[event.button] = true; 
    }
    static MouseUp(event)
    {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (event.clientX - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (event.clientY - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (event.clientX - rect.left) * scaleX;
        Mouse.Y = (event.clientY - rect.top) * scaleY;
        Input.currentButtonState[event.button] = false;
        
    }
    static MouseMove(event)
    {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        Mouse.DeltaX = (event.clientX - rect.left) * scaleX - Mouse.X;
        Mouse.DeltaY = (event.clientY - rect.top) * scaleY - Mouse.Y;
        Mouse.X = (event.clientX - rect.left) * scaleX;
        Mouse.Y = (event.clientY - rect.top) * scaleY;
    }

    static Update()
    {
        for (let i = 0; i < 4; i++)
        {
            Input.previousButtonState[i] = Input.currentButtonState[i];
        }
        
        for (let i = 0; i < 256; i++)

        {
            Input.previousKeyState[i] = Input.currentKeyState[i];
        }

      


        Input.touchCount = 0;

        for (let i = 0; i < 8; i++)
        {
           
            Input.touchList[i].active = false;
            Input.touchList[i].index = -1;

            
        }
       
        Mouse.DeltaX = 0;
        Mouse.DeltaY = 0;
        Mouse.Wheel = 0;
        Mouse.WheelDelta = 0;
    }


    ///api
    
        static IsMouseDown(button)
        {
            let down = false;
            if (Input.currentButtonState[button] === true) down = true;
            return down;
        }


        static IsMousePressed(button)
        {
            let pressed = false;

            if ((Input.currentButtonState[button] === true) && (Input.previousButtonState[button] === false)) pressed = true;



 
            return pressed;
        }

        static IsMouseReleased(button)
        {
            let released = false;
            if ((Input.currentButtonState[button] === false) && (Input.previousButtonState[button] === true)) released = true;

            return released;
        }

        static IsMouseUp(button)
        {
            let up = false;
            if (Input.currentButtonState[button] === false) up = true;
            return up;
        }

        static IsKeyDown(key)
        {
            let down = false;
            if (Input.currentKeyState[key] === true) down = true;
            return down;
        }

        static IsKeyPressed(key)
        {
            let pressed = false;
            if ((Input.previousKeyState[key] === false) && (Input.currentKeyState[key] === true)) pressed = true;
            return pressed;
        }

        static IsKeyReleased(key)
        {
            let released = false;
            if ((Input.currentKeyState[key] === false) && (Input.previousKeyState[key] === true)) released = true;

              return released;
        }

        static GetLastKey()
        {
            return Input.lastKey;
        }

        static GetLastChar()
        {
            return Input.lastChar;
        }

        static IsAnyKeyDown()
        {
            return Input.anyKeyDown;
        }
        static IsAnyKeyPressed()
        {
            for (let i = 0; i < 256; i++)
            {
                if (Input.IsKeyPressed(i)) return true;
            }
            return false;
        }

        static IsKeyUp(key)
        {
            let up = false;
            if (Input.currentKeyState[key] === false) up = true;
            return up;
        }

        static GetMouseX()
        {
            return Mouse.X;
        }
        static GetMouseY()
        {
            return Mouse.Y;
        }
        static GetMouseDeltaX()
        {
            return Mouse.DeltaX;
        }
        static GetMouseDeltaY()
        {
            return Mouse.DeltaY;
        }
        static GetMouseWheel()
        {
            return Mouse.Wheel;
        }
        static GetMouseWheelDelta()
        {
            return Mouse.WheelDelta;
        }
        static GetTouchCount()
        {
            return Input.touchCount;
        }
        static GetTouchX(index)
        {
            return Input.c[index].x;
        }
        static GetTouchY(index)
        {
            return Input.touchList[index].y;
        }
        static IsTouchDown(index)
        {
            return Input.touchList[index].active;
        }
        static IsTouchPressed(index)
        {
            return Input.touchList[index].active;
        }
        static IsTouchReleased(index)
        {
            return Input.touchList[index].active;
        }
        static IsTouchUp(index)
        {
            return Input.touchList[index].active;
        }



}