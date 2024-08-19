import * as net from 'node:net';

/**
 * After finding an open port, we close the server and release allocated resources (including the port itself).
 * Therefore, the following situation is possible:
 * 1. The OS allocated port N to us, the promise successfully resolved
 * 2. The server closed, the adapter process released port N
 * 3. Another process requested the port, the OS allocated port N to it
 * 4. The adapter process tries to use port N, which the function previously released, and gets an error
 *
 * This problem can be solved in several ways:
 * 1. Do not close the server until the port is used
 * 2. Request new port if it turns out that it is already in use by other process
 *
 * It is unknown with what probability such a situation may arise, but at the moment
 * I preferred not to complicate the code by handling such an edge case.
 */
function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer((sock) => {
      sock.end();
    });
    server.on('error', (e) => {
      reject(e);
      server.close();
    });
    server.listen(0, () => {
      const freePort = (server.address() as net.AddressInfo).port;
      resolve(freePort);
      server.close();
    });
  });
}

function uniqueId() {
  return Math.random().toString(36).slice(2);
}

export async function generateDebuggerUrl() {
  const port = await findAvailablePort();
  return `ws://localhost:${port}/${uniqueId()}`
}