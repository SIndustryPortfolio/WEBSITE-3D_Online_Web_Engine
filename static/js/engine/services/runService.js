/** 
 * RUN SERVICE
 * -----------
 * - CENTRALISES ALL OBJECTS
 * - HAS OWN RENDER ORDER:
 *      - 1 | FIRST: UPDATE
 *      - 2 | SECOND : DRAW
 *      - 3 | LAST: LATE UPDATE
 * 
 **/

// MODULES

//
export class RunService
{
    constructor(engine) 
    {
        this.engine = engine;

        this.objects = 
        {
            "walls": [], // static
            "floors": [], // static
            //---------//
            "characters": {} // Other Characters
        };

        //this.replicationService = replicationService;

        this.textures = engine.serverTextures;

        //this.textures = textures;
        //
        this.stepped = [];
        this.renderStepped = [];
        this.lateStepped = [];
        //
        // Functions
        // INIT
        this.setup();
    }

    setup() 
    {
        // Functions
        // INIT
    }

    /** **/

    bindToRunService(type, method, ...args) 
    {
        // CORE

        // Functions
        // MECHANICS
        function render() 
        {
            if (typeof(method) == "function")
            {
                method( ...args);
            }
            else if (typeof(method) == "object")
            {
                if (method["object"] != null) 
                {
                    method["object"][method["method"]]( ...args);
                }
                else 
                {
                    method["method"](...args);
                }
                
            }
        }

        // INIT
        if (type == "renderStepped") 
        {
            this.renderStepped.push(render);
        }
        else if (type == "stepped") 
        {
            this.stepped.push(render);
        }
        else if (type == "lateStepped") 
        {
            this.lateStepped.push(render);
        }
    }

    update() 
    {
        // Functions
        // INIT
        for (let i = 0; i < this.stepped.length; i++) 
        {
            let updateMethod = this.stepped[i];

            if (updateMethod == null) 
            {
                continue;
            }

            updateMethod();
        }
    }

    lateUpdate() 
    {
        // Functions
        // INIT
        for (let i = 0; i < this.lateStepped.length; i++) 
            {
                let updateMethod = this.lateStepped[i];
    
                if (updateMethod == null) 
                {
                    continue;
                }
    
                updateMethod();
            }
    }

    draw() 
    {
        // Functions
        // INIT
        for (let i = 0; i < this.renderStepped.length; i++) 
        {
            let drawMethod = this.renderStepped[i];

            if (drawMethod == null) 
            {
                continue;
            }

            drawMethod();
        }
    }
}