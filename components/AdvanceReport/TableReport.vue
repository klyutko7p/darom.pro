<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
  week: { type: String, required: true },
  rowsBalance: { type: Array as PropType<IBalance[]>, required: true },
  rowsDelivery: { type: Array as PropType<IDelivery[]>, required: true },
  rowsOurRansom: { type: Array as PropType<IOurRansom[]>, required: true },
  company: { type: String, required: true },
});

let month = ref(new Date().getMonth() + 1);

const filteredRows = ref(
  props.rows?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === month.value;
  })
);

const totalRows = computed(() => Math.ceil(props.rows?.length));
onBeforeMount(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<IAdvanceReport>>();

let arrayOfReceipts = ref<Array<IAdvanceReport>>();
let arrayOfExpenditure = ref<Array<IAdvanceReport>>();
let arrayOfTotal = ref<Array<IAdvanceReport>>();
let rowsBalanceArr = ref<Array<IBalance>>();
let rowsDeliveryArr = ref<Array<IDelivery>>();
let rowsOnlineArr = ref<Array<IOurRansom>>();

let expenditureByPVZ: { [PVZ: string]: number } = {};
let receiptsByPVZ: { [PVZ: string]: number } = {};
let differenceByPVZ: { [PVZ: string]: number } = {};

let sumOfArray1 = ref(0);
let sumOfArray2 = ref(0);
let sumOfArray3 = ref(0);

function updateCurrentPageData() {
  returnRows.value = props.rows;
  filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === +month.value && row.PVZ !== "";
  });

  if (props.company === "Darom.pro" || props.company === "Все") {
    if (props.week.includes("неделя")) {
      rowsBalanceArr.value = props.rowsBalance
        .filter((row: IBalance) => {
          let rowDate: Date = new Date(row.received);
          let [startDate, endDate] = parseWeekRange(props.week);
          return (
            rowDate >= startDate &&
            rowDate <= endDate &&
            row.received !== null &&
            row.recipient === "Шведова"
          );
        })
        .map((row: IBalance) => ({ ...row, company: "Darom.pro" }));
    } else {
      rowsBalanceArr.value = props.rowsBalance
        .filter(
          (row: IBalance) =>
            row.received !== null && row.recipient === "Шведова"
        )
        .map((row: IBalance) => ({ ...row, company: "Darom.pro" }));
    }
  }

  if (props.week.includes("неделя")) {
    rowsDeliveryArr.value = props.rowsDelivery.filter((row: IDelivery) => {
      let rowDate: Date = new Date(row.paid);
      let [startDate, endDate] = parseWeekRange(props.week);
      return rowDate >= startDate && rowDate <= endDate && row.paid !== null;
    });
  } else {
    rowsDeliveryArr.value = props.rowsDelivery.filter(
      (row: IDelivery) => row.paid !== null
    );
  }

  if (props.week.includes("неделя")) {
    arrayOfExpenditure.value = filteredRows.value?.filter(
      (row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Передача денежных средств"
        );
      }
    );
  } else {
    arrayOfExpenditure.value = filteredRows.value?.filter(
      (row: IAdvanceReport) =>
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Передача денежных средств"
    );
  }

  if (props.week.includes("неделя")) {
    arrayOfReceipts.value = filteredRows.value?.filter(
      (row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure === "Пополнение баланса"
        );
      }
    );
  } else {
    arrayOfReceipts.value = filteredRows.value?.filter(
      (row: IAdvanceReport) => row.typeOfExpenditure === "Пополнение баланса"
    );
  }

  if (props.company === "Darom.pro" || props.company === "Все") {
    if (props.week.includes("неделя")) {
      rowsBalanceArr.value = props.rowsBalance
        .filter((row: IBalance) => {
          let rowDate: Date = new Date(row.received);
          let [startDate, endDate] = parseWeekRange(props.week);
          return (
            rowDate >= startDate &&
            rowDate <= endDate &&
            row.received !== null &&
            row.recipient === "Шведова"
          );
        })
        .map((row: IBalance) => ({ ...row, company: "Darom.pro" }));
    } else {
      rowsBalanceArr.value = props.rowsBalance
        .filter(
          (row: IBalance) =>
            row.received !== null && row.recipient === "Шведова"
        )
        .map((row: IBalance) => ({ ...row, company: "Darom.pro" }));
    }
  }

  if (props.company === "Darom.pro" || props.company === "Все") {
    if (props.week.includes("неделя")) {
      rowsOnlineArr.value = props.rowsOurRansom.filter((row: IOurRansom) => {
        let rowDate: Date = new Date(row.issued);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.additionally === "Оплачено онлайн"
        );
      });
    } else {
      rowsOnlineArr.value = props.rowsOurRansom.filter(
        (row: IOurRansom) => row.additionally === "Оплачено онлайн"
      );
    }
  }

  pvz.value.forEach((pvzName: string) => {
    expenditureByPVZ[pvzName] = 0;
  });

  pvz.value.forEach((pvzName: string) => {
    receiptsByPVZ[pvzName] = 0;
  });

  arrayOfExpenditure.value?.forEach((row) => {
    if (!isNaN(expenditureByPVZ[row.PVZ])) {
      expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  arrayOfReceipts.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.PVZ])) {
      receiptsByPVZ[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  rowsBalanceArr.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.pvz])) {
      receiptsByPVZ[row.pvz] += parseFloat(row.sum);
    }
  });

  rowsOnlineArr.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.dispatchPVZ])) {
      receiptsByPVZ[row.dispatchPVZ] += row.priceSite;
    }
  });

  rowsDeliveryArr.value.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.orderPVZ])) {
      receiptsByPVZ[row.orderPVZ] += row.amountFromClient3;
    }
  });

  pvz.value.forEach((pvzName: string) => {
    const difference = receiptsByPVZ[pvzName] - expenditureByPVZ[pvzName];
    differenceByPVZ[pvzName] = difference;
  });

  Object.keys(expenditureByPVZ).forEach((pvzName: string) => {
    sumOfArray2.value += expenditureByPVZ[pvzName];
  });

  Object.keys(receiptsByPVZ).forEach((pvzName: string) => {
    sumOfArray1.value += receiptsByPVZ[pvzName];
  });

  Object.keys(differenceByPVZ).forEach((pvzName: string) => {
    sumOfArray3.value += differenceByPVZ[pvzName];
  });
}

function parseWeekRange(weekString: string): Date[] {
  const matches = weekString.match(/(\d+) неделя \((\d+)-(\d+)\)/);
  if (matches) {
    const weekNumber = parseInt(matches[1]);
    const startDate = parseInt(matches[2]);
    const endDate = parseInt(matches[3]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startDateObj = new Date(currentYear, currentMonth, startDate);
    const endDateObj = new Date(currentYear, currentMonth, endDate);
    return [startDateObj, endDateObj];
  }
  return [];
}

function clearTotalSums() {
  sumOfArray1.value = 0;
  sumOfArray2.value = 0;
  sumOfArray3.value = 0;
}

watch([props.rows, totalRows, filteredRows.value], clearTotalSums);
watch([props.rows, totalRows, filteredRows.value], updateCurrentPageData);

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Политотдельское",
  "Мещерино",
  "Коломенская",
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "Офис",
  "НаДом",
]);
</script>
<template>
  <div class="relative max-h-[410px] mt-5 mb-10">
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <td class="border-2 p-2 whitespace-nowrap font-bold">Статус</td>
          <th
            scope="col"
            class="border-2 p-2 whitespace-nowrap"
            v-for="pvzName in pvz"
          >
            {{ pvzName }}
          </th>
          <td class="border-2 p-2 whitespace-nowrap font-bold">Итого</td>
        </tr>
      </thead>
      <tbody>
        <tr class="text-center">
          <td class="border-2 p-2 whitespace-nowrap font-bold">Поступления</td>
          <td
            class="border-2 p-2 whitespace-nowrap font-bold"
            v-for="sum in receiptsByPVZ"
          >
            {{ sum }} ₽
          </td>
          <td class="border-2 p-2 whitespace-nowrap font-bold">
            {{ sumOfArray1 }} ₽
          </td>
        </tr>
        <tr class="text-center">
          <td class="border-2 p-2 whitespace-nowrap font-bold">Расход</td>
          <td
            class="border-2 p-2 whitespace-nowrap font-bold"
            v-for="sum in expenditureByPVZ"
          >
            {{ sum }} ₽
          </td>
          <td class="border-2 p-2 whitespace-nowrap font-bold">
            {{ sumOfArray2 }} ₽
          </td>
        </tr>
        <tr class="text-center">
          <td class="border-2 p-2 whitespace-nowrap font-bold">Итого</td>
          <td
            class="border-2 p-2 whitespace-nowrap font-bold"
            v-for="sum in differenceByPVZ"
          >
            {{ sum }} ₽
          </td>
          <td class="border-2 font-bold p-2 whitespace-nowrap">
            {{ sumOfArray3 }} ₽
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
