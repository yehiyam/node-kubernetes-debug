// const {Client, config} = require('kubernetes-client');
// const WebSocket = require('ws')
// const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
// const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tcmtienoiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImE3ZGZhNzI2LWJkY2QtMTFlOC1hOWE0LTA4MDAyNzUwZWYwOSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.FPp06SBrdIYUCvEK2t4DlCtwCCRRy0sRLi4N76a6Cc30xX-MMF0VujmhTXYWQenSLEsEiaRULMgWr9FST9vVteE1CUlGVCWjciFQCeXY6vzi8STrtr9fgDYOW3q5U7PLvZ9PZA3yqYzHk3A0B3cu85u67sMUoeSJdHiPUJFET868zBEKjZSp3TBjYsUu0VqyWc50GETWEM7WAi_TULOKAv4ztrHl_lNV6xk42gMaSEy5csf7tzJpGT1tZv90dz-4hF0JBzX_G_6aYc6nFFfxccoqdQoEsJETDb9MWLkJw8WzmzwFf07oufVfOqRayxaL7kUm4Z0My5Oqhp71E5aJzA'
const k8s = require('@kubernetes/client-node');

const main = async ()=>{

    process.env.KUBECONFIG='c:\\Users\\yehiy\\.kube\\config'

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    
    const k8sApi = kc.makeApiClient(k8s.Core_v1Api);
    
    const res = await k8sApi.listNamespacedPod('default')
    console.log(res.body)

    // const ws = new WebSocket('wss://192.168.99.100:8443/api/v1/namespaces/default/pods/nginx-deployment-75675f5897-bct77/portforward?ports=80',{
    //     headers:{
    //         Authorization:`Bearer ${token}`,
    //         Accept: '*/*'
    //     },
    //     rejectUnauthorized: false,
        
    // });
    // ws.on('open', function open() {
    //     // ws.send('something');
    //   });
       
    //   ws.on('message', (data)=> {
    //       data.forEach(d=>console.log(d))
    //   });
    //   ws.on('error',(error)=>{
    //       console.error(error)
    //   })
    // const stream = client.api.v1.namespaces('default').pod('redis-master-55db5f7567-qdlg4').portforward.getStream()
    // const ddd=""
    // stream.on('data', object => {
    //     console.log(object.toString('utf8'))
    //   });
    // stream.on('end',()=>{
    //     console.log(ddd)
    // })
}
main();