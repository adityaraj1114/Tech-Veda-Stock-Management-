// src/pages/ProfitLossReport.jsx
import React, { useContext, useMemo, useState } from "react";
import { SalesContext } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";

const ProfitLossReport = () => {
  const { sales } = useContext(SalesContext);
  const { purchases } = useContext(PurchaseContext);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // ✅ Currency formatter
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num || 0);

  // ✅ Safe date formatter
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  // ✅ Filter helpers
  const filterByDate = (list, date) =>
    list.filter((tx) => {
      if (!tx.date) return false;
      const formatted = formatDate(tx.date);
      return formatted === date;
    });

  const filterByMonth = (list, month, year) =>
    list.filter((tx) => {
      const d = new Date(tx.date);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() + 1 === parseInt(month) &&
        d.getFullYear() === parseInt(year)
      );
    });

  const filterByYear = (list, year) =>
    list.filter((tx) => {
      const d = new Date(tx.date);
      return !isNaN(d.getTime()) && d.getFullYear() === parseInt(year);
    });

  // ✅ Daily totals
  const dailySales = useMemo(() => {
    if (!selectedDate) return 0;
    return filterByDate(sales, selectedDate).reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
  }, [sales, selectedDate]);

  const dailyPurchase = useMemo(() => {
    if (!selectedDate) return 0;
    return filterByDate(purchases, selectedDate).reduce(
      (sum, p) => sum + (Number(p.totalCost) || 0),
      0
    );
  }, [purchases, selectedDate]);

  const dailyProfit = dailySales - dailyPurchase;

  // ✅ Monthly totals
  const monthlySales = useMemo(() => {
    if (!selectedMonth || !selectedYear) return 0;
    return filterByMonth(sales, selectedMonth, selectedYear).reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
  }, [sales, selectedMonth, selectedYear]);

  const monthlyPurchase = useMemo(() => {
    if (!selectedMonth || !selectedYear) return 0;
    return filterByMonth(purchases, selectedMonth, selectedYear).reduce(
      (sum, p) => sum + (Number(p.totalCost) || 0),
      0
    );
  }, [purchases, selectedMonth, selectedYear]);

  const monthlyProfit = monthlySales - monthlyPurchase;

  // ✅ Yearly totals
  const yearlySales = useMemo(() => {
    if (!selectedYear) return 0;
    return filterByYear(sales, selectedYear).reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
  }, [sales, selectedYear]);

  const yearlyPurchase = useMemo(() => {
    if (!selectedYear) return 0;
    return filterByYear(purchases, selectedYear).reduce(
      (sum, p) => sum + (Number(p.totalCost) || 0),
      0
    );
  }, [purchases, selectedYear]);

  const yearlyProfit = yearlySales - yearlyPurchase;

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Profit / Loss Report</h2>

      {/* 🔍 Filters */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="mb-3">🔎 Filters</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Select Month</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">-- Month --</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Select Year</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">-- Year --</option>
              {Array.from({ length: 6 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={clearFilters}
            >
              ❌ Clear
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Summary Cards */}
      <div className="row text-center mb-4">
        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm border-primary">
            <h6>📅 Daily</h6>
            <p>Sales: <b>{formatCurrency(dailySales)}</b></p>
            <p>Purchase: <b>{formatCurrency(dailyPurchase)}</b></p>
            <p
              className={dailyProfit >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}
            >
              {dailyProfit >= 0 ? "Profit" : "Loss"}: {formatCurrency(dailyProfit)}
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm border-success">
            <h6>🗓 Monthly</h6>
            <p>Sales: <b>{formatCurrency(monthlySales)}</b></p>
            <p>Purchase: <b>{formatCurrency(monthlyPurchase)}</b></p>
            <p
              className={monthlyProfit >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}
            >
              {monthlyProfit >= 0 ? "Profit" : "Loss"}: {formatCurrency(monthlyProfit)}
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm border-warning">
            <h6>📆 Yearly</h6>
            <p>Sales: <b>{formatCurrency(yearlySales)}</b></p>
            <p>Purchase: <b>{formatCurrency(yearlyPurchase)}</b></p>
            <p
              className={yearlyProfit >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}
            >
              {yearlyProfit >= 0 ? "Profit" : "Loss"}: {formatCurrency(yearlyProfit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
