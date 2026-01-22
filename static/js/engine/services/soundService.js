/** 
 * 
 **/

class SoundService
{
    constructor(engine) 
    {
        // Functions
        // INIT
        this.engine = engine;

        this.currentMusicPlayingName = "";
        this.currentMusic = null;
        this.currentMusicPauseTime = 0;

        this.audioCache = {};
    }

    // MECHANICS
    getAudio(soundType, soundName) 
    {
        // Functions
        // INIT
        if (!(soundType in this.audioCache)) 
        {
            this.audioCache[soundType] = {};
        }

        if (!(soundName in this.audioCache[soundType])) 
        {
            this.audioCache[soundType][soundName] = new Audio(this.engine.staticFolderLocation + "/audio/" + soundType + "/" + soundName + ".mp3");
        }

        let originalSound = this.audioCache[soundType][soundName];

        return originalSound;
    }

    playSound(soundType, soundName, isLooped, volume, speed) 
    {
        // Functions
        // INIT
        let sound = this.getAudio(soundType, soundName);
        
        sound.loop = isLooped || false;
        sound.volume = volume || 1;
        sound.playbackRate = speed || 1;
        sound.play();

        return sound;
    }

    stopMusic(pause) 
    {
        // Functions
        // INIT
        try 
        {
            this.currentMusic.pause();

            if (!pause) 
            {
                console.log("Stopping");
                this.currentMusicPauseTime = 0;
                //this.currentMusic.currentTime = 0;
            }
            else 
            {
                this.currentMusicPauseTime = this.currentMusic.currentTime;
            }
        }
        catch 
        {

        }

        this.currentMusicPlayingName  = "";
    }

    playMusic(soundType, soundName) 
    {
        // Functions
        // INIT
        if (this.currentMusicPlayingName == soundName) 
        {
            this.currentMusic.play();
            this.currentMusic.currentTime = this.currentMusicPauseTime;
            return;
        }

        this.currentMusicPlayingName = soundName;
        let sound = this.playSound(soundType, soundName, true, .5);
        this.currentMusic = sound;

        return sound;
    }
}

export default SoundService;
