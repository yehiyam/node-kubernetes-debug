// const {Client, config} = require('kubernetes-client');
const WebSocket = require('ws')
// const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4teDkyeDYiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImE0ZTU2ZGJkLWJjZjMtMTFlOC04NjJiLTA4MDAyNzMzMTA3MyIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.EIZyE09ZmTWKRvVCtRiWhRUlCp2_mnh6xHhYXiR7tfvVsQ0zq8VWmZxGZvoE-cPLqTKEmW51vUq6YPXmkEXV2TTrn-a1P4n75Vffk5GO0iUqoXwU8GdJC4R9vLoFhFC7UK2iMHvRjuy6N9A4qc9E_LO4zV9yAGIkNSVuCIvgniDgdEEZ5bQt3n0EaykMQn1I4QNSD0GK9RvfQojA2jezuZLP122JA7ADGw8HhSHwjWCZZYOPM4kwUJC63ZGV6DC4UXAqSCl7jpLCH4t9O1jm4SSNHnXmaeQ5yNvYpK027nm6S2XAPPCLq_DoIm3Qmrx0IivPKXqIu-KukxPNvroQ0Q'
const main = async ()=>{
    const ws = new WebSocket('wss://192.168.99.100:8443/api/v1/namespaces/default/pods/redis-master-55db5f7567-qdlg4/portforward/',['portforward.k8s.io'],{
        headers:{
            Authorization:`Bearer ${token}`,
            Accept: '*/*'
        },
        rejectUnauthorized: false,
        
    });
    ws.on('open', function open() {
        // ws.send('something');
      });
       
      ws.on('message', (data)=> {
        console.log(data.toString('utf8'));
      });
      ws.on('error',(error)=>{
          console.error(error)
      })
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