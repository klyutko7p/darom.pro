<script setup lang="ts">
import { useToast } from "vue-toastification";
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IDelivery>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let orderAccounts = ref<Array<OrderAccount>>();

let rowData = ref({} as IDelivery);

let isOpen = ref(false);

function openModal(row: IDelivery) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
  rowData.value.sorted = rowData.value.sorted
    ? storeUsers.getISODateTime(rowData.value.sorted)
    : null;
  rowData.value.paid = rowData.value.paid
    ? storeUsers.getISODateTime(rowData.value.paid)
    : null;
  } else {
    rowData.value = {} as IDelivery;
    rowData.value.fromName = ''
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IDelivery;
}

async function updateDeliveryRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryStatus(obj.row, obj.flag, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function updateDeliveryRows(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryRowsStatus(obj.idArray, obj.flag, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function deleteRow(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данную строку?");
  if (answer) await storeRansom.deleteRansomRow(id, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function deleteSelectedRows(idArray: number[]) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данные строки?");
  if (answer) await storeRansom.deleteRansomSelectedRows(idArray, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeRansom.updateRansomRow(rowData.value, user.value.username, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  closeModal();
  isLoading.value = false;
}

async function createRow() {
  isLoading.value = true;
  await storeRansom.createRansomRow(rowData.value, user.value.username, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  closeModal();
  isLoading.value = false;
}

async function createCopyRow(id: number) {
  isLoading.value = true;
  await storeRansom.createCopyRow(id, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function deleteIssuedRows() {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить оплаченные товары?");
  if (answer) await storeRansom.deleteIssuedRows('Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = await storeRansom.getRansomRows('Delivery');
  isLoading.value = false;
}

async function deleteIssuedRowsTimer() {
  isLoading.value = true;
  await storeRansom.deleteIssuedRows("Delivery");
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = await storeRansom.getRansomRows("Delivery");
  isLoading.value = false;
}

function timeUntilSunday2359() {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const daysUntilSunday = (dayOfWeek === 0) ? 0 : (7 - dayOfWeek);

  const nextSunday1337 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 0, 0);

  return nextSunday1337.getTime() - now.getTime();
}

function scheduleDeleteIssuedRows() {
  const timeUntilSunday2359Data = timeUntilSunday2359();
  
  setTimeout(async () => {
    await deleteIssuedRowsTimer();
  }, timeUntilSunday2359Data);
}

scheduleDeleteIssuedRows();


const filteredRows = ref<Array<IDelivery>>();

function handleFilteredRows(filteredRowsData: IDelivery[]) {
  if (user.value.visiblePVZ === 'ВСЕ' && user.value.visibleSC === 'ВСЕ') {
    filteredRows.value = filteredRowsData;
  } else if (user.value.visiblePVZ === 'ВСЕ' && user.value.visibleSC !== 'ВСЕ') {
    filteredRows.value = filteredRowsData.filter((row) => row.orderPVZ === user.value.visibleSC);
  } else if (user.value.visiblePVZ !== 'ВСЕ' && user.value.visibleSC === 'ВСЕ') {
    filteredRows.value = filteredRowsData.filter((row) => row.dispatchPVZ === user.value.visiblePVZ);
  } else if (user.value.visiblePVZ !== 'ВСЕ' && user.value.visibleSC !== 'ВСЕ') {
    filteredRows.value = filteredRowsData.filter((row) => row.dispatchPVZ === user.value.visiblePVZ && row.orderPVZ === user.value.visibleSC);
  }
}

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRows('Delivery');
  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();

  if (rows.value) {
    handleFilteredRows(rows.value)
  }

  isLoading.value = false;

  if (!token || user.value.dataDelivery === "NONE") {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Наш выкуп</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsDeliveryFilters v-if="rows" @filtered-rows="handleFilteredRows" :rows="rows" />
            <div class="mt-5 flex items-center gap-3" v-if="user.dataDelivery === 'WRITE'">
              <UIMainButton @click="deleteIssuedRows" v-if="user.role === 'ADMIN' || user.username === 'admin1'">Удалить
                оплаченное</UIMainButton>
              <UIMainButton v-if="user.role === 'ADMIN'" @click="openModal">Создать новую запись</UIMainButton>
            </div>
          </div>

          <SpreadsheetsDeliveryTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
                <label for="name">Имя</label>
                <input :disabled="user.name3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.name" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'">
                <label for="fromName">Телефон</label>
                <input :disabled="user.fromName3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.fromName" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.nameOfAction === 'READ' || user.nameOfAction === 'WRITE'">
                <label for="nameOfAction">Название</label>
                <input :disabled="user.nameOfAction === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.nameOfAction" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
                <label for="purchaseOfGoods">Стоимость выкупа товара</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
                <label for="dispatchPVZ1">Отправка в ПВЗ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ3 === 'READ'">
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
                <label for="orderPVZ1">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ3 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.sorted === 'READ' || user.sorted === 'WRITE'">
                <label for="deliveredSC1">Отсортировано</label>
                <input :disabled="user.sorted === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sorted" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.paid === 'READ' || user.paid === 'WRITE'">
                <label for="deliveredPVZ1">Оплачено</label>
                <input :disabled="user.paid === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.paid" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.additionally3 === 'READ' || user.additionally3 === 'WRITE'">
                <label for="additionally1">Дополнительно</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.additionally" :disabled="user.additionally3 === 'READ'">
                  <option value="Оплачено онлайн">Оплачено онлайн</option>
                  <option value="Отказ клиент">Отказ клиент</option>
                  <option value="Отказ брак">Отказ брак</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsDeliveryFilters v-if="rows" @filtered-rows="handleFilteredRows" :rows="rows" />
          </div>

          <SpreadsheetsDeliveryTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
                <label for="name">Имя</label>
                <input :disabled="user.name3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.name" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'">
                <label for="fromName">Телефон</label>
                <input :disabled="user.fromName3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.fromName" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.nameOfAction === 'READ' || user.nameOfAction === 'WRITE'">
                <label for="nameOfAction">Название</label>
                <input :disabled="user.nameOfAction === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.nameOfAction" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
                <label for="purchaseOfGoods">Стоимость выкупа товара</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
                <label for="dispatchPVZ1">Отправка в ПВЗ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ3 === 'READ'">
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
                <label for="orderPVZ1">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ3 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.sorted === 'READ' || user.sorted === 'WRITE'">
                <label for="deliveredSC1">Отсортировано</label>
                <input :disabled="user.sorted === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sorted" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.paid === 'READ' || user.paid === 'WRITE'">
                <label for="deliveredPVZ1">Оплачено</label>
                <input :disabled="user.paid === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.paid" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.additionally3 === 'READ' || user.additionally3 === 'WRITE'">
                <label for="additionally1">Дополнительно</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.additionally" :disabled="user.additionally3 === 'READ'">
                  <option value="Оплачено онлайн">Оплачено онлайн</option>
                  <option value="Отказ клиент">Отказ клиент</option>
                  <option value="Отказ брак">Отказ брак</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>