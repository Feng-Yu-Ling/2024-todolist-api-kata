const http = require("http");
const { v4: uuidv4 } = require('uuid'); // 讓待辦有唯一UUID
const errorHandle = require("./errorHandle"); //將錯誤處理移到另一份js檔
const todos = [];

// req:request物件，包含客戶端的詳細資訊
// res:response物件，包含伺服器端的詳細資訊
const requestListener = (req, res)=>{
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
     }
    // 初始化body為空字串以累積從請求接收到的數據
    let body = "";
    // 監聽請求流的"data"事件，當數據塊可讀時，將觸發此事件，然後將chunk作為參數傳遞給callback函式，添加到body字串。這過程會持續直到所有的數據被接收完畢
    req.on("data",(chunk)=>{
        body += chunk
    })
    
    
    // 取得所有待辦
    if(req.url=="/todos" && req.method == "GET"){
        res.writeHead(200,headers);
        // 將object轉換為字串，不然伺服器無法解析
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    }
    // 新增單筆待辦
    else if(req.url=="/todos" && req.method == "POST"){
        // 監聽請求流的"end"事件，當所有的數據塊接收完畢時將觸發這事件。"end"事件不需要參數，因為所有數據都已透過"data"事件處理完畢
        req.on("end",()=>{
            try{
                const title = JSON.parse(body).title;
                // 如果title有值就不會是undefined
                if (title != undefined){
                        const todo = {
                            "title":title,
                            "id":uuidv4()
                        };
                        todos.push(todo);
                        res.writeHead(200,headers);
                        // 將object轉換為字串，不然伺服器無法解析
                        res.write(JSON.stringify({
                            "status":"success",
                            "data":todos,
                        }));
                        res.end();
                }
                // 若傳送的資料不含有title屬性則觸發錯誤處理
                else{
                    errorHandle(res);
                }
                
            }
            catch(error){
                errorHandle(res);
            }
            
        })
        
    }
    // 刪除所有待辦
    else if (req.url=="/todos" && req.method == "DELETE"){
        // DELETE不需要監聽"end"事件
        // 刪除todos所有元素的簡單作法
        todos.length = 0;
        res.writeHead(200,headers);
        // 將object轉換為字串，不然伺服器無法解析
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    }
    // 刪除單筆待辦
    else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element=>element.id == id);
        if(index != -1){
            todos.splice(index,1);
            res.writeHead(200,headers);
            // 將object轉換為字串，不然伺服器無法解析
            res.write(JSON.stringify({
                "status":"success",
                "data":todos,
            }));
            res.end();
        }
        else{
            errorHandle(res);
        }
    }
    // 編輯單筆待辦
    else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        req.on("end",()=>{
            try{
                const todo = JSON.parse(body).title;
                const id = req.url.split("/").pop();
                const index = todos.findIndex(element => element.id == id);
                // 在title有值且index不為-1時才進行編輯待辦
                if(todo != undefined && index != -1){
                    todos[index].title = todo;
                    res.writeHead(200,headers);
                    // 將object轉換為字串，不然伺服器無法解析
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":todos,
                    }));
                    res.end();
                }
                else{
                    errorHandle(res);
                }
                
            }
            catch(error){
                errorHandle(res);
            }
        })
    }
    else if(req.method == "OPTIONS"){
        res.writeHead(200,headers);
        res.end()
    }
    else{
        res.writeHead(404,headers);
        res.write(JSON.stringify({
            "status":"false",
            "message":"無此網站路由",
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(3005);
