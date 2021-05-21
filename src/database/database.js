// Creating the Database class

export default class Database {
    constructor(name, version){
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