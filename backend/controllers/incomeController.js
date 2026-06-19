import incomeModel from "../models/incomeModel.js"
import XLSX from 'xlsx';
import getDateRange from "../utils/datafilter.js";

export async function addIncome(req, res) {
    const userId = req.user._id
    const {description, amount, catagory, date} = req.body;
    try{
        if (!description || !amount || !catagory || !date) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const newIncome = new incomeModel({
                userId,
                description,
                amount,
                catagory,
                date: new Date(date)
            });

            await newIncome.save();

            return res.status(201).json({
                success: true,
                message: "Income added successfully"
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

// get income


export async function getAllincome(req, res) {
    const userId = req.user._id;
    try{
        const income = await incomeModel.find({userId}).sort({date : -1});
        res.json(income);
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
    
}

//update income

export async function updateIncome(req, res) {

    const{ id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    try{
        const updateIncome = await incomeModel.findOneAndUpdate({
            _id : id, userId
        },{description, amount}, {new : true});

        if(!updateIncome){
            return res.status(404).json({
                success: false,
                message: "Income Not Found"
            });
        }
        res.json({success : true , message : "Income Updated SuccessFully", data: updateIncome})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}

// to delete income 

export async function deleteIncome(req, res) {
    try{
        const income = await incomeModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!income){
            return res.status(404).json({
                success : false,
                message : "Income Not Found"
            })
        }
        return res.json({
            success : true,
            message :'income deleted income'
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

// to download the data in excel sheet

export async function downloadIncomeExcel(req, res) {
    const userId = req.user._id;
    try{
        const income = await incomeModel.find({userId}).sort({date : -1});
        const plainData = income.map((inc) => ({
            Description : inc.description,
            Amount : inc.amount,
            Category: inc.catagory,
            Date : new Date(inc.date).toLocaleDateString(),
        }));
        const workSheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook,workSheet,"incomeModel");
        XLSX.writeFile(workbook, "income_details.xlsx");
        res.download("income_details.xlsx")
    }
     catch(err){
        console.log(err);
        return res.status(500).json({
            success : true,
            message : "Server Error"
        });
    }
}
    
// income overview

export async function getIncomeOverview(req, res) {
    try{
        const userId = req.user._id;
        const {range = "monthly"} = req.query;
        const {start, end} = getDateRange(range);

        const income = await incomeModel.find({
            userId,
             date :{$gte : start , $lte : end},
        }).sort({date : -1});
        
        const totalIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = income.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = income.length;
        const recentTransactions = income.slice(0, 9);
        res.json({
            success : true,
            data : {
                totalIncome,
                averageIncome,
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