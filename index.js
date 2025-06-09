const express = require('express');
const http = require('http');

const {Server} = require('socket.io');

const app = express();
app.use(express.text({type: 'application/xml' }));  
//octet stream indica que los archivos enviados estan en binario



const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: 'https://oicdev-frgitaxj5uzq-fr.integration.ocp.oraclecloud.com',  //cambiarlo a dominio de VB al subirlo a la nube
    // https://oicdev-frgitaxj5uzq-fr.integration.ocp.oraclecloud.com/ic/builder/design/XX_O2C_EDI_VB/1.0/preview/webApps/main/
    methods: ['POST'],
    credentials: true
    }

});

const clients = new Map();

io.on('connection',(socket) => {    
   console.log('esperando clientes');

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
    
    const id = req.query.vbId;
    console.log('llamada recibida con id: ', id);

        const xml = req.body;
        console.log('XML recibido correctamente: ',xml);

    const socket = clients.get(id);
    if(socket){
        console.log('enviando respuesta al cliente con id: ',id);
        socket.emit('xml-response', {id,xml});
        console.log('XML enviado');
        res.sendStatus(200);
    }
    else{
        console.log('cliente no encontrado');
        res.status(404).send('cliente desconectado');
    }
});

server.listen(8080,() => {
    console.log('servidor escuchando en el puerto 8080');
});

