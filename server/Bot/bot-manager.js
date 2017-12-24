const SteamTotp = require('steam-totp'),
    SteamBot = require('./steam-bot'),
    my_error = require('../libs/customErrors'),
    loger = require('../libs/loger')(module),
    EventEmitter = require('events').EventEmitter;

var logOnOptions, manager, identity;

class Bot_Manager extends EventEmitter {
    constructor(data) {
        super();
        this.Bots = [];
        for (let i = 0; i < data.length; i += 1) {
            let BotOpt = [
                logOnOptions = {
                    accountName: data[i].login,
                    password: data[i].password,
                    twoFactorCode: SteamTotp.generateAuthCode(data[i].mafile.shared_secret)
                },
                manager = {
                    domain: "localhost.com",
                    language: 'en',
                    cancelTime: 900000,  //Исходящее предложение автоматечески отменится через 15 минут
                    pollData: data[i].pollData
                },
                identity = data[i].mafile.identity_secret
            ];
            let Bot = new SteamBot(BotOpt);
            loger.info("Authcode for" + data[i].login + " ",SteamTotp.generateAuthCode(data[i].mafile.shared_secret));
            this.Bots.push(Bot);
        }
        this.Bots.forEach((Bot, i, arr) => {
            Bot.login();
            Bot.on('accepted', (offer) => {
                this.emit('TradeAccepted', offer);
            });
            Bot.on('declined', (offer) => {
                this.emit('TradeDeclined', offer);
            });
            Bot.on('pollData', (data) => {
                this.emit('pollData', data);
            });
        });

    }

    _takeBotLoop(i, credits, user, done, completed) {


        if (i < this.Bots.length) {
            let Bot = this.Bots[i];
            Bot.tradeOffer(user.tradelink, credits, 730, 2, "buy", (result, error) => {
                if (error) {
                    let error = new my_error("1_2_72", "Ошибка покупки", "Бот не может провести данную операцию", "bot-manager + takeBotLoop + tradeOffer", error);
                    loger.error(error);
                    this._takeBotLoop(i + 1, credits, user, done)
                } else {
                    done(result);
                    loger.info("------------END___TAKEBOTLOOP------------------");
                }
            });
        } else {
            let error = new my_error("1_2_71", "Ошибка продажи", "Ни один бот не может провести эту операцию", "bot-manager + takeBotLoop");
            loger.error(error);
            done(null, error);
            loger.info("------------END_WITH ERROR__GIVEBOTLOOP------------------");
        }

    }

    _giveBotLoop(i, credits, user, done, completed) {


        if (i < this.Bots.length) {
            let Bot = this.Bots[i];
            Bot.tradeOffer(user.tradelink, credits, 730, 2, "sell", (result, err) => {
                if (err) {
                    let error = new my_error("1_2_72", "Ошибка продажи", "Бот не может провести данную операцию", "bot-manager + giveBotLoop + tradeOffer", err);
                    loger.error(error);
                    this._giveBotLoop(i + 1, credits, user, done)
                } else {
                    done(result);
                    loger.info("------------END___GIVEBOTLOOP------------------");
                }
            });
        } else {
            let error = new my_error("1_2_71", "Ошибка продажи", "Ни один бот не может провести эту операцию", "bot-manager + giveBotLoop");
            loger.error(error);
            done(null, error);
            loger.info("------------END_WITH ERROR__GIVEBOTLOOP------------------");
        }

    }

    takeKeyes(credits, user, done) {
        this._takeBotLoop(0, credits, user, done);
    }

    giveKeyes(credits, user, done) {
        loger.info("------------START__GIVEBOTLOOP------------------");
        this._giveBotLoop(0, credits, user, done)
    }
}

module.exports = Bot_Manager;










