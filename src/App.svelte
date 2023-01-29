<script lang="ts">
  import { onMount } from 'svelte';    
  
  import { PosApp } from './lib/pos-app';
  
  import LeftSidebar from "./components/left-sidebar.svelte";
  import PageContent from "./components/page-content.svelte";
  import FirstTimeModal from "./components/first-time-modal.svelte";
  // import ModalReceipt from "./components/modalReceipt.svelte";
  
  let firstTime = localStorage.getItem("first_time") === null;
  let activeMenu =  'pos';
  
  let ready = false;
  let posApp = new PosApp();
  let readyProm = posApp.initDatabase();

  readyProm.then(() => { ready = true});
 
</script>

<div class="hide-print flex flex-row h-screen antialiased text-blue-gray-800">
  <!-- left sidebar -->
  <LeftSidebar {activeMenu} />

  <!-- page content -->
  {#if ready}
  <PageContent posApp={posApp} />
  {/if}

  <!-- modal first time -->
  {#if firstTime}
    <FirstTimeModal 
              on:startWithSampleData={posApp.startWithSampleData}
              on:startBlank={posApp.startBlank} />
  {/if}

  <!-- modal receipt -->
  <!-- <#if isShowModalReceipt>	
    <ModalReceipt {isShowModalReceipt} />
  </if> -->
  </div>
  <!-- end of noprint-area -->

<div id="print-area" class="print-area"></div>



<style>
	/* width */
	::-webkit-scrollbar {
    width: 5px;
	}

	/* Track */
	::-webkit-scrollbar-track {
    background: #cfd8dc;
    border-radius: 5px;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
    background: #b0bec5;
    border-radius: 5px;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
    background: #90a4ae;
	}

	@media print {
    .hide-print {
      display: none !important;
    }
    .print-area {
      display: block;
    }
	}

</style>