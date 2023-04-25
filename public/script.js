
const socket = io();
//const CIT_ALEATORIA_API =  'http://api.quotable.io/random';
// recebe as palavras da API
// document.fonts.add();
const CIT_ALEATORIA_API = 'https://random-word-api.herokuapp.com/word';
const Palavra_TELA = document.querySelector('.palavra-display');
const Palavra_INPUT = document.querySelector('.palavra-input');
const Tempo_TELA = document.getElementById('timer');
const Botao_iniciar = document.getElementById('Iniciar');
const Palavra_bomb = document.querySelector('.pilha-palavras');
var JOGO_EM_CURSO = false // vai dizer se o jogo está em curso ou se acabou
var STRING_BOMB_CAINDO = false // diz se tem uma string bomb a caminho 

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


desligarInput(true)

var valor_API = "Palavra"; // recebe o valor da API

// função que faz o chamado pra API e retorna uma palavra aleatória
function getPalavraAleatoria(){
    return new Promise(function (resolve, reject) {
        $.getJSON('https://random-word-api.herokuapp.com/word', function( data ) {
            let aux = JSON.stringify(data[0]);      // pega só a palavra, sem os [], mas vem com ""
            valor_API = aux.replace(/['"]+/g, '');      // tira as ""
            resolve(valor_API)                          // termina a promise (enquanto nao der resolve o método não pode ser chamado novamente)
        });
    });
}

// função que roda sem interferir no jogo, e serve para atualizar a palavra que vem da API, sempre chamando uma nova 
async function updateAPI(){
    if(JOGO_EM_CURSO){
        await getPalavraAleatoria()
        await esperarSegundos(0.5)
        console.log(valor_API)
        updateAPI()
    } else {
        return
    }
}

// retorna um valor aleatorio para a coordenada X da palavra
function getPosicaoAleatoria(comprimento_palavra){
    
    // calculo fudido ai pra selecionar um valor que não excede o canvas
    let calc = Math.abs(Math.random() * (canvas.width + comprimento_palavra*2) - (comprimento_palavra*25))

    // caso o valor seja < 100 ele soma + 100. Isso para evitar que a palavra fique na extremidade esquerda da tela
    if(calc < 100){
        return calc + 100
    } else {
        return calc
    }
}

const Soma_erro = () =>{
    const erros = document.querySelector('.erros');
  
    erros.textContent = parseInt(erros.textContent) + 1
    if(erros.textContent > 40){
        alert("GAME OVER")
    }
}

// classe palavra, está sendo responsavel por desenhar a palavra
// no canvas, o alinhamento começa pelo canto superior esquerdo, que equivale a X = 0 e Y = 0
class palavra{
    constructor(){
        
    }

    init(){    
        desligarInput(false)
        this.list_letras = ['J','i','n','g','l','e','']     // jingli
        this.text = "Jingle"
        
        this.setText(valor_API) // troca os valores da "list_letras" e "text" para a palavra que a API devolveu
        
        this.height = ctx.font.match(/\d+/).pop() || 10; // altura da palavra   
        this.x = getPosicaoAleatoria(this.list_letras.length)
        this.y = 0;      
        this.speedY = 0.9;      
        this.list_acertos = [] // acertos do usuario   
        this.list_erros = [] // erros do usuário
        this.index_atual = 0; // diz qual letra do list_letras será comparada com o input do usuário. 0 = primeira
    }

    update(){
        this.y += this.speedY;    // é chamado em milisegundos, toda vez aumentando a posição y da palavra, fazendo ela descer
    }

    async conferirInput(input){

        if(this.index_atual < this.list_letras.length){

            // se a letra inserida no input for igual a letra que está em list_letras[0]
            if(input === this.list_letras[this.index_atual]){
                this.list_acertos.push(this.index_atual); // o index da letra atual é enviado ao list_acertos
            } else {
                this.list_erros.push(this.index_atual); // o index da letra atual é enviado ao list_erros
                Soma_erro();
            }

            this.index_atual++
            
            // quando o index_atual == tamanho da palavra, ele não faz nada, pois para entrar no else e chamar a proxima palavra, o if precisa rodar + uma vez. isso força o usuário a digitar algo no input mesmo depois de ter digitado todas as letras.
            // para resolver, depois de incrementar, se o index_atual for igual o tamanho da palavra, o if abaixo aciona um keypress no input, o que faz o if rodar mais uma vez e cair no else
            if(this.index_atual == this.list_letras.length){
                if(this.list_acertos.length == this.list_letras.length){
                    socket.emit("P_bomb", this.text);
                }
                Palavra_INPUT.dispatchEvent(new Event('keypress'));     // aciona um keypress no input
            }
        } else {
            await esperarSegundos(0.05)
            desligarInput(true);
            await esperarSegundos(0.5)
            Palavra_INPUT.value = "";   // aqui só roda depois de digitar a palavra inteira
            
            this.init() 
        }
    }

    draw(){
        // confere se a letra está em uma certa altura do canvas. 
        if(this.y < canvas.height - 80){         

            // X_origin serve de referencia ao X atual na hora de escrever a primeira letra. O X é aleatório, mas depois de definido nao pode ser mudado
            // ou então a palavra vai se mover horizontalmente.
            // No caso, toda vez que o programa desenhar a primeira letra de uma palavra, ele deve desenhar a proxima letra na posição (X + tamanho_da_letra_anterior). Se usar o X diretamente, ele vai mudar o X da palavra inteira, e vai fazer ela se mover na horizontal
            let x_origin = this.x 

            for(let i = 0; i < this.list_letras.length; i++){
                
                // se, no array de acertos, houver esse index
                if(this.list_acertos.includes(i)){
                    ctx.beginPath()
                    ctx.fillStyle = 'lightgreen'
                    // desenha o retangulo por tras das letras
                    ctx.fillRect(x_origin, this.y - 30, ctx.measureText(this.list_letras[i]).width, 30)
                } else if (this.list_erros.includes(i)){
                    // esse else é caso não esteja na lista de acertos
                    ctx.beginPath()
                    ctx.fillStyle = 'red'
                    ctx.fillRect(x_origin, this.y - 30, ctx.measureText(this.list_letras[i]).width, 30)
                }

                // desenha cada letra da palavra
                ctx.beginPath()
                ctx.font = 'bold 35px Arial'
                ctx.fillStyle = 'black';
                ctx.textBaseLine = 'top'
                ctx.fillText(this.list_letras[i], x_origin, this.y)
                x_origin += ctx.measureText(this.list_letras[i]).width // atualiza o X_origin para o valor atual + o tamanho da letra que foi escrita, assim a proxima letra a ser escrita ficará do lado dela
                
            }
            
        } else {
            Palavra_INPUT.value = ""
            this.init(); // reseta a palavra, voltando ela pra Y = 0, e trocando por uma palavra nova vinda da API
        }
    }

    setText(palavra){
        //console.log("setText to "+palavra)

        this.text = palavra
        this.height = ctx.font.match(/\d+/).pop() || 10
        
        this.list_letras.length = 0; // limpa o vetor das letras

        for(let i = 0; i < palavra.length; i++){
            this.list_letras.push(palavra[i]);  // coloca letra por letra da palavra nova
        }

        //console.log(this.list_letras) 
        
    }
    
    
}

class string_bomb extends palavra{
    constructor(txt){
        super() // é necessário chamar o construtor da mãe dessa classe (nesse caso, o palavra) para que ela herde todos os metodos e atributos
        this.y = -40;
        this.init(txt);
    }

    init(palavra_bomb){ 
        this.list_letras = ['J','i','n','g','l','e','']     // jingli
        this.text = "Jingle"
        
        this.setText(palavra_bomb) 
        
        this.height = ctx.font.match(/\d+/).pop() || 10; // altura da palavra   
        this.x = getPosicaoAleatoria(this.list_letras.length)
        
        this.speedY = 0.9;      
        this.list_acertos = [] // acertos do usuario   
        this.list_erros = [] // erros do usuário
        this.index_atual = 0; // diz qual letra do list_letras será comparada com o input do usuário. 0 = primeira
    }

    async conferirInput(input){

        if(this.index_atual < this.list_letras.length){

            if(input === this.list_letras[this.index_atual]){
                this.list_acertos.push(this.index_atual); 
            } else {
                this.list_erros.push(this.index_atual); 
                Soma_erro();
            }

            this.index_atual++
            
            
            if(this.index_atual == this.list_letras.length){
                Palavra_INPUT.dispatchEvent(new Event('keypress'));     // aciona um keypress no 
            }
        } else {
            await esperarSegundos(0.05)
            desligarInput(true);
            await esperarSegundos(0.5)
            Palavra_INPUT.value = "";   // aqui só roda depois de digitar a palavra inteira
            
            this.y = -50    // esconde a bomb no topo do canvas 
            desligarInput(false);   // liga o input denovo
            bombs.shift();  // remove a primeira string bomb do vetor
        }
    }

    draw(){
        if(this.y < canvas.height - 80){         

            let x_origin = this.x 

            for(let i = 0; i < this.list_letras.length; i++){
                
                if(this.list_acertos.includes(i)){
                    ctx.beginPath()
                    ctx.fillStyle = 'lightgreen'
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
                x_origin += ctx.measureText(this.list_letras[i]).width 
            }
            
        } else {
            //STRING_BOMB_CAINDO = false;
            Palavra_INPUT.value = ""
            this.y = -50;
            bombs.shift();
        }
    }


}

// vetor que vai guardar todas as string bombs
const bombs = []
socket.on("texto_bomb_cliente", (texto) =>{
    //STRING_BOMB_CAINDO = true;
    bombs.push(new string_bomb(texto)); 
    //
    const bomb_span = document.createElement('span')
    bomb_span.innerText = texto;
    Palavra_bomb.appendChild(bomb_span)

    //console.log(texto);
});


// imrpime a contagem regressiva e segura o program pela quantidade de segundos determina
async function contagemRegress(tempo){
    ctx.beginPath()
    ctx.font = 'bold 90px Arial'
    ctx.fillStyle = 'black';
    ctx.textBaseLine = 'top'
    
    let pos_x = canvas.width/2 - 45
    let pos_y = canvas.height/2 - 10
    

    for(let i = tempo; i > 0; i--){
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillText(i, pos_x, pos_y);
        await esperarSegundos(1);
    }
}

let palavra1; // palavra1 será a palavra que desce, ainda não foi criado o objeto

// primeira função a ser executada, ela que inicia todas as outras
// primeiro, ela inicia o chamado da API por uma nova palavra, antes de desenhar qualquer palavra. A API demora um pouco pra devolver o valor, por isso rodamos antes
// depois, esperaramos 5 segundos (5000 milisegundos) antes de criar o objeto da palavra e desenhá-la
// o async permite que usemos o await na função. Isso faz com que a função espere a linha terminar sua execução antes de ir pra próxima
async function iniciar() {
    JOGO_EM_CURSO = true;
    updateAPI();
    await contagemRegress(5);
    bombs.length = 0; // zera as bombs
    palavra1 = new palavra();  
    palavra1.init()
    desligarInput(false)
    tempo_inicial = 60
    startTimer();
    animate(); 
}     

// essa função é a que faz a palavra descer, toda vez que é chamada, ela muda o Y da palavra para +1 e desenha ela de novo, bem rapido, o que da ilusão de movimento
function manipularPalavra(){
    palavra1.update();
    palavra1.draw();
    
    // se o vetor tiver no mínimo uma string bomb ele vai desenhá-la
    if(bombs.length > 0){
        for(let i = 0; i < bombs.length; i++){
            bombs[i].update(); // 
            bombs[i].draw();
        }
    }
}

// uma vez desenhada a palavra no canvas, ela permanece la, mesmo desenhando outra. Para apagar a posição antiga, usamos o clearRect, e chamamos o metodo manipularPalavra().
function animate(){
    if(JOGO_EM_CURSO){
        ctx.clearRect(0, 0, canvas.width, canvas.height);   
        manipularPalavra();            
        requestAnimationFrame(animate);     // torna a função recursiva, ou seja, sempre que a palavra for desenhada, ja vai ser redesenhada
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);   
        return 
    }
}

// previne a inserção da tecla Enter (keycode 13) e barra de espaço (keycode 32)
// http://www.javascripter.net/faq/keycodes.htm
Palavra_INPUT.addEventListener('keypress', (evt) => {
    if(evt.keyCode === 13 || evt.keyCode === 32){
        evt.preventDefault()
    } else {

        try{
            if(bombs[0].y > palavra1.y){
                bombs[0].conferirInput(evt.key)
            } else {
                palavra1.conferirInput(evt.key)
            }
        } catch (e){
            palavra1.conferirInput(evt.key)
        }
    }
})

// previne inserção de backspace, keycode 8
Palavra_INPUT.addEventListener('keydown', (evt) => {
    if(evt.keyCode === 8 ){
        evt.preventDefault()
    } 
})

// funcao que desliga/liga o input
function desligarInput(b){
    if (b == true){
        Palavra_INPUT.disabled = true
    } else {
        Palavra_INPUT.disabled = false;
    } 
    Palavra_INPUT.focus();
}

// função que recebe segundos e faz o javascript esperar através de uma promise
// serve apenas para atrasar algumas outras funções
async function esperarSegundos(segundos){
    let tempo = segundos * 1000
    await new Promise(resolve => setTimeout(resolve, tempo));
}


/*
    Colocar em outro arquivo depois
*/

var tempo_inicial; // setado dentro do click do botão_iniciar
var intervalo_timer; // variavel com o id do intervalo que controla o cronometro

function startTimer() {
  intervalo_timer = setInterval(() => {
    timer.innerText = cronometro()
  }, 1000)
}

function cronometro() {
  if(tempo_inicial>0){  //  se o tempo for maior de 0 ele atualiza o cronometro
    var crono = tempo_inicial--
    return crono
  } else if(tempo_inicial == 0){
    finalizarPartida()
    return 0 // 
  }
}

Botao_iniciar.addEventListener('click', () => {
    iniciar();
    Botao_iniciar.hidden = true;
})

async function finalizarPartida(){
    JOGO_EM_CURSO = false
    palavra1.init();
    Botao_iniciar.hidden = false // mostra o botao iniciar denovo
    desligarInput(true); // desliga o textfield
    Palavra_INPUT.value = ""
    timer.innerText = 0;           // zera o timer
    tempo_inicial = -1; // setado para -1 para nao criar um laço infinito no cronometro
    clearInterval(intervalo_timer);
}