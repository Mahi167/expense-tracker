import React from "react";
import { X } from "lucide-react";
import { modalStyles } from "../assets/dummyStyle";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  loading = false,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = [
    "Food",
    "Housing",
    "Transport",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Salary",
    "Freelance",
    "Investments",
    "Bonus",
    "Other",
  ],
  color = "teal",
}) => {
  if (!showModal) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split("T")[0];
  const minDate = `${currentYear}-01-01`;

  const colorClass = modalStyles.colorClasses[color];

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>{title}</h3>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className={modalStyles.closeButton}
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction();
          }}
        >
          <div className={modalStyles.form}>
            {/* Description */}
            <div>
              <label className={modalStyles.label}>Description</label>

              <input
                type="text"
                value={newTransaction?.description || ""}
                onChange={(e) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
                placeholder={
                  type === "both"
                    ? "Salary, Funds, etc."
                    : "Groceries, Rent, etc."
                }
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className={modalStyles.label}>Amount</label>

              <input
                type="number"
                step="0.01"
                value={newTransaction?.amount || ""}
                onChange={(e) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Type */}
            {type === "both" && (
              <div>
                <label className={modalStyles.label}>Type</label>

                <div className={modalStyles.typeButtonContainer}>
                  <button
                    type="button"
                    className={modalStyles.typeButton(
                      newTransaction?.type === "income",
                      modalStyles.colorClasses.teal.typeButtonSelected
                    )}
                    onClick={() =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        type: "income",
                      }))
                    }
                  >
                    Income
                  </button>

                  <button
                    type="button"
                    className={modalStyles.typeButton(
                      newTransaction?.type === "expense",
                      modalStyles.colorClasses.orange.typeButtonSelected
                    )}
                    onClick={() =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        type: "expense",
                      }))
                    }
                  >
                    Expense
                  </button>
                </div>
              </div>
            )}

            {/* Category - Spelling Fixed */}
            <div>
              <label className={modalStyles.label}>Category</label>

              <select
                value={newTransaction?.category || "Food"}
                onChange={(e) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className={modalStyles.label}>Date</label>

              <input
                type="date"
                value={newTransaction?.date || currentDate}
                onChange={(e) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
                min={minDate}
                max={currentDate}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;