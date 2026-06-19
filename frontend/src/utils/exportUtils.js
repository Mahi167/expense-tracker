import * as XLSX from 'xlsx';


export const exportToExcel = (data, filename = "transactions") => {
    if(!data || data.length === 0){
        alert("no data to export !");
        return;
    }
    try{
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet,'Transactions');

        XLSX.writeFile(workbook , `${fileName}.xlsx`, {
            bookType : 'xlsx',
            type : 'array'
        });

    }
    catch(err){
        console.error("Exported Error :", err);
        alert("Error exporting please Try Again and Again");
    }
}