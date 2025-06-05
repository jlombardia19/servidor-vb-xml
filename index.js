const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
app.use(express.text({type: 'application/octet-stream' }));  
//octet stream indica que los archivos enviados estan en binario

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: 'oicdev-frgitaxj5uzq-fr.integration.ocp.oraclecloud.com',  //cambiarlo a dominio de VB al subirlo a la nube
        methods: ['GET','POST']
    }

});

const clients = new Map();

io.on('connection',(socket) => {
   

    socket.on('register', (id) => {
        clients.set(id, socket);

        socket.on('disconnect', () => {
            clients.delete(id);
        });
    });
});

app.post('/enviar-xml', (req,res) =>{

    const id = req.headers['vbId'];
    const xml = atob(req.body);

    const socket = clients.get(id);
    if(socket){
        socket.emit('xml-response', {id,xml});
        res.sendStatus(200);
    }
    else{
        res.sendStatus(404).send('cliente desconectado');
    }
});

server.listen(3000,() => {
});

