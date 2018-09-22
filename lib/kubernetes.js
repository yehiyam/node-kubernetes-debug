const k8s = require('./kubernetes/index');
const net = require('net');
class Kubernetes {
    init() {
        this._kc = new k8s.KubeConfig();
        this._kc.loadFromDefault();
    }

    async pods(namespace) {
        const k8sApi = this._kc.makeApiClient(k8s.Core_v1Api);
        const res = await k8sApi.listNamespacedPod('default');
        if (res && res.body) {
            return res.body.items
        }
        return [];
    }
    portForward(namespace, pod, port, localPort) {
        const portforward = new k8s.PortForward(this._kc);
        const server = net.createServer((socket) => {
            portforward.portForward(namespace, pod, [port], socket, null, socket);
        })
        server.listen(localPort, '127.0.0.1');
    }
    async enableDebug(namespace, pod) {
        let exec = new k8s.Exec(this._kc);
        await exec.exec(namespace, pod, null, 'kill -SIGUSR1 1', process.stdout, process.stderr, process.stdin, false /* tty */);
    }
}

module.exports = new Kubernetes();