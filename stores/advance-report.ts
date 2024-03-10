import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast()

export const useAdvanceReports = defineStore("advance-reports", () => {

    let cachedAdvanceReportRows: IAdvanceReport[] | null = null;

    async function createAdvanceReport(row: IAdvanceReport) {
        try {
            if (row.issuedUser === undefined) row.issuedUser = '';
            if (row.PVZ === undefined) row.PVZ = '';
            if (row.issuedUser === undefined) row.issuedUser = '';
            if (row.expenditure === undefined) row.expenditure = '0';
            if (row.typeOfExpenditure === undefined) row.typeOfExpenditure = '';
            if (row.notation === undefined) row.notation = '';
            if (row.company === undefined) row.company = '';
            if (row.type === undefined) row.type = '';

            let data = await useFetch('/api/advance-report/create-row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: row }),
            });

            if (data.data.value === undefined) {
                cachedAdvanceReportRows = null;
                toast.success("Документ успешно создан!");
            } else {
                console.log(data.data.value);
                toast.error("Произошла ошибка при создании записи");
            }e
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function getAdvancedReports() {
        try {
            if (cachedAdvanceReportRows) {
                return cachedAdvanceReportRows;
            } else {
                let { data }: any = await useFetch('/api/advance-report/get-rows', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
                cachedAdvanceReportRows = data.value;
                return cachedAdvanceReportRows;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function updateAdvanceReport(row: IAdvanceReport) {
        try {
            if (row.issuedUser === undefined) row.issuedUser = '';
            if (row.PVZ === undefined) row.PVZ = '';
            if (row.issuedUser === undefined) row.issuedUser = '';
            if (row.expenditure === undefined) row.expenditure = '0';
            if (row.typeOfExpenditure === undefined) row.typeOfExpenditure = '';
            if (row.notation === undefined) row.notation = '';
            if (row.company === undefined) row.company = '';
            if (row.type === undefined) row.type = '';

            let data = await useFetch('/api/advance-report/edit-row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: row }),
            });

            if (data.data.value === undefined) {
                cachedAdvanceReportRows = null;
                toast.success("Документ успешно обновлен!");
            } else {
                toast.error("Произошла ошибка при обновлении документа!");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message)
                toast.error(error.message);
            }
        }
    }

    // async function updateDeliveryStatus(row: IBalance, flag: string, username: string) {
    //     try {
    //         let data = await useFetch('/api/balance/update-delivery', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ row: row, flag: flag, username: username }),
    //         });

    //         if (data.data.value === undefined) {
    //             cachedBalanceRows = null;
    //             toast.success("Статус успешно обновлен!");
    //         } else {
    //             console.log(data.data.value);
    //             toast.error("Произошла ошибка");
    //         }
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             console.error(error.message)
    //             toast.error(error.message);
    //         }
    //     }
    // }

    return { updateAdvanceReport, getAdvancedReports, createAdvanceReport }
})