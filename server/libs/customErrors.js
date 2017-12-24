// Коды ошибок : первое число 0 - ошибка пользователя 1 - ошибка сервера. Второе число 0 - DAL, 1 - BL, 2 - BOT, 3 - Frontend. Дальше идет порядковый номер.
class CustomError {
    constructor(code,name,message,location,trace){
        this.code = code;
        this.name = name;
        this.message = message;
        this.location = location;
        this.trace = trace;
    }

    getCode(){
        return this.code;
    }

    getMessage(){
        return this.message;
    }
}

module.exports = CustomError;