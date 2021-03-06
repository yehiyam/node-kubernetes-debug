"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const base64 = require("base-64");
const yaml = require("js-yaml");
const jsonpath = require("jsonpath");
const shelljs = require("shelljs");
const api = require("./api");
const config_types_1 = require("./config_types");
class KubeConfig {
    // Only really public for testing...
    static findObject(list, name, key) {
        for (const obj of list) {
            if (obj.name === name) {
                if (obj[key]) {
                    return obj[key];
                }
                return obj;
            }
        }
        return null;
    }
    getContexts() {
        return this.contexts;
    }
    getClusters() {
        return this.clusters;
    }
    getUsers() {
        return this.users;
    }
    getCurrentContext() {
        return this.currentContext;
    }
    setCurrentContext(context) {
        this.currentContext = context;
    }
    getContextObject(name) {
        return KubeConfig.findObject(this.contexts, name, 'context');
    }
    getCurrentCluster() {
        return this.getCluster(this.getCurrentContextObject().cluster);
    }
    getCluster(name) {
        return KubeConfig.findObject(this.clusters, name, 'cluster');
    }
    getCurrentUser() {
        return this.getUser(this.getCurrentContextObject().user);
    }
    getUser(name) {
        return KubeConfig.findObject(this.users, name, 'user');
    }
    loadFromFile(file) {
        this.loadFromString(fs.readFileSync(file, 'utf8'));
    }
    applytoHTTPSOptions(opts) {
        const user = this.getCurrentUser();
        this.applyOptions(opts);
        if (user.username) {
            opts.auth = `${user.username}:${user.password}`;
        }
    }
    applyToRequest(opts) {
        const cluster = this.getCurrentCluster();
        const user = this.getCurrentUser();
        this.applyOptions(opts);
        if (cluster.skipTLSVerify) {
            opts.strictSSL = false;
        }
        if (user.username) {
            opts.auth = {
                password: user.password,
                username: user.username,
            };
        }
    }
    loadFromString(config) {
        const obj = yaml.safeLoad(config);
        if (obj.apiVersion !== 'v1') {
            throw new TypeError('unknown version: ' + obj.apiVersion);
        }
        this.clusters = config_types_1.newClusters(obj.clusters);
        this.contexts = config_types_1.newContexts(obj.contexts);
        this.users = config_types_1.newUsers(obj.users);
        this.currentContext = obj['current-context'];
    }
    loadFromOptions(options) {
        this.clusters = options.clusters;
        this.contexts = options.contexts;
        this.users = options.users;
        this.currentContext = options.currentContext;
    }
    loadFromClusterAndUser(cluster, user) {
        this.clusters = [cluster];
        this.users = [user];
        this.currentContext = 'loaded-context';
        this.contexts = [
            {
                cluster: cluster.name,
                user: user.name,
                name: this.currentContext,
            },
        ];
    }
    loadFromCluster(pathPrefix = '') {
        const host = process.env.KUBERNETES_SERVICE_HOST;
        const port = process.env.KUBERNETES_SERVICE_PORT;
        const clusterName = 'inCluster';
        const userName = 'inClusterUser';
        const contextName = 'inClusterContext';
        let scheme = 'https';
        if (port === '80' || port === '8080' || port === '8001') {
            scheme = 'http';
        }
        this.clusters = [
            {
                name: clusterName,
                caFile: `${pathPrefix}${Config.SERVICEACCOUNT_CA_PATH}`,
                server: `${scheme}://${host}:${port}`,
                skipTLSVerify: false,
            },
        ];
        this.users = [
            {
                name: userName,
                token: fs.readFileSync(`${pathPrefix}${Config.SERVICEACCOUNT_TOKEN_PATH}`).toString(),
            },
        ];
        this.contexts = [
            {
                cluster: clusterName,
                name: contextName,
                user: userName,
            },
        ];
        this.currentContext = contextName;
    }
    loadFromDefault() {
        if (process.env.KUBECONFIG && process.env.KUBECONFIG.length > 0) {
            this.loadFromFile(process.env.KUBECONFIG);
            return;
        }
        if (process.env.HOME) {
            const config = path.join(process.env.HOME, '.kube', 'config');
            if (fs.existsSync(config)) {
                this.loadFromFile(config);
                return;
            }
        }
        if (fs.existsSync(Config.SERVICEACCOUNT_TOKEN_PATH)) {
            this.loadFromCluster();
            return;
        }
        this.loadFromClusterAndUser({ name: 'cluster', server: 'http://localhost:8080' }, { name: 'user' });
    }
    makeApiClient(apiClientType) {
        const apiClient = new apiClientType(this.getCurrentCluster().server);
        apiClient.setDefaultAuthentication(this);
        return apiClient;
    }
    getCurrentContextObject() {
        return this.getContextObject(this.currentContext);
    }
    bufferFromFileOrString(file, data) {
        if (file) {
            return fs.readFileSync(file);
        }
        if (data) {
            return Buffer.from(base64.decode(data), 'utf-8');
        }
        return null;
    }
    applyHTTPSOptions(opts) {
        const cluster = this.getCurrentCluster();
        const user = this.getCurrentUser();
        const ca = this.bufferFromFileOrString(cluster.caFile, cluster.caData);
        if (ca) {
            opts.ca = ca;
        }
        const cert = this.bufferFromFileOrString(user.certFile, user.certData);
        if (cert) {
            opts.cert = cert;
        }
        const key = this.bufferFromFileOrString(user.keyFile, user.keyData);
        if (key) {
            opts.key = key;
        }
    }
    applyAuthorizationHeader(opts) {
        const user = this.getCurrentUser();
        let token = null;
        if (user.authProvider && user.authProvider.config) {
            const config = user.authProvider.config;
            // This should probably be extracted as auth-provider specific plugins...
            token = 'Bearer ' + config['access-token'];
            const expiry = config.expiry;
            if (expiry) {
                const expiration = Date.parse(expiry);
                if (expiration < Date.now()) {
                    if (config['cmd-path']) {
                        let cmd = '"' + config['cmd-path'] + '"';
                        if (config['cmd-args']) {
                            cmd = cmd + ' ' + config['cmd-args'];
                        }
                        // TODO: Cache to file?
                        const result = shelljs.exec(cmd, { silent: true });
                        if (result.code !== 0) {
                            throw new Error('Failed to refresh token: ' + result.stderr);
                        }
                        const output = result.stdout.toString();
                        const resultObj = JSON.parse(output);
                        let pathKey = config['token-key'];
                        // Format in file is {<query>}, so slice it out and add '$'
                        pathKey = '$' + pathKey.slice(1, -1);
                        config['access-token'] = jsonpath.query(resultObj, pathKey);
                        token = 'Bearer ' + config['access-token'];
                    }
                    else {
                        throw new Error('Token is expired!');
                    }
                }
            }
        }
        if (user.token) {
            token = 'Bearer ' + user.token;
        }
        if (token) {
            if (!opts.headers) {
                opts.headers = [];
            }
            opts.headers.Authorization = token;
        }
    }
    applyOptions(opts) {
        this.applyHTTPSOptions(opts);
        this.applyAuthorizationHeader(opts);
    }
}
exports.KubeConfig = KubeConfig;
// This class is deprecated and will eventually be removed.
class Config {
    static fromFile(filename) {
        return Config.apiFromFile(filename, api.Core_v1Api);
    }
    static fromCluster() {
        return Config.apiFromCluster(api.Core_v1Api);
    }
    static defaultClient() {
        return Config.apiFromDefaultClient(api.Core_v1Api);
    }
    static apiFromFile(filename, apiClientType) {
        const kc = new KubeConfig();
        kc.loadFromFile(filename);
        return kc.makeApiClient(apiClientType);
    }
    static apiFromCluster(apiClientType) {
        const kc = new KubeConfig();
        kc.loadFromCluster();
        const k8sApi = new apiClientType(kc.getCurrentCluster().server);
        k8sApi.setDefaultAuthentication(kc);
        return k8sApi;
    }
    static apiFromDefaultClient(apiClientType) {
        const kc = new KubeConfig();
        kc.loadFromDefault();
        return kc.makeApiClient(apiClientType);
    }
}
Config.SERVICEACCOUNT_ROOT = '/var/run/secrets/kubernetes.io/serviceaccount';
Config.SERVICEACCOUNT_CA_PATH = Config.SERVICEACCOUNT_ROOT + '/ca.crt';
Config.SERVICEACCOUNT_TOKEN_PATH = Config.SERVICEACCOUNT_ROOT + '/token';
exports.Config = Config;
//# sourceMappingURL=config.js.map