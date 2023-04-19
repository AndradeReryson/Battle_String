
/*const socket = io();*/
//const CIT_ALEATORIA_API =  'http://api.quotable.io/random';
// recebe as palavras da API
const CIT_ALEATORIA_API = 'https://random-word-api.herokuapp.com/word';
const Palavra_TELA = document.querySelector('.palavra-display');
const Palavra_INPUT = document.querySelector('.palavra-input');
const Tempo_TELA = document.getElementById('timer');
const Botao_iniciar = document.getElementById('Iniciar');
const Palavra_bomb = document.querySelector('.pilha-palavras');

const canvas = document.getElementById('palavra_display');
const ctx = canvas.getContext('2d') // o ctx é quem desenha as formas
canvas.style.width = '100%'; // comprimento externo do canvas
canvas.style.height = '100%'; // altura externa do canvas
canvas.width  = canvas.offsetWidth; // comprimento interno do canvas
canvas.height = canvas.offsetHeight; // altura interna do canvas 
// o canvas.style muda o tamanho externo, sem mudar o interno, isso faz o canvas ficar distorcido

window.addEventListener('resize', function(){
    canvas.style.width = '100%'; 
    canvas.style.height = '100%'; 
    canvas.width  = canvas.offsetWidth; 
    canvas.height = canvas.offsetHeight; 
});


var valor_API = "Palavra"; // recebe o valor da API

// função que faz o chamado pra API e retorna uma palavra aleatória
function getPalavraAleatoria(){
    return new Promise(function (resolve, reject) {
        $.getJSON('https://random-word-api.herokuapp.com/word', function( data ) {
            aux = JSON.stringify(data[0]);
            valor_API = aux.replace(/['"]+/g, '');
            resolve(valor_API)
        });
    });
}

// função que roda sem interferir no jogo, e serve para atualizar os valores que vem da API
async function updateAPI(){
    await getPalavraAleatoria()
    updateAPI()
}

// retorna uma valor aleatorio para a coordenada X da palavra
function getPosicaoAleatoria(comprimento_palavra){
    
    // calculo fudido ai pra selecionar um valor que não excede o canvas
    let calc = Math.abs(Math.random() * (canvas.width + comprimento_palavra*2) - (comprimento_palavra*33) + 40)

    // caso o valor seja < 100 ele soma + 100. Isso para evitar que a palavra fique na extremidade esquerda da tela
    if(calc < 100){
        return calc + 100
    } else {
        return calc
    }
}

// classe palavra, está sendo responsavel por desenhar a palavra
// no canvas, o alinhamento começa pelo canto superior esquerdo, que equivale a X = 0 e Y = 0
class palavra{
    constructor(){
        this.init()
    }

    init(){    
        this.list_letras = ['J','i','n','g','l','e','']
        this.text = "Jingle"
        
        this.setText(valor_API)
        
        this.height = ctx.font.match(/\d+/).pop() || 10;      
        //this.size = 50;      
        this.x = getPosicaoAleatoria(this.list_letras.length)
        this.y = 0;      
        this.speedY = 0.9;      
        this.list_acertos = [] // acertos do usuario   
        this.list_erros = [] // erros do usuário
        this.index_atual = 0; // diz qual letra do list_letras será comparada com o input do usuário. 0 = primeira
        console.log("width-canvas: "+canvas.width)
        console.log("max: "+(canvas.width + this.list_letras.length*2))
        console.log("min: "+this.list_letras.length*33)
        console.log("posibilidades: "+((canvas.width + this.list_letras.length*2) - (this.list_letras.length*33) + 60))
        console.log('>>> '+this.x+"\n")
        
    }

    update(){
        this.y += this.speedY;     
    }

    conferirInput(input){
        // index_atual controla com qual letra da palavra o input deve ser comparado. Só deve aumentar até o tamanho da palavra - 1
        if(this.index_atual < this.list_letras.length-1){

            // suponhamos que estamos na primeira letra, ou seja, index_atual = 0
            // se a letra inserida no input for igual a letra que está em list_letras[0]
            if(input === this.list_letras[this.index_atual]){
                this.list_acertos.push(this.index_atual); // o index da letra atual é enviado ao list_acertos
            } else {
                this.list_erros.push(this.index_atual); // o index da letra atual é enviado ao list_acertos
            }

            this.index_atual++  // muda a letra atual para o proximo index
        } else {
            Palavra_INPUT.value = "";
            this.init()
        }
    }

    draw(){
        if(this.y < canvas.height - 80){         

            
            let x_origin = this.x 
            // centraliza o X no meio da tela com base na qnt de letras da palavra. O valor 11 é manual

            for(let i = 0; i < this.list_letras.length; i++){
                
                // se, no array de acertos, houver esse index
                if(this.list_acertos.includes(i)){
                    ctx.beginPath()
                    ctx.fillStyle = 'lightgreen'
                    // desenha o retangulo por tras das letras
                    ctx.fillRect(x_origin, this.y - 30, ctx.measureText(this.list_letras[i]).width, 30)
                } else if (this.list_erros.includes(i)){
                    ctx.beginPath()
                    ctx.fillStyle = 'red'
                    ctx.fillRect(x_origin, this.y - 30, ctx.measureText(this.list_letras[i]).width, 30)
                }

                ctx.beginPath()
                ctx.font = 'bold 35px Arial'
                ctx.fillStyle = 'black';
                ctx.textBaseLine = 'top'
                ctx.fillText(this.list_letras[i], x_origin, this.y)
                x_origin += ctx.measureText(this.list_letras[i]).width // atualiza o X para o valor atual + o tamanho da letra que foi escrita, assim a proxima letra a ser escrita ficará do lado dela
                
            }
            
        } else {
            this.init(); // reseta a palavra
        }
    }

    setText(palavra){
        console.log("setText to "+palavra)
        this.text = palavra
        this.height = ctx.font.match(/\d+/).pop() || 10
        
        this.list_letras.length = 0;
        for(let i = 0; i < palavra.length; i++){
            this.list_letras.push(palavra[i]);
        }

        console.log(this.list_letras)
        
    }
    
    
}
 
let palavra1; // palavra

function manipularPalavra(){
    palavra1.update();
    palavra1.draw();
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    manipularPalavra();            
    requestAnimationFrame(animate);         
}

async function iniciar() {
    updateAPI();
    await new Promise(resolve => setTimeout(resolve, 5000));
    palavra1 = new palavra();  
    animate(); 
}     

iniciar()

Palavra_INPUT.addEventListener('keypress', (evt) => {
    if(evt.keyCode === 13 || evt.keyCode === 32){
        evt.preventDefault()
    } else {
        palavra1.conferirInput(evt.key)
    }
})

Palavra_INPUT.addEventListener('keydown', (evt) => {
    if(evt.keyCode === 8 ){
        evt.preventDefault()
    } 
})
