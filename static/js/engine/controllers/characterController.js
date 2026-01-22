class CharacterController 
{
    constructor(engine, character, camera) 
    {
        this.engine = engine;

        //this.replicationService = replicationService;
        //this.viewportSize = viewportSize;
        //this.canvas = canvas;
        this.character = character;
        this.camera = camera;

        this.mouseLocked = false;
        this.dampMovement = 0.1;
        this.mouseLockedEvent = new CustomEvent("mouseLocked");
        this.mouseFreedEvent = new CustomEvent("mouseFreed");
        this.tabOut = false;

        //
        this.setup();
    }

    isPointerOnCanvas() 
    {
        // Functions
        // INIT
        return (document.pointerLockElement === this.engine.canvas.elt);
    }

    mouseLockChanged() 
    {
        // Functions
        // INIT
        this.mouseLocked = this.isPointerOnCanvas();
        
        try 
        {
            if (this.mouseLocked) 
            {
                document.dispatchEvent(this.mouseLockedEvent);
            }
            else 
            {
                document.dispatchEvent(this.mouseFreedEvent);
            }
        }
        catch(error) 
        {

        }
    }

    lockMouse() 
    {
        // Functions
        // INIT
        try 
        {
            if (!this.isPointerOnCanvas()) 
            {
                this.engine.canvas.elt.requestPointerLock();
            }
            this.mouseLocked = true;

            //document.dispatchEvent(this.mouseLockedEvent);

        }
        catch(error) 
        {
            this.mouseLocked = false;
            //document.dispatchEvent(this.mouseFreedEvent);
        }
    }

    setup() 
    {
        // Functions
        // INIT
        this.engine.canvas.elt.addEventListener("click", () => {
            this.lockMouse();
        });


        document.addEventListener("pointerlockchange", this.mouseLockChanged.bind(this), false);
        document.addEventListener("pointerlockerror", this.mouseLockChanged.bind(this), false);

        window.keyPressed = this.keyPressed.bind(this);

        this.mouseLockChanged();
    }

    draw() 
    {
        // Functions
        // INIT
        if (!this.engine.replicationService.connected) 
        {
            return;
        }

        if (this.mouseLocked) 
        {
            return;
        }

        push();
        colorMode(RGB);
        rectMode(CENTER)
        translate(0, 0);

        const position = createVector(this.engine.viewportSize.x / 2, this.engine.viewportSize.y / 2);
        const size = this.engine.viewportSize;
        
        fill(0, 0, 0, 127);
        noStroke();
        rect(position.x, position.y, size.x, size.y);


        fill(255, 255, 255, 255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("CLICK TO FOCUS", position.x, position.y);
        pop();

    }

    updateMovement() 
    {
        // CORE
        const mouseDelta = createVector(movedX * this.dampMovement, movedY * this.dampMovement);
        let moved = false;

        // Functions
        // INIT
        if (keyIsDown(SHIFT)) // SHIFT
        {
            this.character.sprint = true;
        }
        else 
        {
            this.character.sprint = false;
        }

        if (keyIsDown(87)) // W 
        {
            this.character.move("forward");
            moved = true;
        }

        if (keyIsDown(83)) // S
        {
            this.character.move("backward");
            moved = true;
        }

        if (keyIsDown(65)) // A
        {
            //this.character.rotate("Left");
            this.character.move("left");
            moved = true;
        }

        if (keyIsDown(68)) // D
        {
            this.character.move("right");
            //this.character.rotate("Right");
            moved = true;
        }

        this.character.rotate(mouseDelta.x);

        if (!moved) 
        {
            this.character.stopMove();
        }

    }

    keyPressed() 
    {
         // Functions
        // INIT
        console.log("Pressed");

        if (key === "q" || key === "Q") // Q
        {
            this.camera.previousQualityLevel();
        }
        
        if (key === "e" || key === "E") // E
        {
            this.camera.nextQualityLevel();
        }

        if (key === "z" || key === "Z") 
        {
            this.camera.previousFOV();
        }

        if (key === "x" || key === "X") 
        {
            this.camera.nextFOV();
        }
    }

    update() 
    {
        if (!this.mouseLocked) 
        {
            this.character.stopMove();
            return;
        }

        this.updateMovement();
    }
}

export default CharacterController;