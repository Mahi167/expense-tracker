import expenseModel from "../models/expenseModel.js";
import incomeModel from "../models/incomeModel.js";


export async function getDashboardOverview(req, res) {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    try{

        const incomes = await incomeModel.find({
        userId,
        date: {
            $gte: startOfMonth,
            $lte: now
        }
        }).lean();

        const expenses = await expenseModel.find({
            userId,
            date: {
                $gte: startOfMonth,
                $lte: now
            }
        }).lean();

    console.log("Incomes:", incomes);
    console.log("Expenses:", expenses);

        // Total Income
        const monthlyIncome = incomes.reduce((total, income) => {
            return total + Number(income.amount);
        }, 0);

        // Total Expense
        const monthlyExpense = expenses.reduce((total, expense) => {
            return total + Number(expense.amount);
        }, 0);

        // Savings
        const savings = monthlyIncome - monthlyExpense;

        // Savings Percentage
        const savingsRate =
            monthlyIncome > 0
                ? Math.round((savings / monthlyIncome) * 100)
                : 0;

        // Recent Transactions
        const recentTransactions = [
            ...incomes.map((item) => ({
                ...item,
                type: "income"
            })),
            ...expenses.map((item) => ({
                ...item,
                type: "expense"
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Expense Category Wise
        const spendByCategory = {};

        expenses.forEach((expense) => {
            // Use the correct field name from your schema/database
            const category = expense.catagory || expense.category || "Other";

            spendByCategory[category] =
                (spendByCategory[category] || 0) +
                Number(expense.amount);
        });

        // Expense Distribution
        const expenseDistribution = Object.entries(spendByCategory).map(
            ([category, amount]) => ({
                category,
                amount,
                percent:
                    monthlyExpense > 0
                        ? Math.round((amount / monthlyExpense) * 100)
                        : 0
            })
        );
        return res.status(200).json({
            success : true,
            data : {
                monthlyExpense,
                monthlyExpense,
                savings,
                savingsRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution
            }})
    }catch(err){
        console.log("Get DashBoard Overview Error :", err.message);
        return res.status(404).json({
            success : false,
            message : "DashBoard Fetch Fields"
        })
    }
}