// variables ******************************************
let toDoTasks=[];

// classes ********************************************
class Database {
    constructor(name, version,){
        this.name = name;
        this.version = version;
        this.indexedDB = {};
        this.database = window.indexedDB.open(name, version);
        this.database.onsuccess = () => {
            console.log(`Databse ${name}: created successfully`);
            this.indexedDB = this.database.result;
        }
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
// indexedDB *********************************************
document.addEventListener('DOMContentLoaded', ()=>{
    const database = new Database('DBtasks', 1);
    const form = document.forms.save_task;
    form.addEventListener('submit', saveTask);
    function saveTask(event){
        event.preventDefault();
        const title = document.getElementById('input').value;
        console.log(title);
        const timeStamp = Date.now();
        const task = {title, timeStamp};
        toDoTasks.push(task);
        handleSubmit(title);
        input.value = '';
    }

})