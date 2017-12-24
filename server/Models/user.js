class User {
    constructor(user_id,  balance, locked_balance,  nickname, reg_date, login_date, tradelink,status) {
        this.user_id = user_id;
        this.balance = balance;
        this.locked_balance = locked_balance;
        this.nickname = nickname;
        this.reg_date = reg_date;
        this.login_date = login_date;
        this.tradelink = tradelink? tradelink : "https://steamcommunity.com/tradeoffer/new/?partner=88329676&token=1C9T0A8G";
        this.status = status? status : "common";
    }

}

module.exports = User;