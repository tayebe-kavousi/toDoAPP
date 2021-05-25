// Database class
class Database {
    constructor(name, version,fields){
        this.name = name;
        this.version = version;
        this.indexedDB = {};
        this.database = window.indexedDB.open(name, version);
        this.database.onsuccess = () => {
            console.log(`Databse ${name}: created successfully`);
            this.indexedDB = this.database.result;
        }
        this.database.onupgradeneeded = event => {
            const instance = event.target.result;
            const objectStore = instance.createObjectStore(this.name, {keyPath: 'key', autoIncrement: true});
            if (typeof fields == 'string') fields = fields.split(',').map(s => s.trim());
            for (let field of fields){
                objectStore.createIndex(field, field);
            }
        }
    }
    persist(task, success){
        if(typeof task == 'object'){
            const transaction = this.indexedDB.transaction([this.name], 'readwrite');
            const objectStore = transaction.objectStore(this.name);
            const request = objectStore.add(task);
            if(typeof success == 'function') request.onsuccess = success;
            return transaction;
        } else {throw new Error('An object expected')}
    }
    getOpenCursor() {
        const transaction = this.indexedDB.transaction([this.name], "readonly");
        const objectStore = transaction.objectStore(this.name);
        return objectStore.openCursor();
    }
}

//**************************//

document.addEventListener('DOMContentLoaded', ()=>{
    const database = new Database('DBtasks', 1, 'title, description');
    const form = document.forms.save_task;
    const tasksContainer = document.querySelector("#task-container");
    form.addEventListener('submit', saveTask);
    
    function saveTask(event){
        event.preventDefault();
        const title = document.getElementById('input').value;
        const timeStamp = Date.now();
        const task = {title, timeStamp};
        const transaction = database.persist(task, () => form.reset());
        transaction.oncomplete = () => {
            console.log("Task added successfully!");
            showTasks();
        }
    }

    function showTasks(){
        // Leave the div empty
        while (tasksContainer.firstChild) tasksContainer.removeChild(tasksContainer.firstChild);

        const request = database.getOpenCursor();
        request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor){
                const {title, timeStamp} = cursor.value;
                console.log(`title: ${title}, timeStamp: ${timeStamp}`);
            // Step 1
                const message = document.createElement("article");
                //message.classList.add("message", "is-primary");
            // Step 2
                message.innerHTML = `
                <div class="message-header">
                    <p>${title}</p>
                </div>
                <div class="message-body">
                    <p>${timeStamp}</p>
                </div>
                `;
            // Step 3
                tasksContainer.appendChild(message);
                // step 2: Advance to the next record
                cursor.continue();
            } else {
                // There is no data or we have come to the end of the table
                if (!tasksContainer.firstChild) {
                    const text = document.createElement("p");
                    text.textContent = "There are no tasks to be shown.";
                    tasksContainer.appendChild(text);
                }
            }
        }   
    }
})