{{ new Promise((resolve, reject) => {
        require(
          ['https://cdn.socket.io/4.7.2/socket.io.min.js'],
          function(io) {

            const clientId = $application.user.userId;

            // 2.2) Conectar al servidor Socket.IO
            const socket = io('https://servidor-vb-xml.onrender.com');
            console.log('creada variable SOCKET');
            // 2.3) Timeout a 5 minutos (300 000 ms)
            const timeoutHandle = setTimeout(() => {
              socket.disconnect();
              reject(new Error('Tiempo de espera agotado'));
            }, 5 * 60 * 1000);
            console.log('TIMEOUTHANDLER CREADO: ',timeoutHandle);
            // 2.4) Al conectar, enviar registro
            socket.on('connect', function() {
              console.log('Conectado al servidor socket');
              socket.emit('register', clientId);
            });

            // 2.5) Al llegar el XML‐respuesta
            socket.on('xml-response', function(data) {
              if (data.id === clientId) {
                clearTimeout(timeoutHandle);

                // Decodificar el XML (si viene Base64/UTF-8)
                let xml;
                try {
                  xml = decodeURIComponent(escape(data.xmlData));
                } catch (e) {
                  xml = data.xmlData;
                }

                // Guardar en variable de VB
                context.variables.xmlData = xml;

                // Disparar evento en VB
                Actions.fireEvent(context, {
                  event: 'xmlRecieved',
                  payload: {
                    xmlDataRecieved: xml
                  }
                });

                socket.disconnect();
                resolve({ xml: xml });
              }
            });

            // 2.6) Si hay error de conexión
            socket.on('connect_error', function(err) {
              clearTimeout(timeoutHandle);
              console.error('Error de conexión:', err.message);
              reject(err);
            });
          }
        );
      })
 }}