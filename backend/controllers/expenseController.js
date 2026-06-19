import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/datafilter.js";
import XLSX from 'xlsx';

//add expense 
export async function addExpense(req, res) {
    const userId = req.user._id
    const {description, amount, catagory, date} = req.body;
    try{
        if (!description || !amount || !catagory || !date) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }
             const newExpense = new expenseModel({
                            userId,
                            description,
                            amount,
                            catagory,
                            date: new Date(date)
                        });
            
                        await newExpense.save();
        
                        return res.status(201).json({
                            success: true,
                            message: "Expense added successfully"
             });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success : true,
                message : "Server Error"
            });
        } 
}


// to all expense

export async function getAllExpense(req, res) {
    const userId = req.user._id;
    try{
        const expense = await expenseModel.find({userId}).sort({date : -1});
        res.json(expense);
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}

// update teh expense

export async function updateExpense(req, res) {
    const{ id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    try{
        const updatedExpenses = await expenseModel.findOneAndUpdate({
            _id : id, userId
        },{description, amount}, {new : true});

        if(!updatedExpenses){
            return res.status(404).json({
                success: false,
                message: "Income Not Found"
            });
        }
        res.json({success : true , message : "Expense Updated SuccessFully", data: updatedExpenses});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}

// delete the Expense

export async function deleteExpense(req, res) {
     try{
        const expense = await expenseModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!expense){
            return res.status(404).json({
                success : false,
                message : "Expense Not Found"
            })
        }
        return res.json({
            success : true,
            message :'Expense deleted'
        })
    }
     catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}

// download the excel sheet for expense
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id;
    try{
        const expense = await expenseModel.find({userId}).sort({date : -1});
        const plainData = expense.map((exp) => ({
            Description : exp.description,
            Amount : exp.amount,
            Category: exp.catagory,
            Date : new Date(exp.date).toLocaleDateString(),
        }));
        const workSheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook,workSheet,"expenseModel");
        XLSX.writeFile(workbook, "expense_details.xlsx");
        res.download("expense_details.xlsx")
    }
     catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}

// get The Overview 

export async function getExpenseOverview(req, res) {
     try{
        const userId = req.user._id;
        const {range = "monthly"} = req.query;
        const {start, end} = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
             date :{$gte : start , $lte : end},
        }).sort({date : -1});
        
        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense =
        expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length
    
        const recentTransactions = expense.slice(0, 5);
        res.json({
            success : true,
            data : {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Server Error"
        });
    }
    
}