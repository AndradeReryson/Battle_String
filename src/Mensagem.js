import { ctx, mensagens } from '../../public/multiplayer/main.js';

// a mensagem será desenhada no canvas com base nos parametros passados no construtor
class Mensagem{
    constructor(pos_x, pos_y, msg, size, cor, direc){
        ctx.beginPath()
        this.cor = cor      // cor da palavra (usando o esquema RGB, pra depois mexermos na opacidade)
        this.x = pos_x;     // posição X no canvas
        this.y = pos_y;     // posição Y no canvas
        this.text = msg;    // texto da mensagem
        this.size = size;   // tamanho da letra
        this.direc = direc; // direção para qual a mensagem vai andar (cima, baixo ou parada)
        /**/
        this.tempo = 0;     // tempo que a mensagem fica na tela (começa com 0)
        this.opacity = 1;   // opacidade da palavra (começa visivel)
    }

    update(){
        // controla o tempo que a mensagem fica na tela, por padrão só fica 70 frames
        if(this.tempo < 70){

            // quando passar 30 frames ela começa a desaparecer (diminuindo a opacidade)
            if(this.tempo > 30){
                this.opacity -= 0.03;
            }

            // se a direção for "up" ela se move lentamente pra cima
            // se for "down" ela desce um pouco
            // se for qualquer outra coisa ela vai ficar parada
            if(this.direc == "up"){
                this.y -= 0.1;
            } else if (this.direc == "down"){
                this.y += 0.1;
            }

            // aumenta a contagem de frames
            this.tempo += 1;
        } else {
            // quando se passarem 70 frames, a mensagem vai ser tirada do vetor de mensagens, o que faz ela parar de ser desenhada
            mensagens.shift();
        }
    }

    draw(){
        // configurações do desenha da palavra
        ctx.font = this.size+'px VT323';
        ctx.fillStyle = 'rgba('+this.cor+','+this.opacity+')';
        ctx.strokeStyle = 'rgba(1, 1, 1,'+this.opacity+')';
        ctx.lineWidth = 5;      // grossura do contorno 
        ctx.lineJoin = 'round'  // arredonda bordas onde o contorno ficaria reto, criando pontas
        ctx.strokeText(this.text, this.x, this.y)
        ctx.fillText(this.text, this.x, this.y)
    }
}

export default Mensagem;