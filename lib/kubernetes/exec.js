"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const querystring = require("querystring");
const web_socket_handler_1 = require("./web-socket-handler");
class Exec {
    constructor(config) {
        this.handler = new web_socket_handler_1.WebSocketHandler(config);
    }
    // TODO: make command an array and support multiple args
    exec(namespace, podName, containerName, command, stdout, stderr, stdin, tty) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                stdout: stdout != null,
                stderr: stderr != null,
                stdin: stdin != null,
                tty,
                command,
                container: containerName,
            };
            const queryStr = querystring.stringify(query);
            const path = `/api/v1/namespaces/${namespace}/pods/${podName}/exec?${queryStr}`;
            const conn = yield this.handler.connect(path, (text) => { return; }, (streamNum, buff) => {
                web_socket_handler_1.WebSocketHandler.handleStandardStreams(streamNum, buff, stdout, stderr);
            });
            if (stdin != null) {
                web_socket_handler_1.WebSocketHandler.handleStandardInput(conn, stdin);
            }
            return conn;
        });
    }
}
exports.Exec = Exec;
//# sourceMappingURL=exec.js.map