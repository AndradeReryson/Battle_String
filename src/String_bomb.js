// importando variaveis e métodos do public/main.js. 
import { bombs, ctx, canvas, desligarInput, valor_API, Palavra_INPUT, Soma_erro, Soma_pontos,
mostrarMsg, getPosicaoAleatoria, esperarSegundos} from "../../public/multiplayer/main.js"
import Palavra from './Palavra.js'

class String_bomb extends Palavra{
    constructor(txt){
        super() // é necessário chamar o construtor da mãe dessa classe (nesse caso, o palavra) para que ela herde todos os metodos e atributos
        this.y = -5;
        this.init(txt)
    }

    async init(palavra_bomb){ 
        this.y = 0;
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
                Soma_pontos(5);
            } else {
                this.list_erros.push(this.index_atual); 
                Soma_erro(1);
            }

            this.index_atual++
            
            
            if(this.index_atual == this.list_letras.length){
                if(this.list_acertos.length == this.list_letras.length){
                    Soma_pontos(10);
                    mostrarMsg(this.x, this.y, "+10", 45,"124,252,1", "up")
                }
                Palavra_INPUT.dispatchEvent(new Event('keypress'));     // 
            }
        } else {
            // aqui só roda depois de digitar a palavra inteira
            await esperarSegundos(0.05)
            desligarInput(true);
            await esperarSegundos(0.5)
            Palavra_INPUT.value = "";   
            
            this.y = -50    // esconde a bomb fora do campo visivel do canvas
            desligarInput(false);   // liga o input denovo
            bombs.shift();  // remove a primeira string bomb do vetor, 
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
                ctx.font = '60px VT323'
                ctx.fillStyle = 'orange';
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 5
                ctx.lineJoin = 'round'
                ctx.textBaseLine = 'top'
                ctx.strokeText(this.list_letras[i], x_origin, this.y)
                ctx.fillText(this.list_letras[i], x_origin, this.y)

                // Se o usuário digitou a palavra corretamente, ela muda a cor interna pra verde
                if(this.list_acertos.includes(i)){
                    ctx.fillStyle = 'green';
                    ctx.strokeStyle = 'black'
                    ctx.lineWidth = 5
                    ctx.strokeText(this.list_letras[i], x_origin, this.y)
                    ctx.fillText(this.list_letras[i], x_origin, this.y)
                } 

                x_origin += ctx.measureText(this.list_letras[i]).width 
            }
            
        } else {
            // se a palavra encostar no input
            Palavra_INPUT.value = ""    // limpa o input
            Soma_erro(this.list_letras.length) // conta +1 erro pra cada letra da palavra
            this.y = -50    // esconde a bomb fora do campo visivel do canvas
            bombs.shift();  // remove a primeira string bomb do vetor,  
        }
    }


}

export default String_bomb