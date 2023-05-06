// importando variaveis e métodos do public/main.js. 
import { socket, ctx, canvas, desligarInput, valor_API, Palavra_INPUT, Soma_erro, Soma_pontos,
mostrarMsg, getPosicaoAleatoria, esperarSegundos} from "../../public/multiplayer/main.js"

// classe palavra, está sendo responsavel por desenhar a palavra
// no canvas, o alinhamento começa pelo canto superior esquerdo, que equivale a X = 0 e Y = 0
class Palavra{
    constructor(){}
        
    init(){    
        desligarInput(false)
        this.list_letras = ['J','i','n','g','l','e','']     // jingli
        this.text = "Jingle"
        
        this.setText(valor_API) // troca os valores da "list_letras" e "text" para a palavra que a API devolveu
        
        this.height = ctx.font.match(/\d+/).pop() || 10; // altura da palavra   
        this.x = getPosicaoAleatoria(this.list_letras)
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
                Soma_pontos(5);
            } else {
                this.list_erros.push(this.index_atual); // o index da letra atual é enviado ao list_erros
                desligarInput(true)
                Palavra_INPUT.classList.add('input_dis')
                await esperarSegundos(0.7)
                Palavra_INPUT.classList.remove('input_dis')
                desligarInput(false)
                Soma_erro(1);
            }

            this.index_atual++
            
            // quando o index_atual == tamanho da palavra, ele não faz nada, pois para entrar no else e chamar a proxima palavra, o if precisa rodar + uma vez. isso força o usuário a digitar algo no input mesmo depois de ter digitado todas as letras.
            // para resolver, depois de incrementar, se o index_atual for igual o tamanho da palavra, o if abaixo aciona um keypress no input, o que faz o if rodar mais uma vez e cair no else
            if(this.index_atual == this.list_letras.length){
                if(this.list_acertos.length == this.list_letras.length){
                    Soma_pontos(10);
                    mostrarMsg(this.x, this.y, "+10", 45,"124,252,1", "up")
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
                //ctx.font = 'bold 35px VT323'
                ctx.font = '60px VT323'
                ctx.fillStyle = 'black';
                ctx.textBaseLine = 'top'
                ctx.fillText(this.list_letras[i], x_origin, this.y)
                x_origin += ctx.measureText(this.list_letras[i]).width // atualiza o X_origin para o valor atual + o tamanho da letra que foi escrita, assim a proxima letra a ser escrita ficará do lado dela
                
            }
            
        } else {
            Palavra_INPUT.value = ""
            Soma_erro(this.list_letras.length)
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

export default Palavra;