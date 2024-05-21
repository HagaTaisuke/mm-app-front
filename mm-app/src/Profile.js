import React, { useState, useEffect } from 'react';
import AuthService from './authService';
import axios from 'axios';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [transactionSum, setTransactionSum] = useState(0);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const user = AuthService.getCurrentUser();

        if (user && user.userId) {
            axios.get(`http://localhost:8080/api/users/${user.userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(response => {
                setUserData(response.data);
            }).catch(error => {
                console.error('Error fetching user data:', error);
            });

            axios.get(`http://localhost:8080/api/transactions/sum/${user.userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(response => {
                setTransactionSum(response.data);
            }).catch(error => {
                console.error('Error fetching transaction sum:', error);
            });
        }
    }, []);

    const handleAddTransaction = (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();

        if (user && user.userId) {
            const transaction = {
                amount: parseInt(amount, 10),
                user: { id: user.userId }
            };

            axios.post('http://localhost:8080/api/transactions', transaction, {
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(response => {
                setMessage('Transaction added successfully');
                setTransactionSum(prevSum => prevSum + transaction.amount);
                setAmount('');
            }).catch(error => {
                setMessage('Failed to add transaction');
                console.error('Error adding transaction:', error);
            });
        }
    };

    return (
        <div>
            {userData ? (
                <div>
                    <h1>{userData.username}'s Profile</h1>
                    <p>Email: {userData.email}</p>
                    <p>Created At: {userData.createdAt}</p>
                    <p>Total Amount: {transactionSum}</p>

                    <form onSubmit={handleAddTransaction}>
                        <div>
                            <label>Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <button type="submit">Add Transaction</button>
                    </form>
                    {message && <div>{message}</div>}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;
