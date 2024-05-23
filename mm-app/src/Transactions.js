import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthService from "./authService";
import axios from "axios";
import "./App.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.userId) {
      const apiURL = `http://localhost:8080/api/transactions/${user.userId}`;
      const source = axios.CancelToken.source();

      axios
        .get(apiURL, {
          headers: {
            Authorization: "Bearer " + user.token,
            cancelToken: source.token,
          },
        })
        .then((response) => {
          setTransactions(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching transactions:", error);
          setError("Failed to fetch transactions. Please try again later.");
          setLoading(false);
        });

      axios
        .get(`${apiURL}/sum`, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        })
        .then((response) => {
          setTotalAmount(response.data);
        })
        .catch((error) => {
          console.error("Error fetching total amount:", error);
        });

      return () => {
        source.cancel("Component unmounted");
      };
    }
  }, []);

  const formatISODateToYYYYMMDD = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  };

  const handleFilter = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.userId) {
      let apiURL = `http://localhost:8080/api/transactions/${user.userId}`;
      let queries = [];

      // 組み合わせ条件に応じたAPI呼び出しを準備
      if (year && month) {
        // monthをそのままの形式で使用
        queries.push(axios.get(`${apiURL}/date/${parseInt(month)}/${year}`, {
          headers: { Authorization: "Bearer " + user.token }
        }));
      }
      if (type) {
        queries.push(axios.get(`${apiURL}/type/${type}`, {
          headers: { Authorization: "Bearer " + user.token }
        }));
      }
      if (category) {
        queries.push(axios.get(`${apiURL}/category/${category}`, {
          headers: { Authorization: "Bearer " + user.token }
        }));
      }
      if (!year && !month && !type && !category) {
        queries.push(axios.get(apiURL, {
          headers: { Authorization: "Bearer " + user.token }
        }));
      }

      // 全てのAPI呼び出しを並行して実行
      axios.all(queries)
        .then(axios.spread((...responses) => {
          let combinedData = [];
          responses.forEach(response => {
            combinedData = [...combinedData, ...response.data];
          });

          // 重複するトランザクションを削除する
          const uniqueTransactions = Array.from(new Set(combinedData.map(t => t.id)))
            .map(id => combinedData.find(t => t.id === id));

          setTransactions(uniqueTransactions);
        }))
        .catch(error => {
          console.error("Error fetching filtered transactions:", error);
          setError("Failed to fetch filtered transactions. Please try again later.");
        });
    }
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const getTypeInJapanese = (type) => {
    switch (type) {
      case 'expense':
        return '支出';
      case 'income':
        return '収入';
      case 'subscription':
        return '定期';
      default:
        return type;
    }
  };

  return (
    <div className="container">
      <h1>Transactions</h1>
      <div className="total-amount">
        <h2>TOTAL: {totalAmount.toLocaleString()} 円</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>タイプ</th>
            <th>カテゴリー</th>
            <th>金額</th>
            <th>メモ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatISODateToYYYYMMDD(transaction.date)}</td>
              <td>{getTypeInJapanese(transaction.type)}</td>
              <td>{transaction.category}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="year-month">Year/Month</label>
          <input
            type="month"
            id="year-month"
            value={`${year}-${month.padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setYear(y);
              setMonth(m);
            }}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="type">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="INCOME">収入</option>
            <option value="EXPENSE">支出</option>
            <option value="SUBSCRIPTION">定期</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="filter-button">
          <button onClick={handleFilter}>検索</button>
        </div>
      </div>
      <p>
        <Link to="/Profile" className="button-link">
          戻る
        </Link>
      </p>
    </div>
  );
};

export default Transactions;


