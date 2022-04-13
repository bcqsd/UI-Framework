const queue=[]
let isFlushing=false

export function queueJob(job){
    if(!queue.length||!queue.includes(job)){
        queue.push(job)
    }
    if(!isFlushing){
        queueFlush()
        isFlushing=true
    }
}

function queueFlush(){
    Promise.resolve().then(flushJobs)
}
function flushJobs(){
    try{
        for(let i=0;i<queue.length;++i){
            queue[i]()
        }
    }finally{
        isFlushing=false
        queue.length=0
    }
}