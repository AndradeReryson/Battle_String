import { desligarInput } from "./main.js";

const modal = document.getElementById('container-modal-resultado');
const botao = document.getElementById('btn-continuar')

/* campos do modal */
const tbl_erros = document.getElementById('resultado-erros');
const tbl_pontos = document.getElementById('resultado-pontos');
const tbl_deducao = document.getElementById('resultado-deducao');
const tbl_total = document.getElementById('resultado-total');

/* contador de erros e de pontos */
const erros = document.getElementById('erros')
const pontos = document.getElementById('pontos')


async function esperarSegundos(segundos){
    let tempo = segundos * 1000
    await new Promise(resolve => setTimeout(resolve, tempo));
}

export async function mostrarResultado(er, po){
    erros.textContent = "0"
    pontos.textContent = "000000"

    desligarInput(true);
    $('#line1').hide();
    $('#line2').hide();
    $('#line3').hide();
    $('#line4').hide();
    $('#btn-continuar').hide();

    let valor_erros = parseInt(er)
    let valor_deducao = (valor_erros * 5)
    let valor_pontos = parseInt(po)

    
    modal.style.display = 'flex'
    $('#container-modal-resultado').hide();
    modal.style.zIndex = 2
    $('#container-modal-resultado').fadeIn(500);
    
    await esperarSegundos(2);
    $('#line1').show(100);

    await (async () => {
        for(let i = 0; i<=valor_erros; i++){
            tbl_erros.innerText = i;
            await esperarSegundos(0.004);
        }
    })();

    await esperarSegundos(1);
    $('#line2').show(100);

    await (async () => {
        for(let i = 0; i<=valor_pontos; i++){
            tbl_pontos.innerText = i;
            await esperarSegundos(0.002);
        }
    })();

    
    await esperarSegundos(1);
    $('#line3').show(100);

    
    await (async () => {
        for(let i = 0; i<=valor_deducao; i++){
            tbl_deducao.innerText = "-"+i;
            await esperarSegundos(0.004);
        }
    })();

    await esperarSegundos(1);
    $('#line4').show(100);

    await (async () => {
        if(valor_pontos >= valor_deducao){
            for(let i = 0; i<=(valor_pontos - valor_deducao); i++){
                tbl_total.innerText = i;
                await esperarSegundos(0.002);
            }
        } else {
            tbl_total.innerText = 0;
            await esperarSegundos(0.2);
        }
    })();
    await esperarSegundos(1);
    $('#btn-continuar').fadeIn(2000)
} 

botao.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.style.zIndex = -1;
});