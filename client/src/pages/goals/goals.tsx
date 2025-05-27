import React, { useEffect, useState } from "react";
import api from "../../api/api";

// import "./goals.css";

interface Goal {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  walletId: number;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  type: string;
  walletName?: string;
}

interface GoalPreview {
  name: string;
  categoryName: string;
  walletName: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
}

interface Wallet {
  id: number;
  name: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [goalType, setGoalType] = useState<"expense" | "income">("expense");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewGoal, setPreviewGoal] = useState<Partial<Goal> | null>(null); 

  const [form, setForm] = useState({
    name: "",
    categoryId: 0,
    walletId: 0,
    targetAmount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchGoals();
    fetchWallets();
  }, []);

  useEffect(() => {
    fetchCategories(goalType);
    resetForm(); // reset form when switching tabs
  }, [goalType]);

  useEffect(() => {
    if (form.name && form.targetAmount && form.startDate && form.endDate) {
      const category = categories.find(c => c.id === form.categoryId);
      const wallet = wallets.find(w => w.id === form.walletId);

      setPreviewGoal({
        name: form.name,
        categoryName: category?.name || "",
        targetAmount: parseFloat(form.targetAmount) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        type: goalType,
        walletId: form.walletId,
        walletName: wallet?.name || ""
      });
    } else {
      setPreviewGoal(null);
    }
  }, [form, categories, wallets, goalType]);

  const fetchGoals = async () => {
    const res = await api.get("/goal");
    setGoals(res.data);
  };

  const fetchCategories = async (type: string) => {
    const res = await api.get(`/category?type=${type}`);
    setCategories(res.data);
    if (res.data.length > 0) {
      setForm((prev) => ({ ...prev, categoryId: res.data[0].id }));
    }
  };

  const fetchWallets = async () => {
    const res = await api.get("/wallet");
    setWallets(res.data);
    if (res.data.length > 0) {
      setForm((prev) => ({ ...prev, walletId: res.data[0].id }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      categoryId: categories[0]?.id || 0,
      walletId: wallets[0]?.id || 0,
      targetAmount: "",
      startDate: "",
      endDate: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      walletId: form.walletId,
      targetAmount: parseFloat(form.targetAmount),
      startDate: form.startDate,
      endDate: form.endDate,
      type: goalType
    };

    if (editingId) {
      await api.put(`/goal/${editingId}`, payload);
    } else {
      await api.post("/goal", payload);
    }

    resetForm();
    fetchGoals();
  };

  const handleEdit = (goal: Goal) => {
    setGoalType(goal.type as "expense" | "income");
    setForm({
      name: goal.name,
      categoryId: goal.categoryId,
      walletId: goal.walletId,
      targetAmount: goal.targetAmount.toString(),
      startDate: goal.startDate.split("T")[0],
      endDate: goal.endDate.split("T")[0]
    });
    setEditingId(goal.id);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/goal/${id}`);
    fetchGoals();
  };

  const filteredGoals = goals.filter(goal => goal.type === goalType);

  return (
    <div className="goals-page">
      <h2 className="page-title">{goalType === "expense" ? "Spending Goals" : "Income Goals"}</h2>

      <div className="goal-tabs">
        <button
          className={goalType === "expense" ? "active-tab" : ""}
          onClick={() => setGoalType("expense")}
        >
          Spending
        </button>
        <button
          className={goalType === "income" ? "active-tab" : ""}
          onClick={() => setGoalType("income")}
        >
          Income
        </button>
      </div>

      <div className="goal-form">
        <input
          type="text"
          placeholder="Goal name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: parseInt(e.target.value) })}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={form.walletId}
          onChange={(e) => setForm({ ...form, walletId: parseInt(e.target.value) })}
        >
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Target amount"
          value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
        <button onClick={handleSave}>{editingId ? "Update" : "Add Goal"}</button>
      </div>

      <ul className="goal-list">
        {filteredGoals.map((goal) => (
          <li key={goal.id} className="goal-item">
            <strong>{goal.name}</strong> — {goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} KM
            <span> (Category: {goal.categoryName})</span>
            <br />
            <small>
              {goal.startDate ? goal.startDate.split("T")[0] : "?"} → {goal.endDate ? goal.endDate.split("T")[0] : "?"}
            </small>
            <div className="goal-actions">
              <button onClick={() => handleEdit(goal)}>Edit</button>
              <button onClick={() => handleDelete(goal.id)}>Delete</button>
            </div>
            
            {/* Preview Section */}
            {previewGoal && (
              <div className="goal-preview">
                <h3>Goal Preview</h3>
                <div className="preview-content">
                  <p><strong>Name:</strong> {previewGoal.name}</p>
                  <p><strong>Type:</strong> {goalType}</p>
                  <p><strong>Category:</strong> {previewGoal.categoryName}</p>
                  <p><strong>Wallet:</strong> {previewGoal.walletName}</p>
                  <p><strong>Target Amount:</strong> {previewGoal.targetAmount} KM</p>
                  <p><strong>Duration:</strong> {previewGoal.startDate} to {previewGoal.endDate}</p>
                </div>
              </div>
            )}
          </li>
          
        ))}
      </ul>
    </div>
  );
}
