const queue=[]
let isFlushing=false
let currentFlushPromise=null
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
   currentFlushPromise=Promise.resolve().then(flushJobs)
}
function flushJobs(){
    try{
        for(let i=0;i<queue.length;++i){
            queue[i]()
        }
    }finally{
        isFlushing=false
        queue.length=0
        currentFlushPromise=null
    }
}

export function nextTick(fn){
    //如果执行钩子的时候任务队列为空，直接放到微任务队列，否则放到当前执行的微任务的微任务队列
    const p=currentFlushPromise || Promise.resolve()
    //支持 await nextTick()
    return fn?p.then(fn):p
}
