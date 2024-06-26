import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthService from "./authService";
import axios from "axios";
import "./App.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [apiURL, setApiURL] = useState("");
  const [userId, setUserId] = useState(null);
  const [latestTransactions, setLatestTransactions] = useState([]);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserId(user.userId);
      setApiURL(`http://localhost:8080/api/transactions/${user.userId}`);
      const source = axios.CancelToken.source();
      axios
        .get(`http://localhost:8080/api/users/${user.userId}`, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
          cancelToken: source.token,
        })
        .then((response) => {
          setUserData(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.error("Error fetching user data:", error);
            setError("Failed to fetch user data. Please try again later.");
          }
        });

      return () => {
        source.cancel("Operation canceled by the user.");
      };
    }
  }, []);

  useEffect(() => {
    if (apiURL) {
      const source = axios.CancelToken.source();
      const user = AuthService.getCurrentUser();
      axios
        .get(`${apiURL}/sum`, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
          cancelToken: source.token,
        })
        .then((response) => {
          setTotalAmount(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.error("Error fetching transaction sum:", error);
            setMessage(
              "Failed to fetch transaction sum. Please try again later."
            );
            if (error.response && error.response.data) {
              setMessage(
                error.response.data.message ||
                "Failed to fetch transaction sum. Please try again later."
              );
            }
          }
        });

      axios
        .get(apiURL, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
          cancelToken: source.token,
        })
        .then((response) => {
          setLatestTransactions(response.data.slice(0, 5));
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.error("Error fetching latest transactions:", error);
            setError("Failed to fetch latest transactions. Please try again later.");
          }
        });

      return () => {
        source.cancel("Operation canceled by the user.");
      };
    }
  }, [apiURL]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();

    if (!amount.trim()) {
      setError("金額を入力してください。");
      return;
    }

    if (user && user.userId) {
      let transactionAmount = parseInt(amount, 10);
      if (type === "EXPENSE" || type === "SUBSCRIPTION") {
        transactionAmount = -Math.abs(transactionAmount);
      }

      const transaction = {
        amount: transactionAmount,
        type: type,
        category: category,
        date: date,
        description: description,
        user: { id: user.userId },
      };

      axios
        .post(apiURL, transaction, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        })
        .then((response) => {
          setMessage("Transaction added successfully");
          setTotalAmount((prevSum) => prevSum + transaction.amount);
          setAmount("");
          setType("INCOME");
          setCategory("");
          setDate(today);
          setDescription("");
          setError("");
          setLatestTransactions([response.data, ...latestTransactions].slice(0, 5));
        })
        .catch((error) => {
          setMessage("Failed to add transaction");
          console.error("Error adding transaction:", error);
          setError("Failed to add transaction. Please try again later.");
        });
    }
  };

  const formatISODateToYYYYMMDD = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  };

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
    <div>
      {userData ? (
        <div className="container">
          <h1>{userData.username}'s Profile</h1>
          <h2>Total: {totalAmount.toLocaleString()} 円</h2>

          <form onSubmit={handleAddTransaction}>
            <div>
              <label>金額</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label>タイプ</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="INCOME">収入</option>
                <option value="EXPENSE">支出</option>
                <option value="SUBSCRIPTION">定期</option>
              </select>
            </div>
            <div>
              <label>カテゴリー</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div>
              <label>日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label>メモ</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit">追加</button>
          </form>

          <h2>最新のトランザクション</h2>
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
              {latestTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatISODateToYYYYMMDD(transaction.date)}</td>
                  <td>{transaction.type}</td>
                  <td>{getTypeInJapanese(transaction.type)}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <Link to="/Transactions" className="button-link">
              詳細
            </Link>
          </p>

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;

