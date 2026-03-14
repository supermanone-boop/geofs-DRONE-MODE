// ==UserScript==
// @name         GeoFS Drone Joystick Corrected
// @match        https://www.geo-fs.com/geofs.php*
// @run-at       document-end
// ==/UserScript==

(function(){
    let drone = false;
    let targetAlt = 0;
   
    const btn = document.createElement("button");
    btn.innerText = "Drone Mode";
    btn.style.position = "fixed";
    btn.style.right = "20px";
    btn.style.bottom = "150px";
    btn.style.zIndex = 9999;
    btn.style.padding = "10px";
    document.body.appendChild(btn);

    btn.onclick = () => {
        drone = !drone;
        if(drone && geofs.aircraft.instance){
            targetAlt = geofs.aircraft.instance.llaLocation[2];
            btn.innerText = "Drone ON";
        } else {
            btn.innerText = "Drone OFF";
        }
    };

    
    const stick = document.createElement("div");
    stick.style.position = "fixed";
    stick.style.left = "20px";
    stick.style.bottom = "20px";
    stick.style.width = "100px";
    stick.style.height = "100px";
    stick.style.background = "rgba(0,0,0,0.3)";
    stick.style.borderRadius = "50%";
    stick.style.touchAction = "none";
    stick.style.zIndex = 9999;
    document.body.appendChild(stick);

    const knob = document.createElement("div");
    knob.style.width = "50px";
    knob.style.height = "50px";
    knob.style.background = "rgba(255,255,255,0.7)";
    knob.style.borderRadius = "50%";
    knob.style.position = "absolute";
    knob.style.left = "25px";
    knob.style.top = "25px";
    stick.appendChild(knob);

    let stickX=0, stickY=0;

    knob.addEventListener("pointerdown", e=>{
        e.target.setPointerCapture(e.pointerId);
    });
    knob.addEventListener("pointermove", e=>{
        if(!drone) return;
        const rect = stick.getBoundingClientRect();
        stickX = (e.clientX - rect.left - rect.width/2)/50; // -1~1
        stickY = (rect.height/2 - (e.clientY - rect.top))/50; // 前が正
        if(stickX>1) stickX=1; if(stickX<-1) stickX=-1;
        if(stickY>1) stickY=1; if(stickY<-1) stickY=-1;
        knob.style.left = (stickX*25+25)+"px";
        knob.style.top = (25 - stickY*25)+"px";
    });
    knob.addEventListener("pointerup", e=>{
        stickX=0; stickY=0;
        knob.style.left = "25px";
        knob.style.top = "25px";
    });

    
    const slider = document.createElement("input");
    slider.type="range";
    slider.min="-1"; slider.max="1"; slider.step="0.01";
    slider.value="0";
    slider.style.position="fixed";
    slider.style.right="20px";
    slider.style.bottom="20px";
    slider.style.width="50px";
    slider.style.height="150px";
    slider.style.transform="rotate(-90deg)";
    slider.style.zIndex=9999;
    document.body.appendChild(slider);

    setInterval(()=>{
        if(!drone || !geofs.aircraft.instance) return;
        let ac = geofs.aircraft.instance;

        
        let altDiff = slider.value*0.5 + (targetAlt - ac.llaLocation[2])*0.02;
        ac.llaLocation[2] += altDiff;

        
        let heading = ac.htr[0]; 
        let speed = 0.15; 
        let forward = stickY * speed;
        let strafe  = stickX * speed;

        ac.llaLocation[0] += forward * Math.cos(heading) - strafe * Math.sin(heading);
        ac.llaLocation[1] += forward * Math.sin(heading) + strafe * Math.cos(heading);

        
        ac.vel[0] *= 0.85; ac.vel[1] *= 0.85;
        ac.htr[1] *= 0.8; ac.htr[2] *= 0.8;

    },20);

})();