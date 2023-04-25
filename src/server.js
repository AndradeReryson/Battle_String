import express  from "express";
import url from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";

const app = express();
const porta = process.env.porta || 8080;

const caminho = url.fileURLToPath(import.meta.url);
const diretorio_Public = path.join(caminho, "../..", "public");
app.use(express.static(diretorio_Public));

const servidor_http = http.createServer(app);

servidor_http.listen(porta, () => console.log(`Servidor escutando na porta ${porta}`));

const io = new Server(servidor_http);

io.on("connection", (socket) => {
    console.log("Um cliente está conectado");

    socket.on("P_bomb", (bomb_text) => {
        socket.broadcast.emit("texto_bomb_cliente", bomb_text)
        //console.log(D);
    });
});
