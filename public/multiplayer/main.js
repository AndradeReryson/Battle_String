// importando a Palavra la do src
import Palavra from "../../src/Palavra.js";
const palavra = Palavra;

// importando a String bomb do src
import String_bomb from "../../src/String_bomb.js";
const string_bomb = String_bomb;

// importando a Mensagem la do src
import Mensagem from "../../src/Mensagem.js";
const mensagem = Mensagem;

// metodo que chama o modal
import {mostrarResultado} from "./modal.js";

(async function carregarFonte() {
    const font = new FontFace("VT323", "url(../VT323-Regular.ttf)")
    await font.load();
    document.fonts.add(font);
})();

export const socket = io();

export const Palavra_INPUT = document.querySelector('.palavra-input');
const Botao_iniciar = document.getElementById('Iniciar');
const Palavra_bomb = document.querySelector('.pilha-palavras');
const contador_pontos = document.querySelector('.pontos');
const contador_erros = document.querySelector('.erros');
var JOGO_EM_CURSO = false // flag que vai dizer se o jogo está em curso ou se acabou

export const canvas = document.getElementById('palavra_display');
export const ctx = canvas.getContext('2d') // o ctx é quem desenha as formas
canvas.style.width = '100%'; // comprimento externo do canvas
canvas.style.height = '100%'; // altura externa do canvas
canvas.width  = canvas.offsetWidth; // comprimento interno do canvas
canvas.height = canvas.offsetHeight; // altura interna do canvas 
// o canvas.style muda o tamanho externo, sem mudar o interno, isso faz o canvas ficar distorcido


/**/
window.addEventListener('resize', function(){
    //canvas.style.width = '100%'; 
    //canvas.style.height = '100%'; 
    canvas.width  = canvas.offsetWidth; 
    canvas.height = canvas.offsetHeight; 
});

// por padrão o input vai vir desligado
desligarInput(true)

// função que faz o chamado pra API e retorna uma palavra aleatória
export function getPalavraAleatoria(){
    return new Promise(function (resolve, reject) {
        $.getJSON('https://random-word-api.herokuapp.com/word', function( data ) {
            let aux = JSON.stringify(data[0]);      // pega só a palavra, sem os [], mas vem com ""
            valor_API = aux.replace(/['"]+/g, '');      // tira as ""
            resolve(valor_API)                          // termina a promise (enquanto nao der resolve o método não pode ser chamado novamente)
        });
    });
}

// função que roda sem interferir no jogo, e serve para atualizar a palavra que vem da API, sempre chamando uma nova 
export var valor_API = "Palavra"; // recebe o valor da API
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
export function getPosicaoAleatoria(lista_letras){
    let comprimento_palavra = 0;

    // descobrindo o tamanho da palavra medindo cada letra e somando
    for(let i = 0; i<lista_letras.length; i++){
        comprimento_palavra += (ctx.measureText(lista_letras[i]).width + 20)
    }

    // Math.floor(Math.random() * (myMax - myMin + 1) + myMin);
    // calculo pra escolher uma posição no eixo X pra palavra, de modo que ela não exceda o canvas 
    let min = ((100))
    let max = ((canvas.width - comprimento_palavra + min))
    let calc = Math.abs( Math.random() * (max - min + 1) + min)

    return calc

}


// aumenta a pontuação do usuário ao contador de pontos
export const Soma_pontos = (valor) =>{
    // elemento HTML que mostra os pontos
    const pontos = document.querySelector('.pontos');
  
    let str_pontos = "";
    let p = parseInt(pontos.textContent) + valor

    // preenche a pontuação com 0 a esquerda (int não permite 0 a esquerda ._.)
    for(let i = p.toString().length; i<6; i++){
        str_pontos += "0";
    }

    // reescreve no HTML, somando os 0 a esquerda com o valor dos pontos 
    pontos.textContent = (str_pontos + p.toString())

    
}

// soma os erros do usuário ao contador de erros
export const Soma_erro = (valor) =>{
    // elemento HTML que conta os erros
    const erros = document.querySelector('.erros');
  
    // reescreve no HTML, somando os erros cometidos
    erros.textContent = parseInt(erros.textContent) + valor
}

// vetor que guarda as mensagems a serem exibidas no canvas
export const mensagens = [];
export function mostrarMsg(pos_x, pos_y, text, size, cor, direc){
    mensagens.push(new mensagem(pos_x, pos_y, text, size, cor, direc))
}

// quando o socket receber uma mensagem, ele vai criar uma string_bomb
// vetor que vai guardar todas as string bombs
export const bombs = []
socket.on("texto_bomb_cliente", async (texto) =>{

    // mostra uma mensagem no canto superior esquerdo do canvas, avisando que vem bomba
    mostrarMsg(10, 30, "String Bomb", 30,"255,165,0", "idle")

    /* antes de criar e mostrar a bomb na tela, se a palavra estiver bem no começo do canvas ou proximo do fim, deve-se esperar 1 segundo
    isso para evitar que a bomb fique por cima da palavra*/
    if(palavra1.y < 70 || palavra1.y > canvas.height - 110){
        await esperarSegundos(1)
    } 

    // cria a nova string bomb com o texto informado, e coloca ela no vetor de bombs para que seja desenhada
    bombs.push(new string_bomb(texto)); 
    
    // coloca a palavra da bomb na pilha de palavras 
    const bomb_span = document.createElement('span')
    bomb_span.innerText = texto;
    Palavra_bomb.appendChild(bomb_span)

    //console.log(texto);
});



// funcao que desliga/liga o input
export function desligarInput(b){
    if (b == true){
        Palavra_INPUT.disabled = true
    } else {
        Palavra_INPUT.disabled = false;
    } 
    Palavra_INPUT.focus();
}

// imrpime a contagem regressiva e segura o program pela quantidade de segundos determina
async function contagemRegress(tempo){
    ctx.beginPath()
    ctx.font = '150px VT323'
    ctx.fillStyle = 'black';
    ctx.textBaseLine = 'top'
    
    let pos_x = canvas.width/2 - 45
    let pos_y = canvas.height/2 - 10
    

    for(let i = tempo; i > 0; i--){
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillText(i, pos_x, pos_y);
        await esperarSegundos(1);
    }

    timer.innerText = 20
}


// primeira função a ser executada, ela que inicia todas as outras
// primeiro, ela inicia o chamado da API por uma nova palavra, antes de desenhar qualquer palavra. A API demora um pouco pra devolver o valor, por isso rodamos antes
// depois, esperaramos 5 segundos (5000 milisegundos) antes de criar o objeto da palavra e desenhá-la
// o async permite que usemos o await na função. Isso faz com que a função espere a linha terminar sua execução antes de ir pra próxima

let palavra1; // palavra1 será a palavra que desce, ainda não foi criado o objeto
async function iniciar() {
    JOGO_EM_CURSO = true;
    updateAPI();
    await contagemRegress(5);
    startTimer();
    bombs.length = 0; // zera as bombs
    palavra1 = new palavra();  
    palavra1.init()
    desligarInput(false)
    tempo_inicial = 20
    
    animate(); 
}     

function manipularPalavra(){
    // essa função é a que faz a palavra descer, toda vez que é chamada, ela muda o Y da palavra para +1 e desenha ela de novo, bem rapido, o que da ilusão de movimento
    palavra1.update();
    palavra1.draw();
    
    // se o vetor de bombas tiver no mínimo uma string bomb ele vai desenhá-la
    if(bombs.length > 0){
        for(let i = 0; i < bombs.length; i++){
            bombs[i].update(); // 
            bombs[i].draw();
        }
    }

    // se o vetor tiver alguma mensagem, ela será desenhada
    if(mensagens.length > 0){
        for(let i = 0; i < mensagens.length; i++){
            mensagens[i].draw();
            mensagens[i].update(); // 
        }
    }
}

// uma vez desenhada a palavra no canvas, ela permanece la, mesmo desenhando outra. Para apagar a posição antiga, usamos o clearRect, e chamamos o metodo manipularPalavra().
function animate(){
    if(JOGO_EM_CURSO){
        ctx.clearRect(0, 0, canvas.width, canvas.height);   
        manipularPalavra();                 // aqui é onde é desenhado de fato a palavra, as string bombs e as mensagens
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

        // se tiver uma string bomb, e ela estiver mais proxima do input que a palavra, as letras dela serão conferidas
        // caso contrario, a palavra normal será conferida
        try{
            if(bombs[0].y > palavra1.y){
                bombs[0].conferirInput(evt.key)
            } else {
                palavra1.conferirInput(evt.key)
            }
        } catch (e){
            // catch pois no inicio do game, ainda não há string bombs, então ele vai sempre cair aqui
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


// função que recebe segundos e faz o javascript esperar através de uma promise
// serve apenas para atrasar algumas outras funções
export async function esperarSegundos(segundos){
    let tempo = segundos * 1000
    await new Promise(resolve => setTimeout(resolve, tempo));
}


/*
    Colocar em outro arquivo depois
*/

var tempo_inicial; // setado dentro do click do botão_iniciar
var intervalo_timer; // variavel com o id do intervalo que controla o cronometro

/* controla o timer, chamando o cronometo() para atualizar o valor*/
function startTimer() {
  intervalo_timer = setInterval(() => {
    timer.innerText = cronometro()
  }, 1000)
}

/* função que faz o timer funcionar */
function cronometro() {
  if(tempo_inicial>0){  //  se o tempo for maior de 0 ele atualiza o cronometro
    var crono = tempo_inicial--
    return crono
  } else if(tempo_inicial == 0){    // se o tempo for 0, ele finaliza a partida
    finalizarPartida()
    return 0 // 
  } else {
    return "--"
  }
}

/* fazendo o botão iniciar funcionar */
Botao_iniciar.addEventListener('click', () => {
    iniciar();
    Botao_iniciar.hidden = true;
})

async function finalizarPartida(){
    JOGO_EM_CURSO = false
    tempo_inicial = -1; // setado para -1 para nao criar um laço infinito no cronometro
    timer.innerText = "--";           // zera o timer
    
    desligarInput(true); // desliga o textfield
    Palavra_INPUT.value = ""        // limpa o input
    await esperarSegundos(2)
    mostrarResultado(contador_erros.textContent, contador_pontos.textContent); 
    Botao_iniciar.hidden = false // mostra o botao iniciar denovo
    clearInterval(intervalo_timer);
}