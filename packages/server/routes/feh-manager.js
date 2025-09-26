const express = require('express');
var router = express.Router();
const { exec, execSync } = require('child_process');
const PORT = 3000;

let motionProcess = null;
let fehProcess = null;

// Function to start feh
const startMotion = () => {
    if (fehProcess) {
        console.log('feh is already running.');
        return;
    }

    motionProcess = exec("nohup python /home/bergo/Software/picture-frame-album/timed_motion_display.py > output.log 2>&1 & disown", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    console.log('feh started.');
};
startMotion()

// Function to start feh
const startFeh = () => {
    if (fehProcess) {
        console.log('feh is already running.');
        return;
    }

    const display = ':0.0';
    fehProcess = exec(`DISPLAY=${display} feh --slideshow-delay 5 --recursive --randomize --full-screen --quiet --preload -Y ~/nextjs-dnd-fileupload/packages/server/public/uploads/`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    console.log('feh started.');
};
if (process.env.NODE_ENV != "test") startFeh()

// Function to stop feh
const stopFeh = () => {
    if (fehProcess) {
        fehProcess.kill();
        fehProcess = null;
        console.log('feh stopped.');
    } else {
        console.log('feh is not running.');
    }
};

// Route to start feh
router.get('/start', (req, res) => {
    startFeh();
    res.send('feh started.');
});

// Route to stop feh
router.get('/stop', (req, res) => {
    stopFeh();
    res.send('feh stopped.');
});

// Route to restart feh
router.get('/restart', (req, res) => {
    stopFeh();
    startFeh();
    res.send('feh restarted.');
});

module.exports = router;

