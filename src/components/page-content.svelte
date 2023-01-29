<script lang="ts">
   import type { PosApp, Item } from "../lib/pos-app";
   import BeepSound from '../assets/sound/beep-29.mp3';
   import ClearSound from '../assets/sound/button-21.mp3';
   export let posApp: PosApp;

   let cash = 0;
   let change = 0;
   let cart: Item[] = [];
   let isShowModalReceipt = false;
   let receiptNo = "";
   let receiptDate = "";    
   let keyword = "";
      
   let addCash = (amount) => {        
      cash = (cash || 0) + amount;
      updateChange();
      console.log(cash);
      beep();
   };

   let updateChange = () => {
      change = cash - getTotalPrice();
   };

   let updateCash = (value) => {
      cash = parseFloat(value.replace(/[^0-9]+/g, ""));
      updateChange();
   };

   let getTotalPrice = () => {
      return cart.reduce(
         (total: number, item: Item) => total + item.qty * item.price, 0
      );
   };
   
   const submit = () => {
      const time = new Date();
      isShowModalReceipt = true;
      receiptNo = `TWPOS-KS-${Math.round(time.getTime() / 1000)}`;
      receiptDate = dateFormat(time);
   };    

   const dateFormat = (date) => {
      return new Intl.DateTimeFormat('en-GB').format(date);
   };

   const numberFormat = (number) => {
      return (number || "")
         .toString()
         .replace(/^0|\./g, "")
         .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
   };

   const priceFormat = (number) => {
      return number ? `Rp. ${numberFormat(number)}`: `Rp. 0`;
   };    

   const addQty = (item: Item, qty: number) => {
      const index = cart.findIndex((i: Item) => i.id === item.id);
      if (index === -1) {
         return;
      }

      console.log(`adding ${qty}`);
      console.log('to item:');
      console.log(item);

      const afterAdd = item.qty + qty;
      if (afterAdd === 0) {
         cart.splice(index, 1);

         // force svelte reactivity
         cart = Object.assign([...cart]);

         clearSound();
      } else {
         cart[index].qty = afterAdd;
         beep();
      }
      updateChange();
   };    

   const addToCart = (product) => {      

      const index = findCartIndex(product);
      if (index === -1) {
         // force svete reactivity (only happens in assignment).
         cart = Object.assign([...cart, { ...product, qty: 1 }]);
      } else {
         cart[index].qty += 1;
         cart = Object.assign([...cart]);
      }

      beep();
      updateChange();
   };

   const findCartIndex = (product) => {
      return cart.findIndex((p: Item) => p.id === product.id);
   };

   const closeModalReceipt = () => {
      isShowModalReceipt = false;
   };

   const clear = () => {
      console.log('clear cart...');
      cash = 0;
      cart = [];
      receiptNo = "";
      receiptDate = "";
      updateChange();
      clearSound();
   };

   const beep = () => {
      playSound(BeepSound);
   };

   const clearSound = () => {
      playSound(ClearSound);
   };

   const playSound = (src) => {
      const sound = new Audio();
      sound.src = src;
      sound.play();
      // TODO = REVIEW sound.onended = () => delete(sound);
   };
   
   const printAndProceed = () => {
      const receiptContent = document.getElementById('receipt-content');
      const titleBefore = document.title;
      const printArea = document.getElementById('print-area');

      // printArea.innerHTML = receiptContent.innerHTML;
      // document.title = receiptNo;

      // window.print();
      // isShowModalReceipt = false;

      // printArea.innerHTML = '';
      // document.title = titleBefore;

      // TODO save sale data to database

      clear();
   }    

   $: formatedValue = numberFormat(cash);
   $: formatedPrice = priceFormat(change);
   $: submitable = change >= 0 && cart.length > 0;
   $: itemsCount = cart.reduce((count: number, item: Item) => count + item.qty, 0);
   $: ammountDue = cart.reduce(
         (total: number, item: Item) => total + item.qty * item.price, 0
   );

   console.log('existing products:');
   console.log(posApp.products);

   $: filteredProducts = (): Array<Item> => {
      const rg = keyword ? new RegExp(keyword, "gi") : null;
      return posApp.products.filter((p) => !rg || p.name.match(rg));
   };
 </script>

 <div class="flex-grow flex">
    <!-- store menu -->
    <div class="flex flex-col h-full w-full py-4">
       <div class="flex px-2 flex-row relative">
          <div class="absolute left-5 top-3 px-2 py-2 rounded-full bg-green-500 text-white">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <input
             type="text"
             class="bg-white rounded-full shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none"
             placeholder="Type product name ..."
             bind:value={keyword}/>
       </div>
       <div class="h-full overflow-hidden mt-4">
          <div class="h-full overflow-y-auto px-2">
             {#if posApp.products.length === 0}
             <div class="select-none bg-teal-200 rounded-2xl flex flex-wrap content-center justify-center h-full opacity-25">
                <div class="w-full text-center">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                   </svg>
                   <p class="text-xl">
                      YOU DON'T HAVE
                      <br/>
                      ANY PRODUCTS TO SHOW
                   </p>
                </div>
             </div>
             {/if}
             {#if filteredProducts().length === 0 && keyword.length > 0}
             <div class="select-none bg-teal-200 rounded-2xl flex flex-wrap content-center justify-center h-full opacity-25">
                <div class="w-full text-center">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <p class="text-xl">
                      EMPTY SEARCH RESULT
                      <br/>
                      "<span class="font-semibold">{keyword}</span>"
                   </p>
                </div>
             </div>
             {/if}
             {#if filteredProducts().length}
             <div class="grid grid-cols-4 gap-4 pb-3">
                {#each filteredProducts() as product (product.id) }
                <button
                   class="select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg"
                   on:click={ () => {addToCart(product)} }>
                   <img src="{product.image}" alt="{product.name}">
                   <div class="flex pb-3 px-3 text-sm -mt-3">
                      <p class="flex-grow truncate mr-1">{product.name}</p>
                      <p class="nowrap font-semibold">{priceFormat(product.price)}</p>
                   </div>
                </button>
                {/each}
             </div>
             {/if}
          </div>
       </div>
    </div>
    <!-- end of store menu -->
    <!-- right sidebar -->
    <div class="w-5/12 flex flex-col h-full pr-4 pl-2 py-4">
       <div class="bg-white rounded-2xl flex flex-col h-full shadow">
          <!-- empty cart -->
          {#if cart.length === 0}
          <div  class="flex-1 w-full p-4 opacity-25 select-none flex flex-col flex-wrap content-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-16 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
             <p>
                CART EMPTY
             </p>
          </div>
          {/if}
          <!-- cart items -->
          {#if cart.length > 0}
          <div class="flex-1 flex flex-col overflow-auto">
             <div class="h-16 text-center flex justify-center">
                <div class="pl-8 text-left text-lg py-4 relative">
                    <!-- cart icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {#if itemsCount > 0}
                        <div  class="text-center absolute bg-green-500 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3">{itemsCount}</div>
                    {/if}
                </div>
                <div class="flex-grow px-8 text-right text-lg py-4 relative">
                   <!-- trash button -->
                   <button on:click={() => clear()} class="text-gray-300 hover:text-pink-500 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                   </button>
                </div>
             </div>
             <div class="flex-1 w-full px-4 overflow-auto">
                {#each cart as item, i}	
                <div class="select-none mb-3 bg-gray-50 rounded-lg w-full text-gray-700 py-2 px-2 flex justify-center">
                   <img src="{item.image}" alt="" class="rounded-lg h-10 w-10 bg-white shadow mr-2">
                   <div class="flex-grow">
                      <h5 class="text-sm">{item.name}</h5>
                      <p class="text-xs block">{priceFormat(item.price)}</p>
                   </div>
                   <div class="py-1">
                      <div class="w-28 grid grid-cols-3 gap-2 ml-2">
                         <button on:click={() => {addQty(item, -1)} } class="rounded-lg text-center py-1 text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                         </button>
                         <input bind:value="{item.qty}" type="text" class="bg-white rounded-lg text-center shadow focus:outline-none focus:shadow-lg text-sm">
                         <button on:click={ () => { addQty(item, 1)} } class="rounded-lg text-center py-1 text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                         </button>
                      </div>
                   </div>
                </div>
                {/each}
             </div>
          </div>
          {/if}
          <!-- end of cart items -->
          <!-- payment info -->
          <div class="select-none h-auto w-full text-center pt-3 pb-4 px-4">
             <div class="flex mb-3 text-lg font-semibold text-gray-700">
                <div>TOTAL</div>
                <div class="text-right w-full">{ priceFormat(ammountDue) }</div>
             </div>
             <div class="mb-3 text-gray-700 px-3 pt-2 pb-3 rounded-lg bg-gray-50">
                <div class="flex text-lg font-semibold">
                   <div class="flex-grow text-left">CASH</div>
                   <div class="flex text-right">
                      <div class="mr-2">Rp</div>
                      <input bind:value={formatedValue} on:keyup={ () => {updateCash(formatedValue)} } type="text" 
                      class="w-28 text-right bg-white shadow rounded-lg focus:bg-white focus:shadow-lg px-2 focus:outline-none">
                   </div>
                </div>
                <hr class="my-2">
                <div class="grid grid-cols-3 gap-2 mt-2">
                   {#each posApp.moneys as money}						
                   <button on:click={ () => {addCash(money)} } 
                     class="bg-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-2 py-1 text-sm">+<span>{money}</span></button>
                   {/each}
                </div>
             </div>
             {#if change > 0}
             <div class="flex mb-3 text-lg font-semibold bg-green-50 text-gray-700 rounded-lg py-2 px-3">
                <div class="text-green-800">CHANGE</div>
                <div class="text-right flex-grow text-green-600">
                   { formatedPrice }
                </div>
             </div>
             {/if}
             {#if change < 0}
             <div class="flex mb-3 text-lg font-semibold bg-pink-100 text-gray-700 rounded-lg py-2 px-3">
                <div
                   class="text-right flex-grow text-pink-600" >
                   { formatedPrice }
                </div>
             </div>
             {/if}
             {#if change == 0 && cart.length > 0}
             <div class="flex justify-center mb-3 text-lg font-semibold bg-green-50 text-green-700 rounded-lg py-2 px-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
             </div>
             {/if}
             <button
                class="{submitable ? 'text-white rounded-full text-lg w-full py-3 focus:outline-none bg-green-500 hover:bg-green-600' : 
                     'text-white rounded-full text-lg w-full py-3 focus:outline-none bg-gray-200'}"
                disabled='{!submitable}'
                on:click={ () => {submit()} }>
                SUBMIT
             </button>
          </div>
          <!-- end of payment info -->
       </div>
    </div>
    <!-- end of right sidebar -->
 </div>
