import { openDB, deleteDB, wrap, unwrap } from 'idb';
import SampleData from '../../public/data/sample.json';

async function loadDatabase() {
    const db = await openDB("tailwind_store", 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        db.createObjectStore("products", {
          keyPath: "id",
          autoIncrement: true,
        });
        db.createObjectStore("sales", {
          keyPath: "id",
          autoIncrement: true,
        });
      },
    });
  
    return {
      db,
      getProducts: async () => await db.getAll("products"),
      addProduct: async (product) => await db.add("products", product),
      editProduct: async (product) =>
        await db.put("products", product.id, product),
      deleteProduct: async (product) => await db.delete("products", product.id),
    };
}

export class Item {
    id: number;
    name: string;
    price: number;
    image: string;    
    option?: any;
    qty?: number;    
}

export class PosApp {
    db = null;
    time = null;
    firstTime: boolean;
    activeMenu = "";
    loadingSampleData = false;
    moneys = [2000, 5000, 10000, 20000, 50000, 100000];
    products: Item[] = [];
    
    async initDatabase() {
        this.db = await loadDatabase();
        return this.loadProducts();        
    };

    async loadProducts() {
        this.products = await this.db.getProducts();

        if (this.products.length === 0) {
            await this.startWithSampleData();
        }

        SampleData

        console.log("products loaded", this.products);
    };

    async startWithSampleData() {
        // const response = await fetch("data/sample.json");
        // const data = await response.json();
        const data = SampleData;
        this.products = data.products;
        for (let product of data.products) {
            try {
                await this.db.addProduct(product);
            } catch (error) {
                console.error(`Error while trying to add item: ${product.id} to data store!`);
                console.log(error);
            }
        }

        this.setFirstTime(false);
    };

    startBlank = () => {
        this.setFirstTime(false);
    };

    setFirstTime = (firstTime) => {
        this.firstTime = firstTime;
        if (firstTime) {
            localStorage.removeItem("first_time");
        } else {
            localStorage.setItem("first_time", new Date().getTime().toString());
        }
    };
 
};