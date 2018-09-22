"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const web_socket_handler_1 = require("./web-socket-handler");
class Attach {
    constructor(config) {
        this.handler = new web_socket_handler_1.WebSocketHandler(config);
    }
    attach(namespace, podName, containerName, stdout, stderr, stdin, tty) {
        const query = {
            container: containerName,
            stderr: stderr != null,
            stdin: stdin != null,
            stdout: stdout != null,
            tty,
        };
        const queryStr = querystring.stringify(query);
        const path = `/api/v1/namespaces/${namespace}/pods/${podName}/attach?${queryStr}`;
        const promise = this.handler.connect(path, () => { return; }, (streamNum, buff) => {
            web_socket_handler_1.WebSocketHandler.handleStandardStreams(streamNum, buff, stdout, stderr);
        });
        const result = new Promise((resolvePromise, reject) => {
            promise.then(() => resolvePromise(), (err) => reject(err));
        });
        return result;
    }
}
exports.Attach = Attach;
//# sourceMappingURL=attach.js.map