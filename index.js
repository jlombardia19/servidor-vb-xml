const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
app.use(express.text({type: 'application/xml' }));  
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
        console.log('cliente conectado con id: ', id);
        clients.set(id, socket);

        socket.on('disconnect', () => {
            console.log('cliente desconectado con id: ',id);
            clients.delete(id);
        });
    });
});

app.post('/enviar-xml', (req,res) =>{
    console.log('llamada recibida');
    const id = req.headers['vbId'];
    
        const xml = req.body;
        console.log('XML recibido correctamente: ',xml);

    const socket = clients.get(id);
    if(socket){
        console.log('enviando respuesta al cliente con id: ',id);
        socket.emit('xml-response', {id,xml});
        res.sendStatus(200);
    }
    else{
        res.sendStatus(404).send('cliente desconectado');
    }
});

server.listen(8080,() => {
    console.log('servidor escuchando en el puerto 8080');
});

