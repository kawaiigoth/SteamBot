const DAL = require('../DAL'),
    User = require('../Models/user'),
    Offer = require('../Models/offer'),
    BotManager = require("../Bot/bot-manager"),
    loger = require('../libs/loger')(module);

let instance = null;
class BL {
    constructor() {
        if (!instance) {
            instance = this;
            this.dal = new DAL();
            this.BM = undefined;
            this._startBotManager();

        }

        return instance;
    }

    _addBotEvents(BM){
        this.BM.on('TradeAccepted', (offer) => {
            this.getUserByID(offer.partner.getSteamID64(), (user, error) => {
                if (error) {
                    loger.error(error);
                } else {
                    if(offer.itemsToGive.length >0){
                        loger.info("Ключи отданы ", offer.itemsToGive.length)
                    }
                    if(offer.itemsToReceive.length >0){
                        loger.info("Ключи получены", offer.itemsToReceive.length)
                    }
                    user.balance = user.balance + offer.itemsToReceive.length - offer.itemsToGive.length;
                    this._updateUser(user, (result, error) => {
                        if (error) {
                            loger.error(error);
                        }
                    });
                }
            });
        }); // изменение пользователя ( баланса ) после того как бот сообщить о успешной сделке
        this.BM.on('pollData', (data) => {
            loger.info("on PollData", data);
            this.dal.updatePolldata(data,(result,error)=>{
                if (error){
                    loger.error(error);
                } else {
                    loger.info(result);
                }
            })
        });
    }

    _startBotManager(){
        this.dal.loadBotData((result,error) =>{
            if (error) {
                loger.error(error);
            } else {
                this.BM = new BotManager(result);
                this._addBotEvents();
            }
        });

    }

    _getTimestamp(date) {
        let d = date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDate() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
        return d;
    } // получить время в подоходящем для postgre формате

    login(user,done) {
        let _user = new User(user.id, 0, 0, user.displayName, this._getTimestamp(new Date()), this._getTimestamp(new Date()), "", undefined);
        this.dal.createUser(_user, (result, error) => {
            if (error) {
                loger.error(error);
                done(null, error);
            } else {
                done(result);
            }
        });
    }  // Функция авторизации/ регистрации( есл юзера нет)

    _updateUser(user, done) {
        this.dal.updateUser(user, (result, error) => {
            if (error) {
                loger.error(error);
                done(null, error);
            } else {
                done(result);
            }
        })
    } // Функция  изменения параметров пользователя.

    getUserByID(user_id, done) {
        loger.info("ID: ", user_id);
        this.dal.getUserByID(user_id, (user, error) => {
            if (error) {
                loger.error("BL get user byid : ", error);
                done(null, error);
            } else {
                let _user = new User (user.user_id,user.balance,user.locked_balance,user.nickname,user.reg_date,user.login_date,user.tradelink, user.status);
                done(_user);
            }
        })
    } // Получения пользователя по его СтимАйди

    createOffer(offerData, user, done) {
        let data = {
            user_id: user,
            offer_type: offerData.offer_type,
            keys: offerData.keys,
            cost: offerData.cost,
            currency: offerData.currency
        };
        this.dal.createOffer(data, function (result, error) {
            if (error) {
                done(null, error);
            }
            else {
                done(result);
            }

        });

    } // Создание оффера на сайте ( продать или купить )

    createTrade(tradeData,user,done){
        //TODO here
        let data = {
            user_id: user,
            offer_type: offerData.offer_type,
            keys: offerData.keys,
            cost: offerData.cost,
            currency: offerData.currency
        };

        this.dal.createTrade(data, function (result, error) {
            if (error) {
                done(null, error);
            }
            else {
                done(result);
            }

        });
    }

    _holdItems(user,amount){
        //TODO here
    }

    takeKeys(data, user, done) {
        let credits = data.cur;
        let user_id = user.user_id;
        this.getUserByID(user_id, (user, error) => {
            if (error) {
                loger.error( "takeKeys Error : ",error);
                done(null, error);
            } else {
                this.BM.takeKeyes(credits, user, (result, error) => {
                    if (result) {
                        done(result);
                    } else {
                        loger.error( "takeKeys Error : ",error);
                        done(null, error);
                    }
                });
            }
        });
    }  // Функция находит пользоваетля и кидаем ему предложение отдать ключи.

    giveKeys(data, user, done) {
        let credits = data.cur;
        let user_id = user.user_id;
        this.getUserByID(user_id, (user, error) => {
            if (error) {
                loger.error( "takeKeys Error : ",error);
                done(null, error);
            } else {
                loger.info("1");
                this.BM.giveKeyes(credits, user, (result, error) => {
                    if (result) {
                        done(result);
                    } else {
                        loger.error( "give keys Error : ",error);
                        done(null, error);
                    }
                });
            }
        });
    }  // Функция находит пользоваетля и кидаем ему предложение получить ключи.

    findAndUpdateUser(user_id, user_data, done) {
        loger.info(user_data);
        this.getUserByID(user_id, (user, error) => {
            if (error) {
                loger.error("find and update eroor : ",error);
                done(null, error);
            } else {
                user.tradelink = user_data.tradelink;
                this._updateUser(user, (result, error) => {
                    if (error) {
                        loger.error("find and update eroor : ",error);
                        done(null, error);
                    } else {
                        done(result);
                    }
                })
            }
        })
    }  // функция поиска и вызова updateUser.

    getOffers(type, done) {
        if (type === "sell" || type === "buy") {
            this.dal.getOffers(type, (result, error) => {
                if (error) {
                    loger.error(error);
                    done(null, error);
                } else {
                    done(result.map((offer) => {
                        let link = "http://steamcommunity.com/profiles/" + offer.user_id;
                        loger.info(offer);
                        return new Offer(offer.offer_id,offer.user_id, link, offer.owner_name, offer.cost, offer.currency, offer.keys)
                    }));
                }
            });
        } else {
            let err = {
                message: "Wrong type!"
            };
            done(null, err);
        }
    }  // получение массива  офферов

    getOffer(id, done) {
        this.dal.getOffer(id, (result, error) => {
            if (error) {
                loger.error(error);
                done(null, error);
            } else {
                let link = "http://steamcommunity.com/profiles/" + result.user_id;
                let offer = new Offer(result.offer_id,result.user_id, link, result.owner_name, result.cost, result.currency, result.keys,result.offer_type);
                done(offer);
            }
        });
    }  // получение оффера по его ID

}


module.exports = BL;