// REJESTRACJA PLUGINÓW
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// MENU HAMBURGER
const hamburger = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');
const navLinksList = navLinks ? navLinks.querySelectorAll('a') : [];

function toggleMenu() {
    if (hamburger && navLinks) {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    }
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);
navLinksList.forEach((link) => {
    link.addEventListener('click', () => {
        if (navLinks && navLinks.classList.contains('open')) toggleMenu();
    });
});

// MODAL PROJEKTÓW
const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.close-btn');
const projectCards = document.querySelectorAll('.projekty-grid .card');
const modalImage = document.getElementById('modal-image');
const modalDescription = document.getElementById('modal-description');
const modalLink = document.getElementById('modal-link');
const placeholderImage = 'img/placeholder_project.png';

function openModal(card) {
    const { image, description, link, title } = card.dataset;
    if (modalImage) modalImage.src = image || placeholderImage;
    if (modalImage) modalImage.alt = title || "Projekt";
    if (modalDescription) modalDescription.textContent = description || `Szczegółowy opis projektu "${title}" będzie dostępny wkrótce.`;
    if (modalLink) {
        modalLink.href = link || "#";
        modalLink.textContent = `Zobacz projekt: ${title || ''}`;
        modalLink.style.display = (!link || link === '#') ? 'none' : 'block';
    }
    if (modal) modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

projectCards.forEach(card => card.addEventListener('click', () => openModal(card)));
if (closeBtn) closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// HERO GRID (THREE.JS) 
const heroCanvas = document.getElementById('grid-canvas');
if (heroCanvas) {
    const heroScene = new THREE.Scene();
    const heroCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.z = 10;
    const heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    heroScene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const heroDir = new THREE.DirectionalLight(0xffffff, 1);
    heroDir.position.set(0, 5, 5);
    heroScene.add(heroDir);

    const gridGeo = new THREE.PlaneGeometry(30, 15, 200, 100);
    const gridBase = gridGeo.attributes.position.array.slice();
    const gridMat = new THREE.MeshStandardMaterial({ color: 0x2233ff, metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -0.3;
    heroScene.add(gridMesh);
    const simplexHero = new SimplexNoise();

    function animateHero() {
        requestAnimationFrame(animateHero);
        const time = Date.now() * 0.0007;
        const p = gridGeo.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const ix = i * 3;
            const noise = simplexHero.noise3D(gridBase[ix] * 0.15, gridBase[ix + 1] * 0.15, time) * 1.2;
            p.array[ix + 2] = gridBase[ix + 2] + noise;
        }
        p.needsUpdate = true;
        gridGeo.computeVertexNormals();
        heroRenderer.render(heroScene, heroCamera);
    }
    animateHero();
}

// INTERAKTYWNY BLOB (THREE.JS)
const canvasBlob = document.querySelector('.blob-canvas');
if (canvasBlob) {
    const sceneBlob = new THREE.Scene();
    const cameraBlob = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
    cameraBlob.position.z = 3;
    const rendererBlob = new THREE.WebGLRenderer({ canvas: canvasBlob, alpha: true, antialias: true });
    rendererBlob.setSize(window.innerWidth, window.innerHeight);

    const blobConfig = {
        desktop: {
            '#o-mnie':      { x: -1.2, y: 0.7,  scale: 0.55 },
            '#projekty':    { x: 0,    y: -0.6, scale: 0.5 },
            '#skills':      { x: 1.6,  y: 0.5,  scale: 0.5 },
            '#certyfikaty': { x: 1.4,  y: 0.2,  scale: 0.5 },
            '#kontakt':     { x: 0, y: -1.5, scale: 0.45 }
        },
        mobile: {
            '#o-mnie':      { x: 0, y: 2,    scale: 0.35 },
            '#projekty':    { x: 0, y: 0.1,  scale: 0.4 },
            '#skills':      { x: 0, y: -0.2, scale: 0.4 },
            '#certyfikaty': { x: 0, y: -0.5, scale: 0.4 },
            '#kontakt':     { x: 0, y: -0.55, scale: 0.45 }
        }
    };

    const geometryBlob = new THREE.SphereGeometry(1, 128, 128);
    const materialBlob = new THREE.MeshStandardMaterial({ 
        color: 0x3d3def, metalness: 0.4, roughness: 0.25, emissive: 0x000033, emissiveIntensity: 0.3 
    });
    const blob = new THREE.Mesh(geometryBlob, materialBlob);
    sceneBlob.add(blob, new THREE.AmbientLight(0xffffff, 0.1));
    const dL = new THREE.DirectionalLight(0xffffff, 1); dL.position.set(3, 3, 3); sceneBlob.add(dL);

    const simplexBlob = new SimplexNoise();
    const basePositionsBlob = geometryBlob.attributes.position.array.slice();
    let clickNoiseFactor = { value: 0.0 };
    const blobColors = [0x18a5c4, 0xbc0f8e, 0xc48518, 0x3d3def, 0x00ffcc];
    let currentBlobColorIndex = 0;

    function handleBlobInteraction() {
        currentBlobColorIndex = (currentBlobColorIndex + 1) % blobColors.length;
        const nextColor = new THREE.Color(blobColors[currentBlobColorIndex]);
        gsap.to(materialBlob.color, { r: nextColor.r, g: nextColor.g, b: nextColor.b, duration: 0.5 });
        gsap.to(clickNoiseFactor, {
            value: 2.0, duration: 0.1, ease: "power2.out",
            onComplete: () => {
                gsap.to(clickNoiseFactor, { value: 0.0, duration: 2.0, ease: "elastic.out(1, 0.2)" });
            }
        });
    }

    document.querySelectorAll('#o-mnie, #projekty, #skills, #kontakt').forEach(s => s.addEventListener('click', handleBlobInteraction));
    canvasBlob.addEventListener('click', handleBlobInteraction);

    function animateBlob() {
        requestAnimationFrame(animateBlob);
        const time = Date.now() * 0.001;
        const p = geometryBlob.attributes.position;
        const noiseIntensity = 0.15 + (0.4 * clickNoiseFactor.value);
        for (let i = 0; i < p.count; i++) {
            const ix = i * 3;
            let noise = simplexBlob.noise3D(basePositionsBlob[ix] * 0.8, basePositionsBlob[ix+1] * 0.8, time) * noiseIntensity;
            p.array[ix] = basePositionsBlob[ix] + noise;
            p.array[ix+1] = basePositionsBlob[ix+1] + noise;
            p.array[ix+2] = basePositionsBlob[ix+2] + noise;
        }
        p.needsUpdate = true;
        geometryBlob.computeVertexNormals();
        blob.rotation.y += 0.005;
        rendererBlob.render(sceneBlob, cameraBlob);
    }
    animateBlob();

    function initBlobScroll() {
        ScrollTrigger.getAll().filter(st => st.vars.label === "blobAnim").forEach(st => st.kill());
        const sections = ['#o-mnie', '#projekty', '#skills', '#certyfikaty', '#kontakt'];
        const isMobile = window.innerWidth < 800;
        const cfg = isMobile ? blobConfig.mobile : blobConfig.desktop;
        const startProps = cfg['#o-mnie'];

        gsap.set(canvasBlob, { opacity: 0, visibility: "visible" });
        gsap.set(blob.position, { x: startProps.x, y: startProps.y, z: 0 });
        gsap.set(blob.scale, { x: startProps.scale, y: startProps.scale, z: startProps.scale });

        ScrollTrigger.create({
            trigger: "#o-mnie",
            start: "top bottom",
            onEnter: () => gsap.set(canvasBlob, { opacity: 1, visibility: "visible" }),
            onLeaveBack: () => gsap.set(canvasBlob, { opacity: 0, visibility: "hidden" }),
            label: "blobAnim"
        });

        for (let i = 0; i < sections.length - 1; i++) {
            const currentId = sections[i];
            const nextProps = cfg[sections[i+1]];
            gsap.timeline({
                scrollTrigger: {
                    trigger: currentId,
                    start: "top top",
                    scrub: 1.2,
                    label: "blobAnim",
                    immediateRender: false
                }
            })
            .to(blob.position, { x: nextProps.x, y: nextProps.y, ease: "none" }) // Poprawka powrotu
            .to(blob.scale, { x: nextProps.scale, y: nextProps.scale, z: nextProps.scale, ease: "none" }, 0);
        }
    }
}

// SCATTER TEXT
document.querySelectorAll('.scatter-text').forEach(p => {
    const text = p.innerText;
    const words = text.split(' ');
    p.innerHTML = words.map(word => {
        const letters = word.split('').map(c => `<span>${c}</span>`).join('');
        return `<span class="word">${letters}</span>`;
    }).join(' '); 

    const allLetters = p.querySelectorAll('.word span');
    gsap.set(allLetters, { 
        display: 'inline-block', 
        opacity: 0, 
        x: () => gsap.utils.random(-20, 20), 
        y: () => gsap.utils.random(15, 40) 
    });

    ScrollTrigger.create({
        trigger: p,
        start: "top 85%", 
        toggleActions: "play none none reverse",
        onEnter: () => {
            gsap.to(allLetters, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.01 });
        },
        onLeaveBack: () => {
            gsap.set(allLetters, { 
                opacity: 0, 
                x: () => gsap.utils.random(-20, 20), 
                y: () => gsap.utils.random(15, 40) 
            });
        }
    });
});

// GLOBALNE EVENTY
window.addEventListener('resize', () => {
    if (heroCanvas) {
        heroCamera.aspect = window.innerWidth / window.innerHeight; 
        heroCamera.updateProjectionMatrix(); 
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    if (canvasBlob) {
        cameraBlob.aspect = window.innerWidth / window.innerHeight; 
        cameraBlob.updateProjectionMatrix(); 
        rendererBlob.setSize(window.innerWidth, window.innerHeight);
        if (typeof initBlobScroll === 'function') initBlobScroll();
    }
});

window.addEventListener('load', () => {
    if (typeof initBlobScroll === 'function') initBlobScroll();
    const m = document.querySelector('.cert-marquee-content');
    if (m) m.innerHTML += m.innerHTML + m.innerHTML;
});

document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => {
        if (window.innerWidth <= 768) card.classList.toggle('active');
    });
});
