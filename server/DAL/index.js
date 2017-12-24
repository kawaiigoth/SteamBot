const pg = require('pg'),
    loger = require('../libs/loger')(module),
    fs = require('fs'),
    cfg = require('../config'),
    Client = pg.Client;

class DAL {
    constructor() {
        this.config = {
            user: cfg.get('db:user'),
            database: cfg.get('db:database'),
            password: cfg.get('db:password'),
            host: cfg.get('db:host'),
            port: cfg.get('db:port')
        };
    }

    loadBotData(done){
        let bots = [],
            client = new Client(this.config),
            Query = client.query({
                text: 'SELECT "Bot"."SteamID", login, password, mafile, "pollData" FROM "Bot"'
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(bots);
        });

        Query.on('error', function (error) {
            loger.error(error);
            done(null, error);
        });

        Query.on('row', function (row) {
            let bot = { SteamID: row.SteamID, login : row.login, password : row.password, mafile : row.mafile, pollData: row.pollData};
            bots.push(bot);
        });

        client.connect();
    }

    getUserByID(SteamID, done) {
        let user = undefined,
            client = new Client(this.config),
            Query = client.query({
                text: 'SELECT  balance, locked_balance, locked_balance, nickname,' +
                ' reg_date, login_date, tradelink, status FROM public."User" WHERE steamid=$1;',
                values: [SteamID]
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(user);
        });

        Query.on('error', function (err) {
            loger.error("Get User By ID Error: ", err);
            done(null, err);
        });

        Query.on('row', function (row) {
            user = {
                user_id: SteamID,
                balance: row.balance,
                locked_balance: row.locked_balance,
                nickname: row.nickname,
                reg_date: row.reg_date,
                login_date: row.login_date,
                tradelink: row.tradelink,
                status : row.status
            };
        });

        client.connect();


    } // READ USER

    getUsers() {
    } // READ USERS

    getOffer(id,done) {
        let offer = undefined,
            client = new Client(this.config),
            Query = client.query({
                text: 'SELECT  "trade_offers".offer_type, "trade_offers".user_id, "trade_offers".keys,' +
                ' "trade_offers".cost, "trade_offers".currency, "User".nickname, "User".steamid FROM public."trade_offers"' +
                'INNER JOIN "User" ON "trade_offers".user_id = "User".steamid  WHERE "trade_offers".id=$1;',
                values: [id]
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(offer);
        });

        Query.on('error', function (error) {
            loger.error(error);
            done(null, error);
        });

        Query.on('row', function (row) {
            offer = { offer_type: row.offer_type, user_id: row.user_id, offer_id : row.id, link : "", owner_name : row.nickname, cost : row.cost, currency : row.currency, keys : row.keys};
        });

        client.connect();
    } //READ OFFER

    getOffers(condition, done) {
        let offers = [],
            client = new Client(this.config),
            Query = client.query({
                text: 'SELECT  "trade_offers".id, "trade_offers".user_id, "trade_offers".keys,' +
                ' "trade_offers".cost, "trade_offers".currency, "User".nickname, "User".steamid FROM public."trade_offers"' +
                'INNER JOIN "User" ON "trade_offers".user_id = "User".steamid  WHERE offer_type=$1;',
                values: [condition]
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(offers);
        });

        Query.on('error', function (error) {
            loger.error(error);
            done(null, error);
        });

        Query.on('row', function (row) {
            let offer = { user_id: row.user_id, offer_id : row.id, link : "", owner_name : row.nickname, cost : row.cost, currency : row.currency, keys : row.keys};
            offers.push(offer);
        });

        client.connect();

    } // READ OFFERS

    createOffer(data, done) {
        console.log(data);
        let client = new Client(this.config),
            Query = client.query({
                text: "INSERT INTO " + '"trade_offers"' + " (user_id,offer_type,keys,cost,currency)  VALUES ($1,$2,$3,$4,$5)",
                values: [data.user_id, data.offer_type, data.keys, data.cost, data.currency]

            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(result);
        });

        Query.on('error', function (error) {
            loger.error(error);
            done(null, error);
        });

        client.connect();
    }  // CREATE OFFER

    createUser(user, done) {
        let client = new Client(this.config),
            Query = client.query({
                text: "INSERT INTO " + '"User"' + " (steamid,balance,locked_balance,status,reg_date,login_date,nickname)  VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (steamid) DO UPDATE SET  login_date=$6",
                values: [user.user_id, user.balance, user.locked_balance, user.status, user.reg_date, user.login_date, user.nickname]

            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(result);
        });

        Query.on('error', function (error) {
            loger.error(error);
            done(null, error);
        });
        client.connect();
    } //CREATE OR UPDATE(logindate) USER

    updateOffer() {
    }//UPDATE OFFER

    updatePolldata(data,done){
        let client = new Client(this.config),
            Query = client.query({
                text: 'UPDATE "Bot" SET "pollData"=$2 WHERE "SteamID"=$1 ',
                values: [data.steamid,data.pollData]
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(result);
        });


        Query.on('error', function (err) {
            loger.error(err);
            done(null, err);
        });
        client.connect();
    }

    updateUser(user, done) {
        let client = new Client(this.config),
            Query = client.query({
                text: 'UPDATE "User" SET balance=$2, locked_balance=$3, nickname=$4,' +
                'tradelink=$5, status=$6 WHERE steamid=$1 ',
                values: [user.user_id, user.balance, user.locked_balance, user.nickname, user.tradelink, user.status]
            });
        client.on('drain', function () {
            client.end.bind(client);
        });

        Query.on('end', function (result) {
            done(result);
        });


        Query.on('error', function (err) {
            loger.error(err);
            done(null, err);
        });
        client.connect();
    } //UPDATE USER
}

module.exports = DAL;