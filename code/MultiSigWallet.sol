
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MultiSigWallet {
    using SafeERC20 for IERC20;

    struct Transaction {
        address token;
        address to;
        uint256 amount;
        uint256 confirmations;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public immutable requiredConfirmations;

    Transaction[] private transactions;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    event TransactionSubmitted(
        uint256 indexed txId,
        address indexed token,
        address indexed to,
        uint256 amount
    );
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        require(_owners.length == 3, "Exactly 3 owners required");
        require(
            _requiredConfirmations >= 1 &&
            _requiredConfirmations <= _owners.length,
            "Invalid confirmation threshold"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _requiredConfirmations;
    }

    function submitTransaction(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner returns (uint256 txId) {
        require(token != address(0), "Invalid token");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than zero");

        txId = transactions.length;

        transactions.push(
            Transaction({
                token: token,
                to: to,
                amount: amount,
                confirmations: 0,
                executed: false
            })
        );

        emit TransactionSubmitted(txId, token, to, amount);
    }

    function confirmTransaction(uint256 txId) external onlyOwner {
        require(txId < transactions.length, "Transaction does not exist");

        Transaction storage transaction = transactions[txId];

        require(!transaction.executed, "Transaction already executed");
        require(!isConfirmed[txId][msg.sender], "Already confirmed");

        isConfirmed[txId][msg.sender] = true;
        transaction.confirmations++;

        emit TransactionConfirmed(txId, msg.sender);
    }

    function executeTransaction(uint256 txId) external onlyOwner {
        require(txId < transactions.length, "Transaction does not exist");

        Transaction storage transaction = transactions[txId];

        require(!transaction.executed, "Transaction already executed");
        require(
            transaction.confirmations >= requiredConfirmations,
            "Not enough confirmations"
        );

        // Mark executed before calling the external token contract.
        transaction.executed = true;

        IERC20(transaction.token).safeTransfer(
            transaction.to,
            transaction.amount
        );

        emit TransactionExecuted(txId);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransaction(
        uint256 txId
    ) external view returns (Transaction memory) {
        require(txId < transactions.length, "Transaction does not exist");
        return transactions[txId];
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
}
