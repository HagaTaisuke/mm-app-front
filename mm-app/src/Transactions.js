import React, { useState, useEffect } from "react";
import AuthService from "./authService";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [apiURL, setApiURL] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.userId) {
      setUserId(user.userId);
      setApiURL(`http://localhost:8080/api/transactions/${user.userId}`);
    }
  }, []);

  useEffect(() => {
    if (apiURL) {
      const source = axios.CancelToken.source();
      axios
        .get(apiURL, {
          headers: {
            Authorization: "Bearer " + AuthService.getCurrentUser().token,
          },
          cancelToken: source.token,
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

      return () => {
        source.cancel("Component unmounted");
      };
    }
  }, [apiURL]);

  const formatISODateToYYYYMMDD = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div class="container">
      <h1>Transactions</h1>
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
              <td>{transaction.type}</td>
              <td>{transaction.category}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
