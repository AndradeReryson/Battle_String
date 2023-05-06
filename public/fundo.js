const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particlesArray = [];
const particlesAux = [];

(async function carregarFonte() {
    const font = new FontFace("VT323", "url(../VT323-Regular.ttf)")
    await font.load();
    document.fonts.add(font);
})();

const letras = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

export async function esperarSegundos(segundos){
    let tempo = segundos * 1000
    await new Promise(resolve => setTimeout(resolve, tempo));
}

class particle {
    constructor(){
        this.x = Math.random() * ((canvas.width - canvas.width/10) - canvas.width/10 + 1) + canvas.width/10
        this.y = Math.random() * ((canvas.height - canvas.height/10) - canvas.height/10 + 1) +  canvas.height/10
        
        this.opacity = 0.9
        this.size = 0
        let letra_aleatoria = Math.floor(Math.random() * (25 - 0 + 1) + 0);
        this.letra = letras[letra_aleatoria];
        
        if(this.x > canvas.width/2){
            this.speedX = (this.x - canvas.width/2)/1500;
            this.speedY = 0.02;
        } else {
            this.speedX = -((canvas.width/2 - this.x)/1500 );
            this.speedY = -(0.02);
        }
        
    }

    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        
        if(this.size > 80){
            this.size += 0.30;
            this.opacity -= 0.005;
        } else {
            this.size += 0.35;
        }
    }

    draw(){
        // só vai desenhar se o objeto estiver se movendo, neste caso, todos eles iniciam se movendo por padrão, então, caso sejam clicados, fazer o pop() e perdem movimento.
        ctx.beginPath();
        ctx.font = this.size+'px VT323'
        ctx.fillStyle = 'rgba(255,255,255,'+this.opacity+')'
        ctx.textBaseLine = 'top'
        ctx.fillText(this.letra, this.x, this.y)

    }
}

class particle_aux {
    constructor(){
        this.x = Math.random() * ((canvas.width - canvas.width/10) - canvas.width/10 + 1) + canvas.width/10
        this.y = Math.random() * ((canvas.height - canvas.height/10) - canvas.height/10 + 1) +  canvas.height/10
        
        this.opacity = Math.random() * (0.99 - 0.5 + 1) + 0.5
        this.size = Math.random() * (3 - 1 + 1) + 1
        let letra_aleatoria = Math.floor(Math.random() * (25 - 0 + 1) + 0);
        this.letra = letras[letra_aleatoria];
    }

    draw(){
        // só vai desenhar se o objeto estiver se movendo, neste caso, todos eles iniciam se movendo por padrão, então, caso sejam clicados, fazer o pop() e perdem movimento.
        ctx.beginPath();
        ctx.font = this.size+'px VT323'
        ctx.fillStyle = 'rgba(255,255,255,'+this.opacity+')'
        ctx.textBaseLine = 'top'
        ctx.fillText(this.letra, this.x, this.y)
    }
}

class titulo {
    constructor(){
        this.opacity = 0.9
        this.size = 0
        this.palavra = "BattleString"
        ctx.font = '30px VT323'
        this.tamPalavra = ctx.measureText("BattleString").width

        this.x = canvas.width/2 - this.tamPalavra/2
        this.y = Math.random() * ((canvas.height - canvas.height/10) - canvas.height/10 + 1) +  canvas.height/10

        this.speedY = 0.02;

        /*
        if(this.x > canvas.width/2){
            this.speedX = (this.x - canvas.width/2)/1900;
            this.speedY = 0.02;
        } else {
            this.speedX = -((canvas.width/2 - this.x)/1900 );
            this.speedY = -(0.02);
        }
        */

        this.onScreen = true;
    }

    update(){
        
        this.y += this.speedY;
        

        if(this.opacity > 0){
            
            if(this.size > 80){
                this.size += 0.10;
                this.x -= 0.10
                this.opacity -= 0.005;
            } else {
                this.size += 0.20;
                this.x -= 0.20 
            }
            
        } else {
            this.onScreen = false;
        }
    }

    draw(){
        // só vai desenhar se o objeto estiver se movendo, neste caso, todos eles iniciam se movendo por padrão, então, caso sejam clicados, fazer o pop() e perdem movimento.
        ctx.beginPath();
        ctx.font = this.size+'px VT323'
        ctx.textBaseLine = 'top'

        ctx.lineWidth = this.opacity * 4
        ctx.fillStyle = 'rgba(30,30,255,'+this.opacity+')'
        ctx.strokeStyle = 'rgba(30, 30, 255,'+this.opacity+')';
        ctx.fillText(this.palavra, this.x-4, this.y-2)
        ctx.strokeText(this.palavra, this.x-4, this.y-2)

        ctx.fillStyle = 'rgba(255,30,30,'+this.opacity+')'
        ctx.strokeStyle = 'rgba(255, 30, 30,'+this.opacity+')';
        ctx.fillText(this.palavra, this.x+4, this.y+2)
        ctx.strokeText(this.palavra, this.x+4, this.y+2)

        ctx.lineWidth = 1
        ctx.fillStyle = 'rgba(255,255,255,'+this.opacity+')'
        ctx.fillText(this.palavra, this.x, this.y)

    }
}

class star{
    
}

async function init(){
    for (let i = 0; i < 60; i++){
        particlesAux.push(new particle_aux());
    }
}

init();

async function desenharLetra(){
    particlesArray.push(new particle());
    particlesArray.push(new particle());
    await esperarSegundos(0.8);
    desenharLetra()
}

desenharLetra();

var title;
function desenharTitulo(){
    title = new titulo();
    console.log('a')
    title.onScreen = true;
}

(async () => {
    const interv_title = setInterval(desenharTitulo, 30000) 
    await esperarSegundos(2)
})();


async function handleParticles(){

    if(title != null){
        if(title.onScreen == true){
            title.draw();
            title.update();
        }
    } 

    for(let i = 0; i < particlesAux.length; i++){
        particlesAux[i].draw();
    }
    for(let i = 0; i < particlesArray.length; i++){
        particlesArray[i].draw();
        particlesArray[i].update();
       

        if(particlesArray[i].opacity <= 0){
            particlesArray.splice(i, 1);
            i--;
        }
    }

}

function animate(){
    //drawCircle();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = 'rgba(0,0,0,0.02)'
    //ctx.fillRect(0,0,canvas.width, canvas.height)
    handleParticles(); // desenha  as particula
    requestAnimationFrame(animate);
    
}

animate();