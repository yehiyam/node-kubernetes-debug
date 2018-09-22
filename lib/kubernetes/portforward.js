"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const querystring = require("querystring");
const web_socket_handler_1 = require("./web-socket-handler");
class PortForward {
    constructor(config) {
        this.handler = new web_socket_handler_1.WebSocketHandler(config);
    }
    // TODO: support multiple ports for real...
    portForward(namespace, podName, ports, output, err, input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (ports.length > 1) {
                process.stderr.write('ERROR: Only one port is currently supported for port-forward');
            }
            const query = {
                ports: ports[0],
            };
            const queryStr = querystring.stringify(query);
            const firstRead = [];
            ports.forEach((value, index) => {
                firstRead[index * 2] = true;
                firstRead[index * 2 + 1] = true;
            });
            const path = `/api/v1/namespaces/${namespace}/pods/${podName}/portforward?${queryStr}`;
            const conn = yield this.handler.connect(path, () => { }, (streamNum, buff) => {
                if (streamNum >= ports.length * 2) {
                    process.stdout.write(`unexpected stream: ${streamNum}\n`);
                    return;
                }
                if (firstRead[streamNum]) {
                    buff = buff.slice(2);
                    firstRead[streamNum] = false;
                }
                // First two bytes are the port number
                if (buff.length > 0) {
                    if (streamNum % 2 === 1 && err) {
                        err.write(buff);
                    }
                    else {
                        output.write(buff);
                    }
                }
            });
            web_socket_handler_1.WebSocketHandler.handleStandardInput(conn, input, 0);
            return conn;
        });
    }
}
exports.PortForward = PortForward;
//# sourceMappingURL=portforward.js.map