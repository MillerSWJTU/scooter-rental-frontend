// 钱包服务 - 处理用户余额管理

// 模拟数据库
let walletDB = new Map();
let transactionDB = new Map();

class WalletService {
  // 获取用户钱包余额
  getBalance(userId) {
    return walletDB.get(userId) || 0;
  }

  // 充值
  recharge(userId, amount) {
    const currentBalance = this.getBalance(userId);
    const newBalance = currentBalance + amount;
    walletDB.set(userId, newBalance);
    return newBalance;
  }

  // 消费
  pay(rentalId, amount) {
    const userId = localStorage.getItem('userId');
    const currentBalance = this.getBalance(userId);
    
    if (currentBalance < amount) {
      throw new Error('余额不足');
    }
    
    const newBalance = currentBalance - amount;
    walletDB.set(userId, newBalance);
    return newBalance;
  }

  // 获取交易记录
  getTransactions(userId) {
    return transactionDB.get(userId) || [];
  }

  // 添加交易记录
  addTransaction(userId, type, amount, description) {
    const transaction = {
      id: Date.now(),
      userId,
      type,
      amount,
      description,
      timestamp: new Date().toISOString()
    };
    
    if (!transactionDB.has(userId)) {
      transactionDB.set(userId, []);
    }
    
    transactionDB.get(userId).push(transaction);
    return transaction;
  }

  // 支付租赁费用
  payForRental(userId, rentalId, amount, description) {
    // 进行支付
    const newBalance = this.pay(rentalId, amount);
    
    // 记录交易
    this.addTransaction(userId, 'payment', amount, description || `支付租赁 #${rentalId}`);
    
    // 更新已支付的租赁记录
    this.updatePaidRentals(rentalId);
    
    return newBalance;
  }
  
  // 更新已支付租赁记录
  updatePaidRentals(rentalId) {
    try {
      const savedPaidRentals = localStorage.getItem('paidRentals');
      let paidRentals = [];
      
      if (savedPaidRentals) {
        paidRentals = JSON.parse(savedPaidRentals);
      }
      
      if (!paidRentals.includes(Number(rentalId))) {
        paidRentals.push(Number(rentalId));
        localStorage.setItem('paidRentals', JSON.stringify(paidRentals));
      }
    } catch (e) {
      console.error('更新已支付租赁记录失败:', e);
    }
  }
}

const walletService = new WalletService();
export default walletService; 