{{ new Promise((resolve, reject) => {
        require(
          ['https://cdn.socket.io/4.7.2/socket.io.min.js'],
          function(io) {

            const clientId = $application.user.userId;

            const socket = io('https://servidor-vb-xml.onrender.com');

            const timeoutHandle = setTimeout(() => {
              socket.disconnect();
              reject(new Error('Tiempo de espera agotado'));
            }, 5 * 60 * 1000);
            socket.on('connect', function() {
              socket.emit('register', clientId);
            });

            socket.on('xml-response', function(data) {
              if (data.id === clientId) {
                clearTimeout(timeoutHandle);
                const xml = data.xml;

                context.$page.variables.xmlData = xml;


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

            socket.on('connect_error', function(err) {
              clearTimeout(timeoutHandle);
              console.error('Error de conexión:', err.message);
              reject(err);
            });
          }
        );
      })
 }}