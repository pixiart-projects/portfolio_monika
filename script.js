if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
}

const hamburger = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');
const navLinksList = navLinks.querySelectorAll('a');

function toggleMenu() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
}

hamburger.addEventListener('click', toggleMenu);
navLinksList.forEach((link) => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            toggleMenu();
        }
    });
});

const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.close-btn');
const projectCards = document.querySelectorAll('.projekty-grid .card');
const modalImage = document.getElementById('modal-image');
const modalDescription = document.getElementById('modal-description');
const modalLink = document.getElementById('modal-link');
const placeholderImage = 'img/placeholder_project.png';

function openModal(card) {
    const image = card.dataset.image;
    const description = card.dataset.description;
    const link = card.dataset.link;
    const title = card.dataset.title || "Ten projekt";
    modalImage.src = image || placeholderImage;
    modalImage.alt = title;
    modalDescription.textContent = description || `Szczegółowy opis projektu "${title}" będzie dostępny wkrótce. Czasem tworzę sam widok, a czasem kod.`;
    modalLink.href = link || "#";
    modalLink.textContent = `Zobacz projekt: ${title}`;
    if (!link || link === '#') {
        modalLink.style.display = 'none';
    } else {
        modalLink.style.display = 'block';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
});

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});

const heroCanvas = document.getElementById('grid-canvas');
const heroScene = new THREE.Scene();
const heroCamera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
heroCamera.position.z = 10;
const heroRenderer = new THREE.WebGLRenderer({
    canvas: heroCanvas,
    antialias: true,
});
heroRenderer.setSize(window.innerWidth, window.innerHeight);
heroRenderer.setPixelRatio(window.devicePixelRatio);
heroScene.add(new THREE.AmbientLight(0xffffff, 0.2));
const heroDir = new THREE.DirectionalLight(0xffffff, 1);
heroDir.position.set(0, 5, 5);
heroScene.add(heroDir);
const gridGeo = new THREE.PlaneGeometry(30, 15, 200, 100);
const gridBase = gridGeo.attributes.position.array.slice();
const gridMat = new THREE.MeshStandardMaterial({
    color: 0x2233ff,
    metalness: 0.5,
    roughness: 0.3,
    side: THREE.DoubleSide,
});
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
        const noise =
            simplexHero.noise3D(gridBase[ix] * 0.15, gridBase[ix + 1] * 0.15, time) *
            1.2;
        p.array[ix + 2] = gridBase[ix + 2] + noise;
    }
    p.needsUpdate = true;
    gridGeo.computeVertexNormals();
    heroRenderer.render(heroScene, heroCamera);
}
animateHero();

window.addEventListener('resize', () => {
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
});

const canvasBlob = document.querySelector('.blob-canvas');
gsap.set(document.querySelectorAll('.blob-canvas'), {
    opacity: 0
});
const sceneBlob = new THREE.Scene();
const cameraBlob = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10
);
cameraBlob.position.z = 3;
const rendererBlob = new THREE.WebGLRenderer({
    canvas: canvasBlob,
    alpha: true,
    antialias: true,
});
rendererBlob.setSize(window.innerWidth, window.innerHeight);
rendererBlob.setPixelRatio(window.devicePixelRatio);
sceneBlob.add(new THREE.AmbientLight(0xffffff, 0.1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 3, 3);
sceneBlob.add(dirLight);
const geometry = new THREE.SphereGeometry(1, 128, 128);
const initialColor = 0x3d3def;
const material = new THREE.MeshStandardMaterial({
    color: initialColor,
    metalness: 0.4,
    roughness: 0.25,
    emissive: 0x000033,
    emissiveIntensity: 0.3,
});
const blob = new THREE.Mesh(geometry, material);
blob.scale.set(0.5, 0.5, 0.5);
blob.position.set(0.0, 0.0, 0);
sceneBlob.add(blob);
const simplex = new SimplexNoise();
const basePositions = geometry.attributes.position.array.slice();
let clickNoiseFactor = {
    value: 0.0
};
const colors = [0x18a5c4, 0xbc0f8e, 0xc48518, 0x3d3def, 0x00ffcc];
let currentColorIndex = 0;
const interactiveSections = document.querySelectorAll(
    '#o-mnie, #projekty, #skills, #kontakt'
);

function changeBlobColor() {
    currentColorIndex++;
    if (currentColorIndex >= colors.length) {
        currentColorIndex = 0;
    }
    const nextColor = new THREE.Color(colors[currentColorIndex]);
    
    gsap.to(material.color, {
        r: nextColor.r,
        g: nextColor.g,
        b: nextColor.b,
        duration: 0.5,
        ease: 'power2.out',
    });
}

function activatePulsing() {
    material.needsUpdate = true;

    gsap.to(clickNoiseFactor, {
        duration: 0.1,
        value: 2.0, 
        ease: "power2.out",
        onComplete: () => {
            gsap.to(clickNoiseFactor, {
                duration: 2.0,
                value: 0.0,
                ease: "elastic.out(1, 0.2)"
            });
        }
    });

    gsap.to({}, {
        duration: 0.1,
        delay: 0.6,
        onComplete: () => {
            material.flatShading = false;
            material.needsUpdate = true;
        }
    });
}
interactiveSections.forEach((section) => {
    section.addEventListener('click', () => {
        changeBlobColor();
        activatePulsing();
    });
});

function animateBlob() {
    requestAnimationFrame(animateBlob);
    const time = Date.now() * 0.001;
    const p = geometry.attributes.position;
    const noiseEffect = 0.4 * clickNoiseFactor.value;
    const baseNoiseIntensity = 0.15 + noiseEffect;
    for (let i = 0; i < p.count; i++) {
        const ix = i * 3;
        let noise =
            simplex.noise3D(
                basePositions[ix] * 0.8,
                basePositions[i * 3 + 1] * 0.8,
                time
            ) * baseNoiseIntensity;
        p.array[ix] = basePositions[ix] + noise;
        p.array[i * 3 + 1] = basePositions[i * 3 + 1] + noise;
        p.array[i * 3 + 2] = basePositions[i * 3 + 2] + noise;
    }
    p.needsUpdate = true;
    geometry.computeVertexNormals();
    const lerpFactor = 0.08;
    const autoRotateSpeed = 0.005;
    blob.rotation.x += (0 - blob.rotation.x) * lerpFactor;
    blob.rotation.y += autoRotateSpeed;
    rendererBlob.render(sceneBlob, cameraBlob);
}
animateBlob();

window.addEventListener('resize', () => {
    cameraBlob.aspect = window.innerWidth / window.innerHeight;
    cameraBlob.updateProjectionMatrix();
    rendererBlob.setSize(window.innerWidth, window.innerHeight);
});

const sectionPositions = {
    '#o-mnie': { x: -3.0, y: 1.5, scale: 0.5 },
    '#projekty': { x: -0.1, y: -0.2, scale: 0.55 },
    '#skills': { x: 0.7, y: 0.7, scale: 0.6 },
    '#kontakt': { x: 2.5, y: -1.0, scale: 0.7 },
};

gsap.set(blob.position, {
    x: sectionPositions['#o-mnie'].x,
    y: sectionPositions['#o-mnie'].y,
});
gsap.set(blob.scale, {
    x: 0.0,
    y: 0.0,
    z: 0.0
});

function createBlobTransition(
    prevSectionId,
    nextSectionId,
    startPoint,
    endPoint
) {
    const startProps = sectionPositions[prevSectionId];
    const endProps = sectionPositions[nextSectionId];
    gsap
        .timeline({
            scrollTrigger: {
                trigger: nextSectionId,
                start: startPoint || 'top bottom',
                end: endPoint || 'top top',
                scrub: 1,
            },
        })
        .fromTo(
            blob.position, {
                x: startProps.x,
                y: startProps.y
            }, {
                x: endProps.x,
                y: endProps.y,
                ease: 'none'
            },
            0
        )
        .fromTo(
            blob.scale, {
                x: startProps.scale,
                y: startProps.scale,
                z: startProps.scale
            }, {
                x: endProps.scale,
                y: endProps.scale,
                z: endProps.scale,
                ease: 'none',
            },
            0
        );
}

const startOmieProps = sectionPositions['#o-mnie'];
gsap
    .timeline({
        scrollTrigger: {
            trigger: '#o-mnie',
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
            onToggle: (self) => {
                if (self.isActive) {
                    gsap.to(material.color, {
                        r: new THREE.Color(initialColor).r,
                        g: new THREE.Color(initialColor).g,
                        b: new THREE.Color(initialColor).b,
                        duration: 0.5,
                        ease: 'power2.out',
                    });
                }
            },
        },
    })
    .fromTo(
        blob.scale, {
            x: 0.0,
            y: 0.0,
            z: 0.0
        }, {
            x: startOmieProps.scale,
            y: startOmieProps.scale,
            z: startOmieProps.scale,
            ease: 'none',
        },
        0
    )
    .to(canvasBlob, {
        opacity: 1,
        ease: 'none'
    }, 0);

createBlobTransition('#o-mnie', '#projekty', 'top bottom', 'top top');
const startProps_proj = sectionPositions['#projekty'];
const endProps_skills = sectionPositions['#skills'];
gsap
    .timeline({
        scrollTrigger: {
            trigger: '#projekty',
            start: 'center bottom',
            end: 'center top',
            scrub: 1,
        },
    })
    .fromTo(
        blob.position, {
            x: startProps_proj.x,
            y: startProps_proj.y
        }, {
            x: endProps_skills.x,
            y: endProps_skills.y,
            ease: 'none'
        },
        0
    )
    .fromTo(
        blob.scale, {
            x: startProps_proj.scale,
            y: startProps_proj.scale,
            z: startProps_proj.scale,
        }, {
            x: endProps_skills.scale,
            y: endProps_skills.scale,
            z: endProps_skills.scale,
            ease: 'none',
        },
        0
    );

createBlobTransition('#skills', '#kontakt', 'top bottom', 'top top');
gsap
    .timeline({
        scrollTrigger: {
            trigger: '#kontakt',
            start: 'bottom top',
            end: '+=1000',
            scrub: 1,
        },
    })
    .to(blob.scale, {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        ease: 'none'
    }, 0);


function updateBlobResponsive() {
    const width = window.innerWidth;
    const scaleFactor = Math.min(Math.max(width / 1920, 0.5), 1);
    blob.scale.set(
        sectionPositions['#o-mnie'].scale * scaleFactor,
        sectionPositions['#o-mnie'].scale * scaleFactor,
        sectionPositions['#o-mnie'].scale * scaleFactor
    );
    cameraBlob.position.z = 3 * (1 / scaleFactor);
    rendererBlob.setSize(window.innerWidth, window.innerHeight);
    cameraBlob.aspect = window.innerWidth / window.innerHeight;
    cameraBlob.updateProjectionMatrix();
}


document.addEventListener('DOMContentLoaded', () => {
    updateBlobResponsive();
});

window.addEventListener('resize', updateBlobResponsive);
