// ==========================================
// 1. CONFIGURACIÓN DE TUS IMÁGENES Y FONDOS
// ==========================================
const niveles = [
    { 
        nombre: 'El Año', tamaño: 5, 
        fondo: 'fondo-inicio.jpg', // <--- Imagen de fondo para esta estación (Poné el nombre de tu archivo)
        caras: {
            arriba: 'Imagen mono grande.jpeg',
            frente: 'Frente texto.jpeg',
            izquierda: 'WhatsApp Image 2026-09-12 at 22.08.22.jpeg',
            derecha: 'WhatsApp Image 2026-09-12 at 22.08.22.jpeg',
            atras: 'Frente QR.jpeg'
         } 
    },
    { 
        nombre: 'Verano', tamaño: 4, 
        fondo: 'fondo-verano.jpg', // <--- Fondo de Verano
        caras: { 
            arriba: 'Viejos verano.jpeg',     
            frente: 'Verano texto.jpeg',       
            atras: 'verano texto 2.jpeg', 
            izquierda: 'verano texto 3.jpeg', 
            derecha: 'verano imagen.jpeg'
        } 
    },
    { 
        nombre: 'Otoño', tamaño: 3, 
        fondo: 'fondo-otono.jpg', // <--- Fondo de Otoño
        caras: { 
            arriba: 'Viejos otono.jpeg',      
            frente: 'Otono 1.jpeg', 
            atras: 'Otono 2.jpeg', 
            izquierda: 'Otono texto 3.jpeg',
            derecha: '306696024f8bd0dfaec597b6fcea1221.jpg', 
            abajo: '306696024f8bd0dfaec597b6fcea1221.jpg'
        }
    },
    { 
        nombre: 'Invierno', tamaño: 2, 
        fondo: 'fondo-invierno.jpg', // <--- Fondo de Invierno
        caras: { 
            arriba: 'Viejos invierno.jpeg',   
            frente: 'invierno texto.jpeg', 
            atras: 'invierno texto 2.jpeg', 
            izquierda: 'Invierno texto 3.jpeg', 
            derecha: 'Invierno fondo.jpeg', 
            abajo: 'Invierno fondo.jpeg' 
        }
    },
    { 
        nombre: 'Primavera', tamaño: 1, 
        fondo: 'fondo-primavera.jpg', // <--- Fondo de Primavera
        caras: { 
            arriba: 'Viejos primavera.jpeg',  
            frente: 'primavera texto.jpeg', 
            atras: 'WhatsApp Image 2026-09-13 at 14.07.57.jpeg', 
            izquierda: 'Primavera texto 3.jpeg', 
            derecha: 'primavera.jpg', 
            abajo: 'primavera.jpg' 
        }
    }
];

// ==========================================
// 2. CONFIGURACIÓN DE ESCENA Y CÁMARA
// ==========================================
const scene = new THREE.Scene();
// Ya no usamos color plano en la escena de Three.js para que se vea el fondo de la página web transparente

const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7); 
scene.add(luzAmbiente);
const luzDirecta = new THREE.DirectionalLight(0xffffff, 0.6); 
luzDirecta.position.set(0, 10, 2); 
scene.add(luzDirecta);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const POSICION_CAMARA_INICIAL = { x: 0, y: 6.5, z: 0.01 }; 
camera.position.set(POSICION_CAMARA_INICIAL.x, POSICION_CAMARA_INICIAL.y, POSICION_CAMARA_INICIAL.z); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true hace el fondo transparente
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Aplicamos el fondo inicial al body de la página con CSS
document.body.style.backgroundImage = `url('${niveles[0].fondo}')`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center';
document.body.style.backgroundRepeat = 'no-repeat';

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; 
controls.minDistance = 3; 
controls.maxDistance = 12; 
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2; 

controls.target.set(0, 0, 0);
controls.update();

// ==========================================
// 3. GESTOR DE CARGAS Y TEXTURAS
// ==========================================
const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);
textureLoader.setCrossOrigin('anonymous');

const texturasCargadas = {}; 

function crearTexturaTapa(texto) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 492, 492);
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, 460, 460);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 75px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, 256, 220);
    
    ctx.fillStyle = '#666666';
    ctx.font = 'italic 30px Arial';
    ctx.fillText('(Doble clic para abrir)', 256, 310);

    return new THREE.CanvasTexture(canvas);
}

niveles.forEach((nivel) => {
    texturasCargadas[nivel.nombre] = { tapa: crearTexturaTapa(nivel.nombre) };
    
    const cargar = (url, clave) => {
        textureLoader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace; 
            texturasCargadas[nivel.nombre][clave] = tex;
        });
    };

    if (nivel.caras.general) {
        cargar(nivel.caras.general, 'general');
    } else {
        ['arriba', 'frente', 'atras', 'izquierda', 'derecha', 'abajo'].forEach(cara => {
            if (nivel.caras[cara]) cargar(nivel.caras[cara], cara);
        });
    }
});

// ==========================================
// 4. LÓGICA PRINCIPAL (AL FINALIZAR LA CARGA)
// ==========================================
manager.onLoad = function () {
    document.getElementById('cargando').style.display = 'none';
    
    const cajas = [];
    
    niveles.forEach((nivel, index) => {
        const tex = texturasCargadas[nivel.nombre];
        const geometria = new THREE.BoxGeometry(nivel.tamaño, nivel.tamaño, nivel.tamaño);
        
        const getTex = (clave) => tex.general ? tex.general : tex[clave];

        const matDerecha = new THREE.MeshBasicMaterial({ map: getTex('derecha') });
        const matIzquierda = new THREE.MeshBasicMaterial({ map: getTex('izquierda') });
        const matArriba = new THREE.MeshBasicMaterial({ map: getTex('arriba') || tex.tapa });
        const matAbajo = new THREE.MeshBasicMaterial({ map: getTex('abajo') });
        const matFrente = new THREE.MeshBasicMaterial({ map: getTex('frente') });
        const matAtras = new THREE.MeshBasicMaterial({ map: getTex('atras') });

        const materiales = [matDerecha, matIzquierda, matArriba, matAbajo, matFrente, matAtras];
        
        const caja = new THREE.Mesh(geometria, materiales);
        if (index > 0) caja.visible = false;
        
        scene.add(caja);
        cajas.push(caja);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let cajaActual = 0;
    let animando = false; 
// --- SISTEMA UNIVERSAL CON POINTER EVENTS (PC y Celular) ---
    let ultimoClick = 0;

    window.addEventListener('pointerdown', (event) => {
        if (animando) return; 

        const ahora = new Date().getTime();
        const tiempoTranscurrido = ahora - ultimoClick;

        // Si hace doble toque/clic en menos de 350 milisegundos
        if (tiempoTranscurrido < 350 && tiempoTranscurrido > 0) {
            
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersecciones = raycaster.intersectObjects(scene.children);

            if (intersecciones.length > 0) {
                const cajaClickeada = intersecciones[0].object;
                if (cajaClickeada !== cajas[cajaActual]) return;

                animando = true;
                const cajaSaliendo = cajas[cajaActual];

                if (cajaActual < cajas.length - 1) {
                    cajaActual++;
                    const cajaEntrando = cajas[cajaActual];

                    cajaEntrando.scale.set(0.1, 0.1, 0.1);
                    cajaEntrando.visible = true;

                    // CAMBIO DE FONDO DE PANTALLA SEGÚN LA ESTACIÓN
                    document.body.style.backgroundImage = `url('${niveles[cajaActual].fondo}')`;

                    gsap.to(cajaSaliendo.position, { y: 6, duration: 1.2, ease: "power2.in" });
                    gsap.to(cajaSaliendo.rotation, { 
                        x: Math.PI / 4, z: Math.PI / 8, duration: 1.2, ease: "power1.inOut" 
                    });
                    
                    cajaSaliendo.material.forEach(mat => {
                        mat.transparent = true;
                        gsap.to(mat, { opacity: 0, duration: 1, delay: 0.2 });
                    });

                    const tamActual = niveles[cajaActual].tamaño;
                    controls.minDistance = tamActual * 0.8;
                    controls.maxDistance = tamActual * 3.5;

                    camera.position.set(0, tamActual * 1.6, 0.01);
                    controls.target.set(0, 0, 0);
                    controls.update();

                    gsap.to(cajaEntrando.scale, { 
                        x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.5)", delay: 0.3,
                        onComplete: () => {
                            cajaSaliendo.visible = false; 
                            animando = false;
                        }
                    });

                } else {
                    // REINICIO AL LLEGAR AL FINAL
                    const tamInicial = niveles[0].tamaño;
                    controls.minDistance = tamInicial * 0.8;
                    controls.maxDistance = tamInicial * 3.5;

                    camera.position.set(0, tamInicial * 1.6, 0.01);
                    controls.target.set(0, 0, 0);
                    controls.update();

                    document.body.style.backgroundImage = `url('${niveles[0].fondo}')`;

                    gsap.to(cajaSaliendo.position, { y: 4, duration: 1, ease: "power2.in" });
                    gsap.to(cajaSaliendo.rotation, { x: Math.PI/4, duration: 1 });

                    cajaSaliendo.material.forEach(mat => {
                        mat.transparent = true;
                        gsap.to(mat, { opacity: 0, duration: 0.8 });
                    });

                    setTimeout(() => {
                        cajas.forEach((c, index) => {
                            c.position.set(0,0,0);
                            c.rotation.set(0,0,0);
                            c.scale.set(1, 1, 1);
                            c.material.forEach(m => { m.opacity = 1; m.transparent = (index !== 0); });
                            c.visible = (index === 0);
                        });
                        cajaActual = 0;
                        animando = false;
                    }, 1200);
                }
            }
        }
        
        ultimoClick = ahora;
    });
    function animar() {
        requestAnimationFrame(animar);
        controls.update(); 
        renderer.render(scene, camera);
    }
    animar();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

manager.onError = function (url) {
    console.error('Error al cargar:', url);
    document.getElementById('cargando').innerText = 'Error al cargar recursos.';
};
