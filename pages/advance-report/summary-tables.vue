<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storeBalance = useBalanceStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>();
let originallyRows = ref<Array<IAdvanceReport>>();
let rowsBalance = ref<Array<IBalance>>();
const token = Cookies.get("token");
let isLoading = ref(false);
let rowsDelivery = ref<Array<IBalanceDelivery>>();

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeAdvanceReports.getAdvancedReports();
  rowsDelivery.value = await storeBalance.getBalanceDeliveryRows();
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  ourRansomRows.value = await storeRansom.getRansomRowsForBalance("OurRansom");
  clientRansomRows.value = await storeRansom.getRansomRowsForBalance(
    "ClientRansom"
  );
  rowsBalance.value = await storeBalance.getBalanceRows();

  getAllSum();

  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Авансовый отчёт",
});

let isOpen = ref(false);
let isOpenAdmin = ref(false);
let rowData = ref({} as IAdvanceReport);
let sum1 = ref(0);
let sum2 = ref(0);
let allSum = ref(0);
let sumOfReject = ref(200);

let copyArrayOurRansom = ref<Array<IOurRansom>>();
let copyArrayClientRansom = ref<Array<IClientRansom>>();
let ourRansomRows = ref<Array<IOurRansom>>();
let clientRansomRows = ref<Array<IClientRansom>>();

function getAllSum() {
  // let newStartingDate = new Date(startingDate.value);
  // newStartingDate.setHours(0);
  // newStartingDate.setMinutes(0);
  // newStartingDate.setSeconds(0);
  // newStartingDate.setMilliseconds(0);

  // let newEndDate = new Date(endDate.value);
  // newEndDate.setHours(23);
  // newEndDate.setMinutes(59);
  // newEndDate.setSeconds(59);
  // newEndDate.setMilliseconds(0);

  copyArrayOurRansom.value = ourRansomRows.value?.filter(
    (row) =>
      row.issued !== null &&
      (row.additionally === "Оплата наличными" ||
        row.additionally === "Отказ клиент")
  );

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let sumOfPVZ = rowsBalance.value
    ?.filter(
      (row) => row.received !== null && row.recipient === user.value.username
    )
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.createdUser === user.value.username &&
        row.notation !== "Пополнение баланса"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2 = rows.value
    ?.filter(
      (row) => row.received !== null && row.issuedUser === user.value.username
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3 = rows.value
    ?.filter(
      (row) => row.createdUser === user.value.username && row.issuedUser === ""
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = rowsDelivery.value?.reduce(
    (acc, value) => acc + +value.sum,
    0
  );

  if (user.value.username !== "Шведова") {
    allSum.value = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3;
  } else {
    allSum.value =
      +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3 + +sumOfPVZ4;
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IAdvanceReport;
}

function openModal(row: IAdvanceReport) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.date = rowData.value.date
      ? storeUsers.getISODateTime(rowData.value.date)
      : null;
  } else {
    rowData.value = {} as IAdvanceReport;
  }
}

function openModalAdmin(row: IAdvanceReport) {
  isOpenAdmin.value = true;
  rowData.value = {} as IAdvanceReport;
  rowData.value.PVZ = "";
  rowData.value.company = "";
  rowData.value.expenditure = row.expenditure;
  rowData.value.notation = "Пополнение баланса";
  rowData.value.issuedUser = "admin";
  rowData.value.received = new Date();
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = "";
  rowData.value.createdUser = "admin";
  rowData.value.date = new Date();
}

function closeModalAdmin() {
  isOpenAdmin.value = false;
  rowData.value = {} as IAdvanceReport;
}

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Полтотдельское",
  "Мещерино",
  "ПВЗ1",
  "ПВЗ2",
  "ПВЗ3",
  "ПВЗ4",
  "Офис",
]);

let typesOfExpenditure = ref([
  "Передача денежных средств",
  "Сопутствующие расходы",
  "Автомобили",
  "Ежемесячные платежи",
  "Оплата ФОТ",
  "Оплата Налоги. ПФР, СОЦ и т.д.",
]);

let companies = ref(["WB start", "Darom.pro", "Сортировка", "Доставка"]);

let usersOfIssued = ref([
  "Шведова",
  "admin",
  "Косой",
  "Шарафаненко",
  "Волошина",
]);

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mgbbkkgyorhwryabwabx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYmJra2d5b3Jod3J5YWJ3YWJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzE0NjQ5OCwiZXhwIjoyMDE4NzIyNDk4fQ.Ogcld2z2P5M3V5N2yEpyfmHPsXor9Mv_5fUya5wgEoY"
);

async function createRow() {
  isLoading.value = true;
  await storeAdvanceReports.createAdvanceReport(
    rowData.value,
    user.value.username
  );
  rows.value = await storeAdvanceReports.getAdvancedReports();
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }
  filteredRows.value = rows.value;

  getAllSum();
  closeModal();
  closeModalAdmin();
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeAdvanceReports.updateAdvanceReport(
    rowData.value,
    user.value.username
  );
  rows.value = await storeAdvanceReports.getAdvancedReports();
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }
  filteredRows.value = rows.value;

  getAllSum();
  closeModal();
  isLoading.value = false;
}

async function updateDeliveryRow(row: any) {
  isLoading.value = true;
  await storeAdvanceReports.updateDeliveryStatus(row.row);
  rows.value = await storeAdvanceReports.getAdvancedReports();
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }
  filteredRows.value = rows.value;

  getAllSum();
  isLoading.value = false;
}

function formatNumber(number: number) {
  let numberString = number.toString();

  if (numberString.length <= 3) {
    return numberString;
  }

  let formattedString = "";
  let remainder = numberString.length % 3;

  if (remainder !== 0) {
    formattedString += numberString.slice(0, remainder) + " ";
  }

  for (let i = remainder; i < numberString.length; i += 3) {
    formattedString += numberString.slice(i, i + 3) + " ";
  }

  return formattedString.slice(0, -1);
}

function getAllSumFromName(username: string) {
  copyArrayOurRansom.value = ourRansomRows.value?.filter(
    (row) =>
      row.issued !== null &&
      (row.additionally === "Оплата наличными" ||
        row.additionally === "Отказ клиент")
  );

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let sumOfPVZ = rowsBalance.value
    ?.filter((row) => row.received !== null && row.recipient === username)
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = originallyRows.value
    ?.filter((row) => row.received !== null && row.createdUser === username)
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2 = originallyRows.value
    ?.filter((row) => row.received !== null && row.issuedUser === username)
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3 = originallyRows.value
    ?.filter(
      (row) =>
        row.createdUser === username &&
        (row.issuedUser === "" || row.issuedUser === null)
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = rowsDelivery.value?.reduce(
    (acc, value) => acc + +value.sum,
    0
  );

  if (username !== "Шведова") {
    let allSum = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3;
    return allSum;
  } else {
    let allSum = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3 + +sumOfPVZ4;
    return allSum;
  }
}

const filteredRows = ref<Array<IAdvanceReport>>();
function handleFilteredRows(filteredRowsData: IAdvanceReport[]) {
  filteredRows.value = filteredRowsData;
}

async function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  const { data, error } = await supabase.storage
    .from("image")
    .upload(`img-${selectedFile.name}`, selectedFile);
  rowData.value.supportingDocuments = selectedFile.name;
  if (data) {
    console.log(data);
  } else {
    console.log(error);
  }
}

let selectedUser = ref("Шведова");
let showBalanceEmployees = ref(true);
let month = ref((new Date().getMonth() + 1).toString().padStart(2, "0"));
</script>

<template>
  <Head>
    <Title>Авансовый отчёт</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <AdvanceReportFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
          />

          <div>
            <div class="text-center text-2xl my-5">
              <h1 v-if="user.username !== 'admin'">
                Баланс {{ user.username }}
              </h1>
              <h1 v-if="user.username === 'admin'">Баланс Торговая Империя</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSum)) }} ₽
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-3 max-sm:flex-col mt-10">
            <UIMainButton
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'DRIVER'
              "
              @click="openModal"
            >
              Создание авансового документа
            </UIMainButton>

            <UIMainButton v-if="user.role === 'ADMIN'" @click="openModalAdmin">
              Пополнение баланса админа
            </UIMainButton>
          </div>

          <div v-for="company in companies" class="mt-10 mb-10">
            <h1 class="font-bold text-2xl mb-3">{{ company }}</h1>
            <div class="border-2 p-3 border-dashed border-black">
              <AdvanceReportTable
                :rows="filteredRows?.filter((row) => row.company === company)"
                :user="user"
                @open-modal="openModal"
                @update-delivery-row="updateDeliveryRow"
              />
            </div>
          </div>
        </div>

        <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание нового документа</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">ПВЗ</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.PVZ"
                >
                  <option v-for="pvzData in pvz" :value="pvzData">
                    {{ pvzData }}
                  </option>
                </select>
              </div>
  
              <div class="grid grid-cols-2 mb-5" v-if="user.role !== 'ADMIN'">
                <label for="name">Дата</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.date"
                  :min="`2024-${month}-01`"
                  :max="`2024-${month}-31`"
                  type="date"
                />
              </div>
  
              <div class="grid grid-cols-2 mb-5" v-if="user.role === 'ADMIN'">
                <label for="name">Дата</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.date"
                  type="date"
                />
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Выдано</label>
                <select
                  :disabled="user.role !== 'ADMIN'"
                  class="py-1 px-2 border-2 bg-transparent max-w-[200px] rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.issuedUser"
                >
                  <option v-for="user in usersOfIssued" :value="user">
                    {{ user }}
                  </option>
                </select>
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Расход</label>
                <input
                  :disabled="user.role !== 'ADMIN'"
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Статья расхода</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.typeOfExpenditure"
                >
                  <option v-for="type in typesOfExpenditure" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Комментарий</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.notation"
                  type="text"
                />
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Компания</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.company"
                >
                  <option v-for="company in companies" :value="company">
                    {{ company }}
                  </option>
                </select>
              </div>
  
              <div class="grid grid-cols-2 mb-5">
                <label for="name"
                  >Подтверждающий <br />
                  документ</label
                >
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 max-w-[200px] focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  @change="handleFileChange"
                  type="file"
                />
              </div>
            </div>
  
            <div
              class="flex items-center justify-center gap-3 mt-10"
              v-if="rowData.id"
            >
              <UIMainButton @click="updateRow">Сохранить</UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton @click="createRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>
  
          <UIModal v-show="isOpenAdmin" @close-modal="closeModalAdmin">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Пополнение баланса</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  :disabled="user.role !== 'ADMIN'"
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>
            </div>
  
            <div class="flex items-center justify-center gap-3 mt-10">
              <UIMainButton @click="createRow">Создать</UIMainButton>
              <UIErrorButton @click="closeModalAdmin">Отменить </UIErrorButton>
            </div>
          </UIModal>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user"> </NuxtLayout>
    </div>
  </div>

  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>