const SteamUser = require('steam-user'),
    SteamTotp = require('steam-totp'),
    loger = require('../libs/loger')(module),
    my_error = require('../libs/customErrors'),
    eResult = require('./eResult'),
    EventEmitter = require('events').EventEmitter,
    SteamCommunity = require('steamcommunity'),
    TradeOfferManager = require('steam-tradeoffer-manager'),
    SteamID = TradeOfferManager.SteamID,
    jsonfile = require('jsonfile'),
    file = '../server/Bot/poll.json';

const key_classes = new Set([
    186150629, 259019412, 992003613,
    638243112, 186150630, 927007517,
    613589848, 360448780, 1544098059,
    1797358487, 1293510722, 721248158,
    506856210, 1432182528, 1923058752
]);

class steam_bot extends EventEmitter {

    constructor(options) {
        super();
        this.client = new SteamUser();
        this.community = new SteamCommunity();
        this.logOnOptions = options[0];

        this.manager = new TradeOfferManager({
            steam: this.client,
            domain: options[1].domain,
            community: this.community,
            language: options[1].language,
            cancelTime: options[1].cancelTime,  //Исходящее предложение автоматечески отменится через 15 минут
            pollData: options[1].pollData || undefined
        });

        this.identity = options[2];


        this.client.on('loggedOn', (details) => {
            loger.info('Logged into Steam: ', details);
            this.client.setPersona(SteamUser.Steam.EPersonaState.Online);
        });

        this.client.on('error', (err) => {
            let error = new my_error("1_2_98", "Big bad error: " + err.eresult, "Emitted when an error occurs during logon." +
                " Also emitted if we're disconnected and autoRelogin is either disabled, or it's a fatal disconnect. ",
                "steam-bot.js + constructor", err);
            loger.error(error);
        });

        this.client.on('disconnected', (err, msg) => {
            let error = new my_error(err, "Disconnected from server", msg, "steam-bor.js + constructor");
            loger.error(error);
        });

        this.client.on('webSession', (sessionid, cookies) => {
            var self = this;
            this.manager.setCookies(cookies, function (err) {
                if (err) {
                    let error = new my_error("1_2_99", "Failed to set cookies", err.cause, "steam-bor.js + constructor", err);
                    loger.error(error);
                }
            });
            self.community.setCookies(cookies);
            self.community.startConfirmationChecker(10000, self.identity);
            self.emit('READY');
        });

        this.client.on('friendRelationship', (steamid, relationship) => {
            if (relationship === 2) {
                this.client.removeFriend(steamid);
                loger.info("FRIEND DECLINED");
            }
        });

        this.client.on('groupRelationship', (groupSteamID, relationship) => {
            if (relationship === 2) {
                this.client.respondToGroupInvite(groupSteamID, false);
            }
        });

        this.manager.on('sentOfferChanged', (offer, oldState) => {
            loger.info("Now trade with " + offer.partner);
            if (offer.state === 1) {
                this.emit('invalid');
                loger.warn("Invalid trade offer", offer);
            } else if (offer.state === 2) {
                this.emit('active');
                loger.info('Trade is active: ', offer);
            } else if (offer.state === 3) {
                this.emit('accepted', offer);
                loger.info('Trade accepted: ', offer);
            } else if (offer.state === 4) {
                loger.info('Trade countered - decline it: ', offer);
                offer.cancel((err) => {
                    loger.error(err)
                });
                this.emit('countered');
            } else if (offer.state === 5) {
                this.emit('expired');
                loger.info('Trade expired: ', offer);
            } else if (offer.state === 6) {
                loger.info('Trade canceled: ', offer);
                this.emit('canceled');
            } else if (offer.state === 7) {
                loger.info('Trade declined: ', offer);
                this.emit('declined', offer);
            } else if (offer.state === 8) {
                loger.warn('Invalid items: ', offer);
                this.emit('invalidItems');
            } else if (offer.state === 9) {
                loger.info('Offer hasnt been sent yet, waiting confirmation : ', offer);
                this.emit('createdNeedsConfirmation');
            } else if (offer.state === 10) {
                loger.info('Either party canceled the offer via email/mobile confirmation : ', offer);
                this.emit('canceledBySecondFactor');
            } else if (offer.state === 11) {
                loger.warn('The trade has been placed on hold : ', offer);
                this.emit('inEscrow');
            } else {
                loger.error('sentOfferChanged - Bug');
            }
        }); // works on polls

        this.manager.on('newOffer', (offer) => {    //Отклонять предложения торговли
            this.client.chatMessage(offer.partner.getSteamID64(), "Sorry, I can't trade with you =(");
            offer.decline((err) => {
                if (err) {
                    loger.error(err);
                } else {
                    loger.info('Canceled offer from user.');
                }
            });
        });

        this.manager.on('unknownOfferSent', (offer) => {
            loger.info('Unknown offer');
        });

        this.manager.on('pollFailure', (err) => {
            loger.warn('Failed  to poll. Check Steam servers', err);
        });

        this.manager.on('pollData', (data) => { // Загружаем poll данные, дабы не получать кучу неизвестных офферов при каждом запуске.
            let sid = this.client.steamID;
            loger.info('LOAD POLL DATA FOR: ', sid.getSteamID64());
            let pollData = {pollData: data, steamid: sid.getSteamID64()};
            this.emit("pollData", pollData);
        })

    }


    _isCSGOKey(item) {
        loger.info("ITEM: ",item.classid);
        let has = key_classes.has(Number(item.classid));
        return has;
    }


    tradeOffer(trade_link, amount, app_id, context_id, tradeType, done) {
        loger.info("------------START___TRADEOFFER------------------");
        let partner = trade_link;
        let appid = app_id;
        let contextid = context_id;
        let self = this;
        let offer = undefined;
        try {
            offer = this.manager.createOffer(partner);
        }
        catch (err) {
            let error = new my_error("1_2_0", "Ошибка создания оффера", "Тредлинк задан не правильно. Пожалуйста задайте верный трейдлинк.", "steam-bot + tradeOffer + createOffer", err);
            loger.error(error);
            done(null, error);
            loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
        }
        if (offer) {
            if (tradeType === "buy") {
                loger.info("------------TRADEOFFER___BUY------------------");
                self.manager.getInventoryContents(appid, contextid, true, (err, myInv) => {
                    if (err) {
                        let error = new my_error("1_2_2", "Ошибка получения ивентаря бота", err.cause, "steam-bot + tradeOffer + getInventoryCContents", err);
                        loger.error(error);
                        done(null, error);
                        loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                    } else if (myInv.length + amount < 1000) {

                        offer.getPartnerInventoryContents(appid, contextid, (err, theirInv, cur) => {
                            if (err) {
                                let error = new my_error("1_2_3", "Ошибка получения инвентаря партнера", err.cause, "steam-bot + tradeOffer + getInvContents", err);
                                loger.error(error);
                                done(null, error);
                                loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                            } else {

                                for (let i = 0; i < theirInv.length; i++) {
                                    if (this._isCSGOKey(theirInv[i])) {
                                        offer.addTheirItem(theirInv[i]);
                                    }
                                }

                                if (offer.itemsToReceive.length < amount) {
                                    let error = new my_error("0_2_1", "Ошибка торговли", "У вас недостаточное колличество ключей", "steam-bot + tradeOffer");
                                    loger.warn(error);
                                    done(null, error);
                                    loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                                } else {
                                    offer.setMessage(`Код подтверждения`);
                                    loger.info("BUY OFFER :     ", offer);
                                    offer.send((err, status) => {
                                        if (err) {
                                            let error = new my_error("1_2_22", "Ошибка отправки оффера", err.cause, "steam-bot + tradeOffer + send", err);
                                            loger.error(error);
                                            done(null, error);
                                            loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                                        } else {
                                            loger.info(`Sent offer. Status: ${status}.`);
                                            done("ok");
                                            loger.info("------------END___TRADEOFFER------------------");
                                        }
                                    });
                                }
                            }
                        });

                    } else {
                        let error = new my_error("1_2_1", "Бот не может совершить трейд.", "У бота недостаточно колличества места в инвентаре", "steam-bot + tradeOffer + buying", err);
                        loger.warn(error);
                        done(null, error);
                        loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                    }
                });
            } else if (tradeType === "sell") {
                loger.info("------------TRADEOFFER___SELL------------------");
                self.manager.getInventoryContents(appid, contextid, true, (err, myInv) => {
                    if (err) {
                        let error = new my_error("1_2_2", "Ошибка получения ивентаря бота", err.cause, "steam-bot + tradeOffer + getInventoryCContents", err);
                        loger.error(error);
                        done(null, error);
                        loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                    } else if (myInv.length - amount >= 0) {
                        for (let i = 0; i < myInv.length && offer.itemsToGive.length != amount; i++) {
                            loger.info("CONDITION: ", i < myInv.length && offer.itemsToGive.length != amount);
                            loger.info("i: ", i, ", InvLen: ", myInv.length, ", itemsgive: ", offer.itemsToGive.length, ", creds: ", amount);
                            if (this._isCSGOKey(myInv[i])) {
                                offer.addMyItem(myInv[i]);
                                loger.info("addMyItem: ", offer.itemsToGive.length);
                            }
                        }
                        if (offer.itemsToGive.length < amount) {
                            let error = new my_error("1_2_21", "Ошибка торговли", "Недостаточное колличество ключей у бота", "steam-bot + tradeOffer");
                            loger.warn(error);
                            done(null, error);
                            loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                        } else {
                            offer.setMessage(`Код подтверждения`);
                            loger.info("SELL OFFER :     ", offer);
                            offer.send((err, status) => {
                                if (err) {
                                    let error = new my_error("1_2_22", "Ошибка отправки оффера", err.cause, "steam-bot + tradeOffer + send", err);
                                    loger.error(error);
                                    done(null, error);
                                    loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                                } else {
                                    loger.info(`Sent offer. Status: ${status}.`);
                                    done("ok");
                                    /*let time = SteamTotp.time();
                                    let confKey = SteamTotp.getConfirmationKey(this.identity, time, "allow");*/
                                   /* this.community.getConfirmations(time, confKey, (err, confirmations) => {
                                        if (err) {
                                            let error = new my_error("1_2_432", "Ошибка получение подверждений", "Проверьте работает ли  аутефикатор бота.  " + err.cause, "steam-bot + tradeOffer + getConf", err);
                                            loger.error(error);
                                            done(null, error);
                                            loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                                        } else {
                                            confirmations.forEach((confirmation) => {
                                                confirmation.respond(time, confKey, true, function (err) {
                                                    if (err) {
                                                        let error = new my_error("1_2_432", "Ошибка подтверждения.", "Проверьте работает ли  аутефикатор бота.  " + err.message, "steam-bot + tradeOffer + respond", err);
                                                        loger.error(error);
                                                        done(null, error);
                                                        loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                                                    } else {
                                                        done("ok");
                                                        loger.info("------------END___TRADEOFFER------------------");
                                                    }
                                                });
                                            })
                                        }
                                    });*/
                                }
                            });
                        }
                    } else {
                        let error = new my_error("1_2_1", "Бот не может совершить трейд.", "У бота недостаточно колличества ключей в инвентаре", "steam-bot + tradeOffer + selling", err);
                        loger.warn(error);
                        done(null, error);
                        loger.info("------------END_WITH ERROR__TRADEOFFER------------------");
                    }
                });
            }
        }

    }

    login() {
        loger.info("LOGIN");
        this.client.logOn(this.logOnOptions);
    }
}


module.exports = steam_bot;
