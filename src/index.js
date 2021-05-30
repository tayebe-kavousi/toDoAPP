import Database from "./database/database.js";


document.addEventListener('DOMContentLoaded', ()=>{
    const database = new Database('DBtasks', 1)
    database.init('title, description', ()=>showTasks());
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
        while (tasksContainer.firstChild) tasksContainer.removeChild(tasksContainer.firstChild);
        const request = database.getOpenCursor();
        request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor){
                const {key, title, timeStamp} = cursor.value;
                const message = document.createElement("article");
                message.setAttribute('data-id', key);
                message.innerHTML = `
                <div class="message-header">
                    <p>${title}</p>
                </div>
                <div class="message-body">
                    <p>${timeStamp}</p>
                </div>
                `;
                const deleteButton = document.createElement("BUTTON");
                deleteButton.innerHTML = 'delete'
                deleteButton.classList.add('trash');
                deleteButton.setAttribute("aria-label", "delete");
                deleteButton.onclick = removeTask;
                message.firstChild.nextSibling.appendChild(deleteButton);

                const doingButton = document.createElement("BUTTON");
                doingButton.innerHTML = 'Start to do'
                doingButton.classList.add('start');
                doingButton.onclick = doingTask;
                message.firstChild.nextSibling.appendChild(doingButton);

                tasksContainer.appendChild(message);

                cursor.continue();
            } else {
                if (!tasksContainer.firstChild) {
                    const text = document.createElement("p");
                    text.textContent = "There are no tasks to be shown.";
                    tasksContainer.appendChild(text);
                }
            }
        }   
    }

    function removeTask(event){
        const header = event.target.parentElement;
        const task = header.parentElement;
        const id = Number(task.getAttribute("data-id"));
        database.delete(id, ()=>{// Step 1
            tasksContainer.removeChild(task);
            if (!tasksContainer.firstChild) {
              const text = document.createElement("p");
              text.textContent = "There are no tasks to be shown.";
              tasksContainer.appendChild(text);
            }
        console.log(`Task with id ${id} deleted successfully.`);
        });
    }

    function doingTask(){
        console.log('doing task');
    }
})