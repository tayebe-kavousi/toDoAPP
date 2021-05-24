// variables ******************************************
let toDoTasks=[];

// classes ********************************************
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
        this.database.onupgradeneeded = (event) => {
            const instance = event.target.result;
            const objectStore = instance.createObjectStore(name, {keyPath: 'key', autoIncrement: true});
            if(typeof field == 'string') fields = field.split(',').map(s=>s.trim());
            for (let field of fields){objectStore.createIndex(field, field);}
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
    getOpenCursor(){
        const transaction = this.indexedDB.transaction([this.name], 'readonly');
        const objectStore = transaction.objectStore(this.name);
        return objectStore.openCursor();
    }
}
// functions ********************************************
function handleSubmit(title){
    if (title == '')return;
    let elem = document.createElement('LI');
    elem.innerHTML = title;
    elem.classList.add("toDoItem");
    let ul = document.getElementById('toDoList')
    ul.append(elem);
    document.getElementById('placeHolderToDo').classList.add('hidden');
    if(toDoTasks.length > 1){
        document.getElementById('deleteAll').classList.remove('hidden');
    }
}





document.addEventListener('DOMContentLoaded', ()=>{
    const database = new Database('DBtasks', 1, 'title, description');
    const form = document.forms.save_task;
    form.addEventListener('submit', saveTask);
    
    function saveTask(event){
        event.preventDefault();
        const title = document.getElementById('input').value;
        const timeStamp = Date.now();
        const task = {title, timeStamp};
        toDoTasks.push(task);
        const transaction = database.persist(task, () => form.reset());
        transaction.oncomplete = () => {console.log("Task added successfully!");}
        handleSubmit(title);
    }

})