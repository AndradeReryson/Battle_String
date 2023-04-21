
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
            aux = JSON.stringify(data[0]);      // pega só a palavra, sem os [], mas vem com ""
            valor_API = aux.replace(/['"]+/g, '');      // tira as ""
            resolve(valor_API)                          // termina a promise (enquanto nao der resolve o método não pode ser chamado novamente)
        });
    });
}

// função que roda sem interferir no jogo, e serve para atualizar a palavra que vem da API, sempre chamando uma nova 
async function updateAPI(){
    await getPalavraAleatoria()
    updateAPI()
}

// retorna um valor aleatorio para a coordenada X da palavra
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

    conferirInput(input){
        // index_atual controla com qual letra da palavra o input deve ser comparado. Só deve aumentar até o tamanho da palavra - 1
        if(this.index_atual < this.list_letras.length){

            // suponhamos que estamos na primeira letra, ou seja, index_atual = 0
            // se a letra inserida no input for igual a letra que está em list_letras[0]
            if(input === this.list_letras[this.index_atual]){
                this.list_acertos.push(this.index_atual); // o index da letra atual é enviado ao list_acertos
            } else {
                this.list_erros.push(this.index_atual); // o index da letra atual é enviado ao list_erros
            }

            this.index_atual++  // muda a letra atual de comparação para a proxima
        } else {

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

        console.log(this.list_letras) 
        
    }
    
    
}
 
let palavra1; // palavra1 será a palavra que desce, ainda não foi criado o objeto

// essa função é a que faz a palavra descer, toda vez que é chamada, ela muda o Y da palavra para +1 e desenha ela de novo, bem rapido, o que da ilusão de movimento
function manipularPalavra(){
    palavra1.update();
    palavra1.draw();
}

// uma vez desenhada a palavra no canvas, ela permanece la, mesmo desenhando outra. Para apagar a posição antiga, usamos o clearRect, e chamamos o metodo que desenha
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    manipularPalavra();            
    requestAnimationFrame(animate);     // torna a função recursiva, ou seja, sempre que a palavra for desenhada, 
}

// primeira função a ser executada, ela que inicia todas as outras
// primeiro, ela inicia o chamado da API por uma nova palavra, antes de desenhar qualquer palavra. A API demora um pouco pra devolver o valor, por isso rodamos antes
// depois, usamos o await new promise [...] para fazer a função esperar 5 segundos (5000 milisegundos) antes de criar o objeto da palavra e desenhá-la
// o async permite que usemos o await na função. Isso faz com que a função espere a linha terminar sua execução antes de ir pra próxima
async function iniciar() {
    updateAPI();
    await new Promise(resolve => setTimeout(resolve, 5000));
    palavra1 = new palavra();  
    animate(); 
}     

iniciar() 

// previne a inserção da tecla Enter (keycode 13) e barra de espaço (keycode 32)
// http://www.javascripter.net/faq/keycodes.htm
Palavra_INPUT.addEventListener('keypress', (evt) => {
    if(evt.keyCode === 13 || evt.keyCode === 32){
        evt.preventDefault()
    } else {
        palavra1.conferirInput(evt.key)
    }
})

// previne inserção de backspace, keycode 8
Palavra_INPUT.addEventListener('keydown', (evt) => {
    if(evt.keyCode === 8 ){
        evt.preventDefault()
    } 
})
