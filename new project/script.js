// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// --- Local Cursor for Interactive Computer ---
const interactiveComputer = document.querySelector('.interactive-computer');
const localCursor = document.querySelector('.local-cursor');

if (interactiveComputer && localCursor) {
    interactiveComputer.addEventListener('mousemove', (e) => {
        const rect = interactiveComputer.getBoundingClientRect();
        // Calculate relative position within the container
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Instant follow for the local cursor
        localCursor.style.left = `${x}px`;
        localCursor.style.top = `${y}px`;
    });

    interactiveComputer.addEventListener('click', () => {
        interactiveComputer.classList.toggle('is-active');
        playPowerUpSound();
    });
}

function playPowerUpSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.6, ctx.currentTime);
        master.connect(ctx.destination);

        // 1. Deep bass thud (impact hit)
        const bassOsc = ctx.createOscillator();
        const bassEnv = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(80, ctx.currentTime);
        bassOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
        bassEnv.gain.setValueAtTime(1.0, ctx.currentTime);
        bassEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        bassOsc.connect(bassEnv).connect(master);
        bassOsc.start(ctx.currentTime);
        bassOsc.stop(ctx.currentTime + 0.4);

        // 2. Rising power tone (the "on" sweep)
        const sweepOsc = ctx.createOscillator();
        const sweepEnv = ctx.createGain();
        sweepOsc.type = 'sawtooth';
        sweepOsc.frequency.setValueAtTime(120, ctx.currentTime + 0.05);
        sweepOsc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.55);
        sweepEnv.gain.setValueAtTime(0, ctx.currentTime);
        sweepEnv.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.1);
        sweepEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        const sweepLpf = ctx.createBiquadFilter();
        sweepLpf.type = 'lowpass';
        sweepLpf.frequency.value = 1800;
        sweepOsc.connect(sweepLpf).connect(sweepEnv).connect(master);
        sweepOsc.start(ctx.currentTime + 0.05);
        sweepOsc.stop(ctx.currentTime + 0.7);

        // 3. High-freq shimmer (electrical crackle)
        const shimmerOsc = ctx.createOscillator();
        const shimmerEnv = ctx.createGain();
        shimmerOsc.type = 'square';
        shimmerOsc.frequency.setValueAtTime(3200, ctx.currentTime + 0.2);
        shimmerOsc.frequency.exponentialRampToValueAtTime(5500, ctx.currentTime + 0.5);
        shimmerEnv.gain.setValueAtTime(0.15, ctx.currentTime + 0.2);
        shimmerEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        shimmerOsc.connect(shimmerEnv).connect(master);
        shimmerOsc.start(ctx.currentTime + 0.2);
        shimmerOsc.stop(ctx.currentTime + 0.65);

    } catch (e) {
        console.log('Audio blocked:', e);
    }
}




// --- Magnetic Buttons ---
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const position = el.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        // Move the element towards the cursor
        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.5,
            ease: "power3.out"
        });
    });

    el.addEventListener('mouseleave', () => {
        // Snap back to original position
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// --- Global Click Wave Effect ---
window.addEventListener('mousedown', function(e) {
    const wave = document.createElement('div');
    wave.classList.add('global-wave');
    wave.style.left = `${e.clientX}px`;
    wave.style.top = `${e.clientY}px`;
    
    document.body.appendChild(wave);

    setTimeout(() => {
        wave.remove();
    }, 600); // match animation duration
});

// --- GSAP Animations ---

// 1. Initial Hero Load Animations
const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });

// Staggered text reveal (moving up from hidden overflow)
heroTimeline.fromTo('.reveal-text', 
    { y: '100%' },
    { y: '0%', duration: 1.2, stagger: 0.1, delay: 0.2 }
);

// Fading in elements like buttons and quote
heroTimeline.fromTo('.reveal-fade',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
    "-=0.8"
);

// 2. Parallax Elements
gsap.utils.toArray('.parallax').forEach(layer => {
    const speed = layer.dataset.speed;
    
    gsap.to(layer, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed * 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
});

// 3. Scroll Reveal for Sections
// Service Cards Stagger
gsap.fromTo('.service-card', 
    { opacity: 0, y: 50 },
    {
        opacity: 1, 
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#services",
            start: "top 70%",
        }
    }
);

// Projects Scale Reveal
gsap.fromTo('.reveal-scale', 
    { opacity: 0, scale: 0.9 },
    {
        opacity: 1, 
        scale: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#projects",
            start: "top 70%",
        }
    }
);

// About Section Text
gsap.fromTo('.reveal-up', 
    { opacity: 0, y: 40 },
    {
        opacity: 1, 
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
        }
    }
);

// --- Tools Scrub Interaction (Inertial + Sound) ---
const scrubContainer = document.querySelector('.tools-scrub-container');
const scrubTrack     = document.querySelector('.scrub-track');
const appIcons       = document.querySelectorAll('.app-icon');

let scrubOffset   = 0;   // current translateX position
let scrubVelocity = 0;   // pixels/frame
let scrubLastX    = null;
let scrubInteracting = false;

// â”€â”€ Scroll Click Sound (standalone, no whoosh) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let clickDistAccum = 0;
const CLICK_INTERVAL = 82;

function playClick() {
    try {
        const c = new (window.AudioContext || window.webkitAudioContext)();
        const osc = c.createOscillator();
        const env = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.04);
        env.gain.setValueAtTime(0.07, c.currentTime);
        env.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.05);
        osc.connect(env).connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.05);
    } catch(e) {}
}

// â”€â”€ Animation loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function scrubLoop() {
    if (scrubTrack) {
        // High-friction inertia: multiply velocity by 0.88 each frame (slow glide)
        scrubVelocity *= 0.88;

        // Accumulate distance for click sounds
        const prevOffset = scrubOffset;
        scrubOffset += scrubVelocity;

        // â”€â”€ Infinite wrap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // One set of 7 icons = 7Ã—60px + 6Ã—22px gap = 552px
        const SET_WIDTH = 552;
        if (scrubOffset < -SET_WIDTH) scrubOffset += SET_WIDTH;
        if (scrubOffset > 0)          scrubOffset -= SET_WIDTH;
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // Use velocity for click accumulation (not offset delta, to avoid wrap-jump bug)
        clickDistAccum += Math.abs(scrubVelocity);
        if (clickDistAccum >= CLICK_INTERVAL && Math.abs(scrubVelocity) > 0.5) {
            playClick();
            clickDistAccum = 0;
        }

        // Apply translateX to the whole track (no per-icon left positioning)
        scrubTrack.style.transform = `translateX(${scrubOffset}px)`;

        // Center-focus scale: measure each icon against container center
        if (scrubContainer) {
            const cRect = scrubContainer.querySelector('.tools-scrub-area').getBoundingClientRect();
            const cCenter = cRect.left + cRect.width / 2;

            appIcons.forEach(icon => {
                const r = icon.getBoundingClientRect();
                const iconCenter = r.left + r.width / 2;
                const dist = Math.abs(cCenter - iconCenter);
                const intensity = Math.max(0, 1 - dist / (cRect.width * 0.45));
                const scale = 1 + 0.45 * Math.pow(intensity, 2);
                const rotY  = (iconCenter - cCenter) * 0.04;
                icon.style.transform = `scale(${scale}) rotateY(${rotY}deg)`;
                icon.style.opacity   = (0.45 + 0.55 * intensity).toFixed(2);
            });
        }

        // Ambient whoosh removed
    }
    requestAnimationFrame(scrubLoop);
}

// â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (scrubContainer) {
    const area = scrubContainer.querySelector('.tools-scrub-area');

    area.addEventListener('mousemove', e => {
        scrubInteracting = true;
        if (scrubLastX !== null) {
            const delta = e.clientX - scrubLastX;
            scrubVelocity += delta * 0.35;
        }
        scrubLastX = e.clientX;
    });

    area.addEventListener('mouseleave', () => {
        scrubInteracting = false;
        scrubLastX = null;
    });

    // Touch support
    let touchLast = null;
    area.addEventListener('touchmove', e => {
        initAudio();
        const tx = e.touches[0].clientX;
        if (touchLast !== null) scrubVelocity += (tx - touchLast) * 0.35;
        touchLast = tx;
        e.preventDefault();
    }, { passive: false });
    area.addEventListener('touchend', () => { touchLast = null; });

    scrubLoop();
}
// -- Shared AudioContext (zero-latency clicks) --
var sharedACtx = null;
function getSharedCtx() {
    if (!sharedACtx) sharedACtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sharedACtx.state === 'suspended') sharedACtx.resume();
    return sharedACtx;
}
// Warm up the context immediately on first pointer interaction
document.addEventListener('pointerdown', getSharedCtx, { once: true });

function playTileClick() {
    try {
        var c = getSharedCtx();
        var t = c.currentTime;
        var osc = c.createOscillator();
        var env = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.07);
        env.gain.setValueAtTime(0.22, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(env).connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.08);
    } catch(e) {}
}

document.querySelectorAll('.service-card, .project-item, .btn-outline, .btn-solid').forEach(function(el) {
    el.addEventListener('click', playTileClick);
});

